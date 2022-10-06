import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Type, Action } from '@enum/index.enum';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { NotificationService, ShareLinkService, MessageService, NonAuthenticationService } from '@services/index';
import { DropzoneComponent, DropzoneDirective, DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { SharedService } from "@services/shared.service";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-share-upload-link',
  templateUrl: './share-upload-link.component.html',
  styleUrls: ['./share-upload-link.component.scss']
})
export class ShareUploadLinkComponent implements OnInit {
  private subscription: Subscription;
  @ViewChild(DropzoneComponent) componentRef: DropzoneComponent;
  @Input() hasPassword: boolean;
  public configShareUploadLink: DropzoneConfigInterface = {
    url: 'http://localhost/seafhttp/upload-api/',
    autoProcessQueue: false,
    autoQueue: false,
    addRemoveLinks: true,
    maxFilesize: 0,
    // maxThumbnailFilesize: 100,
    timeout: 0,
    dictRemoveFile: '',
    dictCancelUpload: '',
    clickable: true,
    init: function() {
      this.on('processing', function(file) {
        if (file.size > file.max_size_upload) {
          this.options.dictUploadCanceled = file.max_size_error_message;
          this.cancelUpload(file);
        } else if (file.owner_storage_usage + file.size > file.owner_storage_quota) {
          this.options.dictUploadCanceled = file.out_of_quota_error_message;
          this.cancelUpload(file);
        }
      });
    }
  };
  dataShareUploadLink: any;
  files = [];
  processedFiles = [];
  isError: boolean;
  token: string;
  repoID: string;
  isPageNotFound = false;
  hasAudit: boolean;
  hasPasswordProtected: boolean;
  params: any;
  maTheme: string = this.sharedService.maTheme;

  constructor(
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private shareLinkService: ShareLinkService,
    private messageService: MessageService,
    private noti: NotificationService,
    private router: Router,
    private sharedService: SharedService,
    private translateService: TranslateService,
    private nonAuthService: NonAuthenticationService
  ) {
    sharedService.maThemeSubject.subscribe((value) => {
      this.maTheme = value;
    });
    this.route.params.subscribe(params => {
      this.token = params['token'];
      this.getDetail(this.token);
    });
  }

  ngOnInit() {
    this.isError = false;
  }

  getDetail(token: string) {
    this.shareLinkService.getShareUploadLinkDetail(token)
      .subscribe(resps => {
        this.hasAudit = resps.data.share_link_audit;
        if (!resps.data.share_link_audit) { this.checkPasswordProtected(resps.data); }
      }, error => {
        console.error(error);
        const status = error.status;
        switch (status) {
          case 404: this.isPageNotFound = true; break;
          default: break;
        }
      });
  }

  checkPasswordProtected(data: any) {
    this.hasPasswordProtected = data.password_protected;
    if (!data.password_protected) { this.dataShareUploadLink = data; }
  }

  onAddedfile(file) {
    this.files.push(file);
  }

  onQueueComplete(args) {
    if (!this.isError) {
      this.noti.showNotification('success', this.translateService.instant('UPLOAD_FILES_FOLDERS.UPLOADED'));
      this.componentRef.directiveRef.reset();
    }
  }

  onComplete(args) {
    if (args.status === 'success') {
      const uploadPath = args.fullPath ? this.dataShareUploadLink.path + this.getRelativePath(args.fullPath) : this.dataShareUploadLink.path;
      const fileName = JSON.parse(args.xhr.response)[0].name;
      this.nonAuthService.getNotifyUploadFileDone(fileName, this.dataShareUploadLink.repo_id, this.token, uploadPath).subscribe(resp => {});
      this.processedFiles.push(args);
      if (this.files.length > 0) { this.upload(); }
    } else {
      this.isError = true;
      if (this.files.length > 0) { this.upload(); }
    }

  }

  upload() {
    if (this.files.length > 0) {
      const currentFile = this.files.shift();
      this.getShareUploadLink(currentFile);
    } else {
      this.noti.showNotification('danger', this.translateService.instant('UPLOAD_FILES_FOLDERS.NO_FILE_EXISTS_TO_UPLOAD'));
    }
  }

  getShareUploadLink(currentFile) {
    this.shareLinkService.getShareUploadLink(this.dataShareUploadLink.token, this.dataShareUploadLink.repo_id)
      .subscribe(resp => {
        currentFile.owner_storage_quota = resp.data.storage_quota;
        currentFile.owner_storage_usage = resp.data.storage_usage;
        currentFile.out_of_quota_error_message = this.translateService.instant('UPLOAD_FILES_FOLDERS.OUT_OF_QUOTA');
        currentFile.max_size_upload = resp.data.max_upload_file_size;
        currentFile.max_size_error_message = this.translateService.instant('UPLOAD_FILES_FOLDERS.FILE_SIZE_TOO_LARGE', {max_size: currentFile.max_size_upload / 1024 / 1024});
        this.handleUploadLink(resp.data.url, currentFile);
      }, error => console.error(error));
  }

  handleUploadLink(url: string, file: any) {
    const dropzone = this.componentRef.directiveRef.dropzone;
    dropzone.options.url = `${url}?ret-json=1`;
    dropzone.options.headers = {
      'Cache-Control': null,
      'X-Requested-With': null,
    };
    dropzone.options.params = { 'parent_dir': this.dataShareUploadLink.path };
    if ('fullPath' in file) { dropzone.options.params.relative_path = this.getRelativePath(file.fullPath); }
    dropzone.enqueueFile(file);
    dropzone.processQueue();
  }

  getRelativePath(path: string) {
    const relativePath = path.split('/');
    relativePath.pop();
    return relativePath.join('/') + '/';
  }

  receiveDataAuditSuccess(data) {
    this.hasAudit = data.share_link_audit;
    this.checkPasswordProtected(data);
  }

  receiveDataPassProtectedSuccess(data) {
    this.checkPasswordProtected(data);
  }
}
