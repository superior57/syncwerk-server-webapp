import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { FilesService, NotificationService, I18nService } from '@services/index';


@Component({
  selector: 'app-file-diff',
  templateUrl: './file-diff.component.html',
  styleUrls: ['./file-diff.component.scss']
})
export class FileDiffComponent implements OnInit {

  currentRepo = '';
  currentFilePath = '';
  currentCommit = '';
  diffData: any = {
    prev_commit: {}
  };
  pageStatus = {
    isGettingData: true,
    isError: true,
    errorMessage: '',
  };
  choosenLanguage = 'en';

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fileService: FilesService,
    private noti: NotificationService,
    private location: Location,
    private i18nService: I18nService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.choosenLanguage = this.i18nService.getLanguage();
    this.translate.use(this.choosenLanguage);
    this.activatedRoute.paramMap.subscribe(param => {
      this.currentRepo = param.get('repoID');
    });
    this.activatedRoute.queryParamMap.subscribe(param => {
      this.currentFilePath = param.get('p');
      this.currentCommit = param.get('commit');
    });
    this.getFileDiff(this.currentRepo, this.currentFilePath, this.currentCommit);
  }

  getFileDiff(repoID, path, commitID) {
    this.fileService.getFileDiff(repoID, path, commitID).subscribe(
      resp => {
        this.diffData = resp.data;
        this.pageStatus.isGettingData = false;
        this.pageStatus.isError = false;
      },
      error => {
        this.pageStatus.isGettingData = false;
        this.pageStatus.isError = true;
        this.pageStatus.errorMessage = 'Diff not found';
      });
  }

  goBack() {
    this.location.back();
  }

  openItem(path, index) {
    if (index === this.diffData.zipped.length - 1) {
      this.router.navigate(['preview', this.diffData.repo_id], {
        queryParams: {
          p: this.diffData.path,
        }
      });
    } else {
      const routeForNavigate = `/folders/${this.diffData.repo_id}${path[1]}`;
      this.router.navigate([routeForNavigate]);
    }
  }

  goToProfile(rev) {
    this.router.navigate(['user', 'profile', this.diffData.current_commit.contact_email]);
  }

}
