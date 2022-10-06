import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilesService, CodeMirrorService, NonAuthenticationService } from '@services/index';
import { SharedService } from '@services/shared.service';

@Component({
  selector: 'app-file-preview-wrapper',
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss']
})
export class WrapperComponent implements OnInit {
  @ViewChild('passwordInput') passwordInput: ElementRef;

  currentRepo = '';
  currentFilePath = '';
  hightlightMode = '';
  fileDetails: {
    fileext: ''
  };
  configDict: any = {};
  editMode = false;
  inProgress = true;
  fileEditHeadID: string;
  isError = false;
  ref: string = null;
  parent: string = null;
  errorMessage = '';
  errorCode = 0;
  promptPassword = false;
  filename = '';
  passwordErrorMessage = '';
  isProcessing = false;

  maTheme: string = this.sharedService.maTheme;

  constructor(
    private activatedRoute: ActivatedRoute,
    private filesService: FilesService,
    private codeMirrorService: CodeMirrorService,
    private sharedService: SharedService,
    private nonAuthService: NonAuthenticationService,
  ) {
    sharedService.maThemeSubject.subscribe((value) => {
      this.maTheme = value;
    });
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(param => {
      this.currentRepo = param.get('repoID');
    });
    this.activatedRoute.queryParamMap.subscribe(param => {
      this.inProgress = true;
      this.currentFilePath = param.get('p');
      this.filename = this.currentFilePath;
      this.ref = param.get('ref');
      this.parent = param.get('parent');
      this.nonAuthService.getRestapiSettingsByKeys('ENABLE_ONLYOFFICE,ONLYOFFICE_APIJS_URL,ONLYOFFICE_OPEN_MODE,ONLYOFFICE_FORCE_ADMIN_SETTINGS').subscribe(resp => {
        console.log('settings', resp);
        this.configDict = resp.data.config_dict;
        this.getFileDetails(this.currentRepo, this.currentFilePath);
      });
    });
  }

  getFileDetails(currentRepo, currentFilePath) {
    this.filesService.getPreviewFileData(currentRepo, currentFilePath).subscribe(
      resp => {
        if (resp.data.lib_need_decrypt) {
          this.promptFolderPassword();
        } else {
          console.log(`OPOPOPOPOP`, resp.data);
          if (resp.data.file_encoding_list.length <= 0 || resp.data.encoding.length <= 0) {
            resp.data.encoding = 'utf-8';
            resp.data.file_encoding_list = ['auto', 'utf-8', 'gbk', 'ISO-8859-1', 'ISO-8859-5'];
            this.fileDetails = resp.data;
            console.log(`log 2`, this.fileDetails);
          } else {
            this.fileDetails = resp.data;
            console.log(`log 1`, this.fileDetails);
          }
          this.hightlightMode = this.codeMirrorService.getMode(this.fileDetails.fileext);
          this.inProgress = false;
          this.promptPassword = false;
        }
      },
      error => {
        this.errorCode = error.status;
        try {
          this.errorMessage = JSON.parse(error._body).message;
        } catch (e) {
          this.errorMessage = 'Sorry, but the requested page could not be found.';
        }
        this.inProgress = false;
        this.isError = true;
      });
  }

  promptFolderPassword() {
    this.getFolderGeneralDetail();
    this.promptPassword = true;
  }

  getFolderGeneralDetail() {
    this.filesService.getDetailsRepos(this.currentRepo).subscribe(
      resp => {
        this.filename = resp.data.name;
      });
  }

  authPasswordFolder() {
    this.passwordErrorMessage = '';
    const pass = this.passwordInput.nativeElement.value.trim();
    if (!pass || pass === '') {
      this.passwordErrorMessage = 'Password is required.';
    } else {
      this.filesService.authPasswordFolder(this.currentRepo, pass).subscribe(resp => {
        this.getFileDetails(this.currentRepo, this.currentFilePath);
      }, error => {
        this.passwordErrorMessage = JSON.parse(error._body).message;
        console.error(error);
      });
    }
  }
}
