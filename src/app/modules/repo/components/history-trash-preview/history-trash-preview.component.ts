import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';

import { Select2OptionData } from 'ng2-select2';
import { FilesService, CodeMirrorService, NotificationService, I18nService, NonAuthenticationService, AuthenticationService, AdminService } from '@services/index';

declare var DocsAPI: any;
@Component({
  selector: 'app-history-trash-preview',
  templateUrl: './history-trash-preview.component.html',
  styleUrls: ['./history-trash-preview.component.scss']
})
export class HistoryTrashPreviewComponent implements OnInit {
  currentRepoID = '';
  currentFilePath = '';
  currentRevFileID = '';
  currentCommitID = '';
  fileDetails: any = {
    current_commit: {}
  };

  configDict: any = {};
  currentLoginUser: any = {};

  showDownloadButton = false;
  showCodeMirrorPreview = false;
  showMarkdownPreview = false;
  showImagePreview = false;
  showPDFPreview = false;
  showAudioPreview = false;
  showVideoPreview = false;
  showOfficePreview = false;

  codeMirrorConfig = {
    lineNumbers: true,
    readOnly: true,
    cursorBlinkRate: -1,
    height: 'auto',
    scrollbarStyle: 'null',
    mode: ''
  };

  typePreview: string;

  choosenLanguage = 'en';
  select2Encode: Array<Select2OptionData> = [];
  encodeOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };

  logoURL = '';
  logoTooltip = '';
  userAvtUrl = '';
  allowRetryToGetLogo = true;

  officeEditor: any = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private codeMirrorService: CodeMirrorService,
    private fileService: FilesService,
    private noti: NotificationService,
    private i18nService: I18nService,
    private translate: TranslateService,
    private nonAuthenService: NonAuthenticationService,
    private authService: AuthenticationService,
  ) { }

  ngOnInit() {
    this.choosenLanguage = this.i18nService.getLanguage();
    this.translate.use(this.choosenLanguage);
    this.activatedRoute.url.subscribe(params => {
      this.typePreview = params[1].path;
    });
    this.activatedRoute.paramMap.subscribe(param => {
      this.currentRepoID = param.get('repoID');
    });
    this.activatedRoute.queryParamMap.subscribe(param => {
      this.currentFilePath = param.get('p');
      this.currentRevFileID = param.get('obj_id');
      this.currentCommitID = param.get('commit_id');
    });
    // this.authService.userInfo().subscribe(resps => {
    //   this.currentLoginUser = resps.data;
    //   if (!this.fileDetails.onlyoffice_info || !this.configDict.ENABLE_ONLYOFFICE) {
    //     this.configureComponentDisplay(this.fileDetails.filetype, this.fileDetails.fileext);
    //   } else {
    //     this.configOfficePreviewDisplay(this.fileDetails);
    //   }
    // });
    this.nonAuthenService.getRestapiSettingsByKeys('ENABLE_ONLYOFFICE,ONLYOFFICE_APIJS_URL').subscribe(resp => {
      console.log('settings', resp);
      this.configDict = resp.data.config_dict;
      this.getHistoryPreview();
    });
  }

  getHistoryPreview() {
    this.fileService.getFileRevisionPreview(this.currentRepoID, this.currentRevFileID, this.currentCommitID, this.currentFilePath)
      .subscribe(resp => {
        this.fileDetails = resp.data;
        if (typeof (this.fileDetails.file_encoding_list) !== 'undefined') {
          for (const encode of this.fileDetails.file_encoding_list) {
            this.select2Encode.push({
              id: encode,
              text: encode
            });
          }
        }
        if (!this.fileDetails.onlyoffice_info || !this.configDict.ENABLE_ONLYOFFICE) {
          this.configureComponentDisplay(this.fileDetails.filetype, this.fileDetails.fileext);
        } else {
          this.configOfficePreviewDisplay(this.fileDetails);
        }
      });
  }

  private loadScript(scriptUrl: string) {
    return new Promise((resolve, reject) => {
      const scriptElement = document.createElement('script');
      scriptElement.src = scriptUrl;
      scriptElement.onload = resolve;
      document.body.appendChild(scriptElement);
    });
  }

  async configOfficePreviewDisplay(fileDetails) {
    await this.loadScript(this.fileDetails.onlyoffice_info.ONLYOFFICE_APIJS_URL);
    this.showOfficePreview = true;
    const config = {
      type: window.screen.width < 992 ? 'mobile' : 'desktop',
      document: {
        filetype: this.fileDetails.onlyoffice_info.file_type,
        key: this.fileDetails.onlyoffice_info.doc_key,
        title: this.fileDetails.onlyoffice_info.doc_title || 'escapejs',
        url: this.fileDetails.raw_path,
        permissions: {
          download: false,
          edit: false,
          print: true,
          review: true,
        },
      },
      documentType: this.fileDetails.onlyoffice_info.document_type,
      editorConfig: {
        callbackUrl: this.fileDetails.onlyoffice_info.callback_url,
        lang: this.currentLoginUser.lang,
        mode: 'view',
        user: {
          name: this.currentLoginUser.email
        },
        customization: {
          autosave: true,
          forcesave: true,
        }
      },
    };

    setTimeout(() => {
      this.officeEditor = new DocsAPI.DocEditor('officePreviewPlaceholder', config);
    }, 0);
  }

  configureComponentDisplay(filetype, fileext) {
    this.codeMirrorConfig.mode = this.codeMirrorService.getMode(fileext);
    switch (filetype.toUpperCase()) {
      case 'TEXT':
        this.showCodeMirrorPreview = true;
        break;
      case 'MARKDOWN':
        this.showMarkdownPreview = true;
        break;
      case 'IMAGE':
        this.showImagePreview = true;
        break;
      case 'PDF':
        this.showPDFPreview = true;
        break;
      case 'AUDIO':
        this.showAudioPreview = true;
        break;
      case 'VIDEO':
        this.showVideoPreview = true;
        break;
      default:
        this.showDownloadButton = true;
        this.showCodeMirrorPreview = false;
        this.showMarkdownPreview = false;
        this.showImagePreview = false;
        break;
    }
  }

  downloadRevision() {
    this.fileService.getHistoryDownloadLink(this.fileDetails.repo_id, this.fileDetails.obj_id).subscribe(resp => {
      window.location.href = `${resp.data.download_link}${this.fileDetails.file_name}`;
    });
  }

  downloadFile() {
    this.downloadRevision();
  }

  onPDFLoadingComplete(pdf) {
    if (pdf.pdfInfo.numPages > 50) {
      pdf.pdfInfo.numPages = 50;
      this.noti.showNotification('info', 'This file has more than 50 pages. Only the first 50 will be shown here.');
    }
  }

  goBack() {
    window.history.back();
  }
}
