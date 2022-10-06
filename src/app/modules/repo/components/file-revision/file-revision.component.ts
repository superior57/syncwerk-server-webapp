import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { Select2OptionData } from 'ng2-select2';
import { FilesService, NotificationService } from '@services/index';

@Component({
  selector: 'app-file-revision',
  templateUrl: './file-revision.component.html',
  styleUrls: ['./file-revision.component.scss']
})
export class FileRevisionComponent implements OnInit {
  currentRepo = '';
  currentFilePath = '';
  revisionData: any = {};
  numberOfDays = 7;
  pageStatus = {
    isGettingData: true,
    isError: true,
    errorMessage: '',
  };
  select2Time: Array<Select2OptionData> = [];
  timeOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fileService: FilesService,
    private noti: NotificationService,
    private location: Location,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(param => {

      this.currentRepo = param.get('repoID');
    });
    this.activatedRoute.queryParamMap.subscribe(param => {
      this.currentFilePath = param.get('p');
    });
    this.loadData();
  }

  async loadData() {
    await this.getFileRevisions();
    this.select2Time = [
      { id: '7', text: this.translate.instant('REVISION.A_WEEK') },
      { id: '30', text: this.translate.instant('REVISION.A_MONTH') },
      { id: '-1', text: this.translate.instant('REVISION.ALL') }
    ];
  }

  getFileRevisions(): Promise<any> {
    return new Promise(resolve => {
      this.fileService.getFileRevisions(this.currentRepo, this.currentFilePath, this.numberOfDays).subscribe(
        resp => {
          this.revisionData = resp.data;
          this.pageStatus.isGettingData = false;
          this.pageStatus.isError = false;
          resolve();
        },
        error => {
          this.pageStatus.isGettingData = false;
          this.pageStatus.isError = true;
          this.pageStatus.errorMessage = 'No revision found.';
          resolve();
        });
    });
  }

  goBack() {
    this.location.back();
  }

  changeDuration($event) {
    this.getFileRevisions();
  }

  getHistoryDownloadLink(rev) {
    this.fileService.getHistoryDownloadLink(this.currentRepo, rev.rev_file_id).subscribe(resp => {
      window.location.href = `${resp.data.download_link}${this.revisionData.u_filename}`;
    });
  }

  restoreFileVersion(rev) {
    const commitId = rev.id;
    const path = rev.path;
    const type = 'file';
    this.fileService.restoreHistorySnapShot(this.currentRepo, commitId, type, path)
      .subscribe(resp => {
        this.noti.showNotification('success', `Successfully restored ${this.revisionData.u_filename}`);
        this.getFileRevisions();
      });
  }


  goToPreview(rev) {
    const routeForNavigate = `/repo/${this.revisionData.repo_id}/history/files`;
    this.router.navigate([routeForNavigate], {
      queryParams: {
        p: rev.path,
        obj_id: rev.rev_file_id,
        commit_id: rev.id
      }
    });
  }

  goToDiff(rev) {
    this.router.navigate(['repo', 'text-diff', this.revisionData.repo_id], {
      queryParams: {
        p: rev.path,
        commit: rev.id
      }
    });
  }

  openItem(path, index) {
    if (index === this.revisionData.zipped.length - 1) {
      this.router.navigate(['preview', this.revisionData.repo_id], {
        queryParams: {
          p: this.revisionData.path,
        }
      });
    } else {
      const routeForNavigate = `/folders/${this.revisionData.repo_id}${path[1]}`;
      this.router.navigate([routeForNavigate]);
    }
  }

  goToProfile(rev) {
    this.router.navigate(['user', 'profile', rev.creator.email]);
  }

  handleString(string: string) {
    if (string.length > 25) {
      const cutHeadString = string.substring(0, 20);
      const cutEndString = string.substring(string.length - 5, string.length);
      return cutHeadString + ' ... ' + cutEndString;
    } else {
      return string;
    }
  }

  onChoosenLanguage() {
    setTimeout(() => {
      this.select2Time = [
        { id: '7', text: this.translate.instant('REVISION.A_WEEK') },
        { id: '30', text: this.translate.instant('REVISION.A_MONTH') },
        { id: '-1', text: this.translate.instant('REVISION.ALL') }
      ];
    }, 200);
  }
}
