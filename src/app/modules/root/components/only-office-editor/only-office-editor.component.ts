import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FilesService, AuthenticationService, NotificationService, NonAuthenticationService, I18nService } from '@services/index';
import { Router, ActivatedRoute } from '@angular/router';


declare var DocsAPI: any;

@Component({
  selector: 'app-only-office-editor',
  templateUrl: './only-office-editor.component.html',
  styleUrls: ['./only-office-editor.component.scss']
})
export class OnlyOfficeEditorComponent implements OnInit {


  onlyOfficeConfig: any = {};

  configDict: any = {};
  currentRepo = '';
  currentFilePath = '';
  currentLoginUser;
  fileDetails;

  officeEditor: any = null;

  showOfficePreview = false;
  showHeaderEditButton = false;
  editMode = false;

  constructor(
    private filesService: FilesService,
    private router: Router,
    private noti: NotificationService,
    private authService: AuthenticationService,
    private translate: TranslateService,
    private nonAuthService: NonAuthenticationService,
    private ActivatedRoute: ActivatedRoute,
    private i18nService: I18nService,
  ) { }

  ngOnInit() {
    this.ActivatedRoute.paramMap.subscribe(param => {
      this.currentRepo = param.get('repoID');

      this.ActivatedRoute.queryParamMap.subscribe(queryParams => {
        // this.inProgress = true;
        this.currentFilePath = queryParams.get('p');
        this.nonAuthService.getRestapiSettingsByKeys('ENABLE_ONLYOFFICE,ONLYOFFICE_APIJS_URL').subscribe(resp => {
          console.log('settings', resp);
          this.configDict = resp.data.config_dict;
          this.authService.userInfo().subscribe(resps => {
            this.currentLoginUser = resps.data;
            this.getFileDetails(this.currentRepo, this.currentFilePath);
          });
        });
      });
    });
  }

  getFileDetails(currentRepo, currentFilePath) {
    this.filesService.getPreviewFileData(currentRepo, currentFilePath).subscribe(
      resp => {
        this.fileDetails = resp.data;
        if (this.fileDetails.onlyoffice_info.can_edit) {
          this.configOfficePreviewDisplay(this.fileDetails);
        } else {
          this.noti.showNotification('danger', this.translate.instant('PREVIEW.PREMISSION_EDIT_OFFICE_FILE'));
          this.router.navigate(['/']);
        }
      }, error => {
        this.router.navigate(['/error', '404']);
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
    this.showHeaderEditButton = true;
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
        lang: this.currentLoginUser.language || this.i18nService.getLanguage(),
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

    this.onlyOfficeConfig = Object.assign({}, config);

    // Check if the file can be edit or not
    if (this.fileDetails.onlyoffice_info.can_edit && !this.fileDetails.file_locked) {
      this.onlyOfficeConfig.editorConfig.mode = 'edit';
    }

    setTimeout(() => {
      this.officeEditor = new DocsAPI.DocEditor('onlyOfficePlaceholder', this.onlyOfficeConfig);
    }, 0);
  }
}
