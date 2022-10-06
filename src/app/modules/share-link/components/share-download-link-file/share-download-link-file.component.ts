import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService, ShareLinkService } from '@services/index';
import { SharedService } from '@services/shared.service';

@Component({
  selector: 'app-share-download-link-file',
  templateUrl: './share-download-link-file.component.html',
  styleUrls: ['./share-download-link-file.component.scss']
})
export class ShareDownloadLinkFileComponent implements OnInit {
  token: string;
  dataDownload: any;
  isDirectLink: boolean;
  isPageNotFound = false;
  hasAudit: boolean;
  hasPasswordProtected: boolean;
  maTheme: string = this.sharedService.maTheme;

  constructor(
    private route: ActivatedRoute,
    private shareLinkService: ShareLinkService,
    private router: Router,
    private noti: NotificationService,
    private sharedService: SharedService
  ) {
    this.sharedService.maThemeSubject.subscribe((value) => {
      this.maTheme = value;
    });
    this.route.queryParams.subscribe(params => {
      if ('dl' in params) { this.isDirectLink = true; }
    });
    this.route.params.subscribe(params => {
      this.token = params['token'];
      this.getShareLinkFile();
    });
  }

  ngOnInit() { }

  getShareLinkFile() {
    this.shareLinkService.getShareDownloadLinkFile(this.token)
      .subscribe(resps => {
        this.hasAudit = resps.data.share_link_audit;
        if (!resps.data.share_link_audit) { this.checkPasswordProtect(resps.data); }
      }, error => {
        console.error(error);
        const status = error.status;
        switch (status) {
          case 404: this.isPageNotFound = true; break;
          default: break;
        }
      });
  }

  checkPasswordProtect(data: any) {
    this.hasPasswordProtected = data.password_protected;
    if (!data.password_protected) {
      if (this.isDirectLink) {
        this.shareLinkService.getShareDownloadLinkFileDownloadLink(this.token).subscribe(resp => {
          window.location.href = resp.data.dl_url;
        });
      } else {
        this.dataDownload = data;
      }
    }
  }

  receiveDataAuditSuccess(data) {
    this.hasAudit = data.share_link_audit;
    this.checkPasswordProtect(data);
  }

  receiveDataPassProtectedSuccess(data) {
    this.checkPasswordProtect(data);
  }
}
