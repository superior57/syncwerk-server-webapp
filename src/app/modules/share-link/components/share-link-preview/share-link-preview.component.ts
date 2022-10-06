import { Component, OnInit, Input } from '@angular/core';
import { NotificationService, CodeMirrorService, ShareLinkService, I18nService, AdminService, NonAuthenticationService, AuthenticationService } from '@services/index';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';


import { Select2OptionData } from 'ng2-select2';
import { TranslateService } from '@ngx-translate/core';

declare var DocsAPI: any;
@Component({
  selector: 'app-share-link-preview',
  templateUrl: './share-link-preview.component.html',
  styleUrls: ['./share-link-preview.component.scss']
})
export class ShareLinkPreviewComponent implements OnInit {

  @Input() fileDetails: any = {};
  @Input() token: string;
  @Input() type: string = null;
  @Input() p: string;

  allowRetryToGetLogo = true;
  logoURL = '';
  logoTooltip = '';

  showDownloadButton = false;
  showCodeMirrorPreview = false;
  showMarkdownPreview = false;
  showImagePreview = false;
  showPDFPreview = false;
  showAudioPreview = false;
  showVideoPreview = false;
  showHTMLPreview = false;
  showHeaderEditButton = false;
  showOfficePreview = false;


  codeMirrorConfig = {
    lineNumbers: true,
    readOnly: true,
    cursorBlinkRate: -1,
    height: 'auto',
    scrollbarStyle: 'null',
    mode: ''
  };
  linkDownload: string;
  params: any;
  select2TranslateData: Array<Select2OptionData> = [
    { id: 'en', text: 'English' },
    { id: 'de', text: 'Deutsch' },
  ];
  translateOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };
  choosenLanguage = 'en';

  getCurrentRouter = [];
  configDict: any = {};
  onlyOfficeConfig: any = {};
  officeEditor: any = null;



  constructor(
    private shareLinkService: ShareLinkService,
    private notiService: NotificationService,
    private codeMirrorService: CodeMirrorService,
    private i18nService: I18nService,
    private translate: TranslateService,
    private adminService: AdminService,
    private activatedRouter: ActivatedRoute,
    private router: Router,
    private nonAuthenService: NonAuthenticationService,
    private authService: AuthenticationService,
    private cookieService: CookieService,


  ) { }

  ngOnInit() {
    this.getLogoURL();
    this.getLogoTooltip();
    // this.switchLanguage({ value: this.choosenLanguage });
    this.choosenLanguage = this.i18nService.getLanguage();
    this.translate.use(this.choosenLanguage);
    // this.configureComponentDisplay(this.fileDetails.filetype, this.fileDetails.fileext);
    if (this.type === 'd_files') {
      this.getLinkDownloadFileInDir();
    }
    this.activatedRouter.queryParams.subscribe(params => {
      if (this.fileDetails.is_from_shared_folder) {
        const getRouterFromParams = params.p;
        this.getCurrentRouter = getRouterFromParams.split('/');
      } else {
        this.getCurrentRouter = ['/'];
      }

    });
    this.nonAuthenService.getRestapiSettingsByKeys('ENABLE_ONLYOFFICE,ONLYOFFICE_APIJS_URL').subscribe(resp => {
      console.log('settings', resp);
      this.configDict = resp.data.config_dict.ENABLE_ONLYOFFICE;
    });

    if (!this.fileDetails.onlyoffice_info || !this.configDict) {
      this.configureComponentDisplay(this.fileDetails.filetype, this.fileDetails.fileext);
    } else {
      this.configOfficePreviewDisplay(this.fileDetails);
    }
  }

  configureComponentDisplay(filetype, fileext) {
    this.codeMirrorConfig.mode = this.codeMirrorService.getMode(fileext);
    switch (filetype.toUpperCase()) {
      case 'TEXT':
        if (fileext.toLowerCase() === 'html') {
          this.showHTMLPreview = true;
        } else {
          this.showCodeMirrorPreview = true;
        }
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
    this.showHeaderEditButton = true;
    this.showDownloadButton = false;
    let onlyOfficeLang = 'de';
    const languageFromCookies = this.cookieService.get('lang');
    if (languageFromCookies) {
      onlyOfficeLang = languageFromCookies;
    } else {
      const languageFromBrowser = navigator.language;
      if (navigator.language) {
        if (navigator.language.includes('en-')) {
          onlyOfficeLang = 'en';
        }
      }
    }
    const config = {
      type: window.screen.width < 992 ? 'mobile' : 'desktop',
      document: {
        filetype: this.fileDetails.onlyoffice_info.file_type,
        key: this.fileDetails.onlyoffice_info.doc_key,
        title: this.fileDetails.onlyoffice_info.doc_title || 'escapejs',
        url: this.fileDetails.onlyoffice_info.doc_url,
        permissions: {
          download: false,
          edit: this.fileDetails.onlyoffice_info.can_edit && !this.fileDetails.file_locked,
          print: true,
          review: true,
        },
      },
      documentType: this.fileDetails.onlyoffice_info.document_type,
      editorConfig: {
        callbackUrl: this.fileDetails.onlyoffice_info.callback_url,
        lang: onlyOfficeLang,
        mode: 'view',
        user: {
          name: ''
        },
        customization: {
          autosave: true,
          forcesave: true,
        }
      },
    };

    this.onlyOfficeConfig = Object.assign({}, config);

    setTimeout(() => {
      this.officeEditor = new DocsAPI.DocEditor('officePreviewPlaceholder', this.onlyOfficeConfig);
      console.log('office editor', this.officeEditor);
    }, 0);
  }

  downloadRevision() {
    console.log(this.fileDetails);
    if (this.fileDetails.is_from_shared_folder) {
      this.shareLinkService.getFileDownloadLinkFromShareFolderFilePreview(this.fileDetails.token, this.fileDetails.path).subscribe(resp => {
        window.location.href = resp.data.dl_url;
      });
    } else {
      this.shareLinkService.getShareDownloadLinkFileDownloadLink(this.fileDetails.token).subscribe(resp => {
        window.location.href = resp.data.dl_url;
      });
    }
    // if (this.fileDetails.raw_path) {
    //   window.location.href = this.fileDetails.raw_path;
    // } else {
    //   this.shareLinkService.getShareDownloadLinkFileDownloadLink(this.fileDetails.token).subscribe(resp => {
    //     console.log('this is download link', resp);
    //     window.location.href = resp.data.dl_url;
    //   });
    // }
    // window.location.href = this.type === 'd_files' ? this.linkDownload : this.fileDetails.download_link + '?dl=1';
  }

  downloadFile() {
    this.downloadRevision();
    // window.location.href = this.type === 'd_files' ? this.linkDownload : this.fileDetails.download_link + '?dl=1';
  }

  onPDFLoadingComplete(pdf) {
    console.log(pdf);
    if (pdf._pdfInfo.numPages > 50) {
      pdf._pdfInfo.numPages = 50;
      this.notiService.showNotification('info', 'This file has more than 50 pages. Only the first 50 will be shown here.');
    }
  }

  getLinkDownloadFileInDir() {
    this.shareLinkService.postGetLinkDownloadFileInDir(this.token, this.p)
      .subscribe(resps => this.linkDownload = resps.data.dl_url, error => console.error(error));
  }

  switchLanguage(data: { value: string }) {
    this.i18nService.setLanguage(data.value);
    this.translate.use(data.value);
  }

  getLogoURL() {
    this.logoURL = this.nonAuthenService.getPageLogoLink();
  }

  getLogoTooltip() {
    this.adminService.getRestapiSettingsByKeys('SITE_TITLE').subscribe(resp => {
      this.logoTooltip = resp.data.config_dict.SITE_TITLE;
      if (this.logoTooltip === '') {
        this.logoTooltip = `Syncwerk Web-App`;
      }
    });
  }

  logoErrorHandler(event) {
    // use default logo in the client app (only retry once)
    if (this.allowRetryToGetLogo === true) {
      this.allowRetryToGetLogo = false;
      this.logoURL = `/media/img/syncwerk-logo.png?r=${new Date().getTime()}`;
    }
  }

  // goBack() {
  //   if (this.getCurrentRouter.length <= 2) {
  //     this.router.navigate(['share-link', 'd', this.token]);
  //   } else {
  //     const getRouterAfterSlice = this.getCurrentRouter.slice(0, this.getCurrentRouter.length - 1);
  //     getRouterAfterSlice.push('/');
  //     const getRouterAfterConvert = getRouterAfterSlice.join('/');
  //     this.router.navigate(['share-link', 'd', this.token], { queryParams: { p: getRouterAfterConvert, mode: 'list' } });
  //   }
  // }
}
