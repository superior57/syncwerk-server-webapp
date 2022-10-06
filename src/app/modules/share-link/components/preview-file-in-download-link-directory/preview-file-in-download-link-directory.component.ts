import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShareLinkService } from '@services/index';
import {SharedService} from '@services/shared.service';

@Component({
  selector: 'app-preview-file-in-download-link-directory',
  templateUrl: './preview-file-in-download-link-directory.component.html',
  styleUrls: ['./preview-file-in-download-link-directory.component.scss']
})
export class PreviewFileInDownloadLinkDirectoryComponent implements OnInit {

  token: string;
  path: string;
  hasAudit: boolean;
  hasPasswordProtected: boolean;
  dataDownload: any;
  isPageNotFound: boolean;
  maTheme: string = this.sharedService.maTheme;
  constructor(
    private activatedRoute: ActivatedRoute,
    private shareLinkService: ShareLinkService,
    private sharedService: SharedService
  ) {
    sharedService.maThemeSubject.subscribe((value) => {
      this.maTheme = value;
    });
    this.activatedRoute.params.subscribe(params => this.token = params['token']);
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(queryParamMap => {
      this.path = queryParamMap.get('p');
      this.isPageNotFound = false;
      this.previewFileShareLinkDir();
    });
  }

  previewFileShareLinkDir() {
    this.shareLinkService.getPreviewFileShareLinkDir(this.token, this.path).subscribe(resps => {
      resps.data.is_from_shared_folder = true;
      this.hasAudit = resps.data.share_link_audit;
      if (!resps.data.share_link_audit) { this.checkPasswordProtected(resps.data); }
    }, error => this.handleErrorPreviewFile(error));
  }

  handleErrorPreviewFile(error) {
    console.error(error);
    const status = error.status;
    switch (status) {
      case 404: this.isPageNotFound = true; break;
      default: break;
    }
  }

  receiveDataAuditSuccess(data: any) {
    this.hasAudit = data.share_link_audit;
    this.checkPasswordProtected(data);
  }

  checkPasswordProtected(data: any) {
    this.hasPasswordProtected = data.password_protected;
    if (!data.password_protected) { this.dataDownload = data; }
  }

  receiveDataPassProtectedSuccess(data: any) {
    this.checkPasswordProtected(data);
  }
}
