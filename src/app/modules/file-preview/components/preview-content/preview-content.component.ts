import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { Component, OnInit, Input, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FilesService, AuthenticationService, NotificationService, MessageService, I18nService, NonAuthenticationService, TitleService } from '@services/index';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { Select2OptionData } from 'ng2-select2';
import { Action, Type } from '@enum/index.enum';
import { PDFProgressData, PDFDocumentProxy } from 'pdfjs-dist';
import beautify from 'js-beautify';
// import Quill from 'quill';
import BlotFormatter, { DeleteAction, ImageSpec, ResizeAction } from 'quill-blot-formatter';
import uuidv1 from 'uuid/v1';
import ImagePaste from 'quill-yang-image-paste';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { environment } from '../../../../../environments/environment';

import { CustomLinkDialogComponent } from '../../components/custom-link-dialog/custom-link-dialog.component';
import { CustomImageDialogComponent } from '../../components/custom-image-dialog/custom-image-dialog.component';


const htmlBeautifier = beautify.html;

// const Link = Quill.import('formats/link');

// class MyLink extends Link {
//   static create(value) {
//     const isTargetBlankRegex = /\openInNewTab=true--/;
//     const isTargetBlank = isTargetBlankRegex.test(value);
//     const node = super.create(value);
//     value = super.sanitize(value).replace('openInNewTab=true--', '');
//     node.setAttribute('href', value);
//     if (!isTargetBlank) {
//       node.removeAttribute('target');
//     }
//     return node;
//   }
// }

declare var jQuery: any;
// declare var Quill: any;
declare var DocsAPI: any;
declare var Quill: any;

// const Quill = quill;

class CustomImageSpec extends ImageSpec {
  getActions() {
    return [ResizeAction, DeleteAction];
  }
}

// Quill.register(MyLink);
// Quill.register('modules/imagePaste', ImagePaste);
Quill.register('modules/blotFormatter', BlotFormatter);

@Component({
  selector: 'app-preview-content',
  templateUrl: './preview-content.component.html',
  styleUrls: ['./preview-content.component.scss']
})
export class PreviewContentComponent implements OnInit {

  @Input() fileDetails: any;
  @Input() editMode = false;
  @Input() fileEditHeadID: string;
  @Input() hightlightMode: string;
  @Input() ref: string = null;
  @Input() parent: string = null;
  @Input() isProcessing = false;
  @Input() configDict: any = {};

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  onlyOfficeConfig: any = {};

  fileComments = [];
  currentComment = '';
  typeModal: String;

  showDownloadButton = false;
  showHeaderEditButton = false;
  showCodeMirrorPreview = false;
  showMarkdownPreview = false;
  showHTMLPreview = false;
  showImagePreview = false;
  showPDFPreview = false;
  showAudioPreview = false;
  showVideoPreview = false;
  showOfficePreview = false;

  canEdit = true;

  codeMirrorConfig = {
    previewMode: {
      lineNumbers: true,
      readOnly: true,
      cursorBlinkRate: -1,
      height: 'auto',
      scrollbarStyle: 'null',
      mode: '',
      lineWrapping: true,
    },
    editMode: {
      lineNumbers: true,
      readOnly: false,
      cursorBlinkRate: 250,
      height: 'auto',
      scrollbarStyle: 'null',
      mode: '',
      lineWrapping: true,
    }
  };

  markdownEditorConfig = {
    autofocus: true,
    forceSync: true,
    toolbar: ['bold', 'italic', '|'
      , 'heading-1', 'heading-2', 'heading-3', '|'
      , 'unordered-list', 'ordered-list', 'horizontal-rule', '|'
      , 'link', 'image', 'table', '|'
      , 'preview', 'side-by-side', 'fullscreen']
  };

  currentShareItem = {
    repoID: '',
    path: '',
    type: '',
    name: '',
    encrypted: false,
    permission: '',
  };

  fileName = '';
  currentLoginUser;
  choosenLanguage = 'en';
  select2Encode: Array<Select2OptionData> = [];
  encodeOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };

  htmlEditor: any = null;
  htmlEditorToolBarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],

    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction

    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean'],                                         // remove formatting button

    ['link', 'image'],

  ];

  officeEditor: any = null;
  isEnabledFileComment = false;
  isEnabledFilePreview = false;

  fileNameDeleted = '';
  isRepoEncrypted = false;

  getEncodeToSaveDefault = 'utf-8';
  getUrlParentPath;
  getRepoID;
  getPath;


  constructor(
    private filesService: FilesService,
    private router: Router,
    private messageService: MessageService,
    private noti: NotificationService,
    private cookieService: CookieService,
    private authService: AuthenticationService,
    private i18nService: I18nService,
    private translate: TranslateService,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
    private nonAuthService: NonAuthenticationService,
    private ActivatedRoute: ActivatedRoute,
    private titleService: TitleService
  ) {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledFileComment = resp.data.file_comments;
      this.isEnabledFilePreview = resp.data.file_preview;
      if (!this.isEnabledFilePreview) {
        this.router.navigate(['/error', '404']);
      }
    });
  }

  ngOnInit() {
    this.getRepoID = this.fileDetails.repo_id;
    this.getPath = this.fileDetails.path;
    console.log(`file di teo ne`, this.fileDetails);
    this.getUrlParentPath = this.ref;
    this.isRepoEncrypted = this.fileDetails.repo_encrypted;
    this.choosenLanguage = this.i18nService.getLanguage();
    this.translate.use(this.choosenLanguage);
    jQuery('.scrollbar-macosx').scrollbar();
    this.fileName = this.handleString(this.fileDetails.filename, 50, 35, 10);
    for (const encode of this.fileDetails.file_encoding_list) {
      this.select2Encode.push({
        id: encode,
        text: encode
      });
    }
    this.authService.userInfo().subscribe(resps => {
      this.currentLoginUser = resps.data;
      this.fileNameDeleted = this.fileDetails.filename;
      if (!this.fileDetails.onlyoffice_info || !this.configDict.ENABLE_ONLYOFFICE) {
        this.configureComponentDisplay(this.fileDetails.filetype, this.fileDetails.fileext);
      } else {
        this.configOfficePreviewDisplay(this.fileDetails);
        if(this.currentLoginUser.onlyoffice_open_mode == 'edit' && this.configDict.ONLYOFFICE_FORCE_ADMIN_SETTINGS != true ||
            this.configDict.ONLYOFFICE_FORCE_ADMIN_SETTINGS == true && this.configDict.ONLYOFFICE_OPEN_MODE == 'edit'){
          this.turnOnEditMode();
        }
      }
    });
    this.titleService.setTitle(
      [
        {
          str: this.fileName,
          translate: false
        }
      ]);
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  getCurrentLoginUser() {
    this.authService.userInfo().subscribe(resps => this.currentLoginUser = resps.data);
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
    this.canEdit = this.fileDetails.onlyoffice_info.can_edit;
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
        lang: this.currentLoginUser.language ? this.currentLoginUser.language : this.i18nService.getLanguage(),
        mode: 'view',
        user: {
          name: this.currentLoginUser.email
        },
        customization: {
          compactHeader: true,
          toolbarNoTabs: true,
          autosave: true,
          forcesave: false,
          reviewDisplay: "markup",
        }
      },
    };

    this.onlyOfficeConfig = Object.assign({}, config);

    setTimeout(() => {
      this.officeEditor = new DocsAPI.DocEditor('officePreviewPlaceholder', this.onlyOfficeConfig);
      console.log('office editor', this.officeEditor);
    }, 0);
  }

  configureComponentDisplay(filetype, fileext) {
    this.codeMirrorConfig.editMode.mode = this.hightlightMode;
    this.codeMirrorConfig.previewMode.mode = this.hightlightMode;
    console.log('fileType', filetype);
    switch (filetype.toUpperCase()) {
      case 'TEXT':
        this.showHeaderEditButton = true;
        if (fileext.toLowerCase() === 'html') {
          this.showHTMLPreview = true;
        } else {
          this.showCodeMirrorPreview = true;
        }
        break;
      case 'MARKDOWN':
        this.showHeaderEditButton = true;
        this.showMarkdownPreview = true;
        break;
      case 'IMAGE':
        if (!this.isRepoEncrypted) {
          this.filesService.getThumbnailImage(this.fileDetails.repo_id, this.fileDetails.path, '1024').subscribe(resp => {
            this.fileDetails.thumbnail = resp.url;
          });
        }
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
      case 'HTML':
        this.showHTMLPreview = true;
        break;
      default:
        this.showDownloadButton = true;
        this.showCodeMirrorPreview = false;
        this.showHeaderEditButton = false;
        this.showMarkdownPreview = false;
        this.showImagePreview = false;
        break;
    }
  }

  turnOnEditMode() {
    this.filesService.getFileEditHead(this.fileDetails.repo_id, this.fileDetails.path).subscribe(resp => {
      this.fileEditHeadID = resp.data.head_id;
      this.editMode = true;
      this.fileDetails.file_content = resp.data.file_content;
      if (this.showHTMLPreview) {
        this.initQuillEditor();
      }
      if (this.showOfficePreview) {
        this.onlyOfficeConfig.editorConfig.mode = 'edit';
        this.onlyOfficeConfig.document.url = resp.data.doc_url;
        this.onlyOfficeConfig.document.key = resp.data.doc_key;
        this.officeEditor = null;
        setTimeout(() => {
          this.officeEditor = new DocsAPI.DocEditor('officeEditPlaceholder', this.onlyOfficeConfig);
          console.log('office editor', this.officeEditor);
        }, 0);
      }

    });
  }

  initQuillEditor() {
    setTimeout(() => {
      this.htmlEditor = new Quill('#htmlEditor', {
        modules: {
          toolbar: this.htmlEditorToolBarOptions,
          // blotFormatter: {
          //   specs: [
          //     CustomImageSpec,
          //   ],
          // },
          imagePaste: true
        },
        theme: 'snow'
      });

      const customHandler = this.htmlEditor.getModule('toolbar');
      // Handler for link
      customHandler.addHandler('link', (value) => {
        console.log(this.htmlEditor);
        if (value) {
          const _combine = observableCombineLatest(
            this.modalService.onShow,
            this.modalService.onShown,
            this.modalService.onHide,
            this.modalService.onHidden
          ).subscribe(() => this.changeDetection.markForCheck());

          this.subscriptions.push(
            this.modalService.onHide.subscribe((reason: string) => {
              if (!reason) {
                this.htmlEditor.format('link', this.bsModalRef.content.linkToInsert);
              }
            })
          );

          this.subscriptions.push(
            this.modalService.onHidden.subscribe((reason: string) => {
              this.unsubscribe();
            })
          );

          this.bsModalRef = this.modalService.show(CustomLinkDialogComponent, {
            class: 'modal-lg',
            // initialState: {
            //   selectedTenant: inst,
            // }
          });
        } else {
          this.htmlEditor.format('link', false);
        }
      });
      // Handler for image
      customHandler.addHandler('image', (value) => {
        if (value) {
          const _combine = observableCombineLatest(
            this.modalService.onShow,
            this.modalService.onShown,
            this.modalService.onHide,
            this.modalService.onHidden
          ).subscribe(() => this.changeDetection.markForCheck());

          this.subscriptions.push(
            this.modalService.onHide.subscribe((reason: string) => {
              if (!reason && this.bsModalRef.content.imageThumbnailUrl) {
                const range = this.htmlEditor.getSelection(true);
                if (range) {
                  console.log(range.index);
                  const ops = [];
                  if (range.index !== 0) {
                    ops.push({
                      retain: range.index || 0
                    });
                  }
                  ops.push({
                    insert: {
                      image: this.bsModalRef.content.imageThumbnailUrl,
                    },
                    attributes: { width: 400 },
                  });
                  const delta = {
                    ops
                  };
                  const aftermath = this.htmlEditor.updateContents(delta);
                  console.log(aftermath);
                }
              }
            })
          );

          this.subscriptions.push(
            this.modalService.onHidden.subscribe((reason: string) => {
              this.unsubscribe();
            })
          );

          this.bsModalRef = this.modalService.show(CustomImageDialogComponent, {
            class: 'modal-lg',
            initialState: {
              repoID: this.fileDetails.repo_id,
              currentPath: this.fileDetails.parent_dir
            },
          });
        } else {
          // this.htmlEditor.format('image', false);
        }

      });
    }, 0);

  }

  turnOffEditMode() {
	  this.filesService.getFileEditHead(this.fileDetails.repo_id, this.fileDetails.path).subscribe(resp => {
			this.fileEditHeadID = '';
			this.editMode = false;
			this.fileDetails.file_content = resp.data.file_content;
			if (this.showOfficePreview) {
			  this.onlyOfficeConfig.editorConfig.mode = 'view';
			  this.officeEditor = null;
			  setTimeout(() => {
          this.officeEditor = new DocsAPI.DocEditor('officePreviewPlaceholder', this.onlyOfficeConfig);
          console.log('office editor', this.officeEditor);
			  }, 0);
			}
		});
	}

  cancel() {
    this.turnOffEditMode();
  }

  async urlToFile(url, mimeType) {
    const fileName = uuidv1();
    const fileExt = mimeType.match(/^image\/(\w+)$/i)[1];
    const fullFileName = [fileName, '.', fileExt].join();

    const fetchResult = await fetch(url);
    const fetchResultArrBuffer = await fetchResult.arrayBuffer();
    return new File([fetchResultArrBuffer], fullFileName, {type: mimeType});
  }

  dropAndPasteImageHandler(imageBase64Url, type) {
    console.log('image dropped/pasted', imageBase64Url, type);
  }

  onItemDrop(event) {
    if (event.dataTransfer.files.length > 0) {
      const fileToUpload = event.dataTransfer.files[0];
      this.messageService.send(Type.Upload_Process_Popup, 'show', {
        uploadFileList: [fileToUpload],
        repoIDForUpload: this.fileDetails.repo_id,
        pathForUpload: this.fileDetails.parent_dir,
        type: 'click-input-upload'
      });
      const subscription = this.messageService.subscribe(Type.Upload_Process_Popup, (payload) => {
        switch (payload.action.toLowerCase()) {
          case 'upload-complete':
            subscription.unsubscribe();
            let uploadPath = '/';
            if (this.fileDetails.parent_dir !== '/') {
              uploadPath = `${this.fileDetails.parent_dir}/`;
            }
            if (fileToUpload.type === 'image/png' || fileToUpload.type === 'image/jpeg' || fileToUpload.type === 'image/jpg') {
              const thumbnailLink = this.filesService.populateThumbnailImageLink(this.fileDetails.repo_id, `${uploadPath}${payload.data.name}`, '400');
              const range = this.htmlEditor.getSelection(true);
              if (range) {
                console.log(range.index);
                const ops = [];
                if (range.index !== 0) {
                  ops.push({
                    retain: range.index || 0
                  });
                }
                ops.push({
                  insert: {
                    image: thumbnailLink,
                  },
                  attributes: { width: 400 },
                });
                const delta = {
                  ops
                };
                const aftermath = this.htmlEditor.updateContents(delta);
              }
            } else {
              const range = this.htmlEditor.getSelection(true);
              if (range) {
                console.log(range.index);
                const ops = [];
                if (range.index !== 0) {
                  ops.push({
                    retain: range.index || 0
                  });
                }
                ops.push({
                  insert: payload.data.name,
                  attributes: { link: `preview/${this.fileDetails.repo_id}?p=${uploadPath}${payload.data.name}#existingPage#${this.fileDetails.repo_id}#${uploadPath}${payload.data.name}` },
                });
                const delta = {
                  ops
                };
                this.htmlEditor.updateContents(delta);
              }
            }
            break;
          default:
            break;
        }
      });

    }
  }

  onDragOver(event) {
    event.preventDefault();
    console.log('drag over');
  }

  saveFile() {
    if (this.fileDetails.fileext.toLowerCase() === 'html' && this.showHTMLPreview) {
      console.log(this.htmlEditor);
      this.fileDetails.file_content = this.htmlEditor.container.firstChild.innerHTML;
    }
    if (this.fileDetails.encoding.length <= 0) {
      this.fileDetails.encoding = this.getEncodeToSaveDefault;
      this.filesService.submitFileEdit(
        this.fileDetails.repo_id,
        this.fileDetails.path,
        this.fileEditHeadID,
        this.fileDetails.file_content,
        this.fileDetails.encoding).subscribe(resp => {
          this.turnOffEditMode();
          this.router.navigate([], { queryParams: { p: this.fileDetails.path } });
          if (this.fileDetails.fileext.toLowerCase() === 'html') {
            this.showCodeMirrorPreview = false;
            this.showHTMLPreview = true;
          }
        });
    } else {
      this.filesService.submitFileEdit(
        this.fileDetails.repo_id,
        this.fileDetails.path,
        this.fileEditHeadID,
        this.fileDetails.file_content,
        this.fileDetails.encoding).subscribe(resp => {
          this.turnOffEditMode();
          this.router.navigate([], { queryParams: { p: this.fileDetails.path } });
          if (this.fileDetails.fileext.toLowerCase() === 'html') {
            this.showCodeMirrorPreview = false;
            this.showHTMLPreview = true;
          }
        });
    }
  }

  markFileStarred() {
    this.filesService.markedFileStarred(this.fileDetails.repo_id, this.fileDetails.path).subscribe(resp => {
      this.fileDetails.is_starred = true;
    });
  }

  removeFileStarred() {
    this.filesService.removeFileStarred(this.fileDetails.repo_id, this.fileDetails.path).subscribe(resp => {
      this.fileDetails.is_starred = false;
    });
  }

  loadFileComments() {
    jQuery('.scrollbar-macosx').scrollbar();
    this.filesService.getFileComments(this.fileDetails.repo_id, this.fileDetails.path).subscribe(resp => {
      this.fileComments = resp.data.comments;
    });
  }

  addFileComment() {
    if (this.currentComment.length > 0) {
      this.filesService.addFileComment(this.fileDetails.repo_id, this.fileDetails.path, this.currentComment).subscribe(resp => {
        this.currentComment = '';
        this.loadFileComments();
      });
    }
  }

  openParrentFolder() {
    if (this.parent === null || this.parent === undefined || this.parent.trim() === '') {
      const routeForNavigate = `/folders/${this.fileDetails.repo_id}/${this.fileDetails.parent_dir}`;
      this.router.navigate([routeForNavigate]);
    } else {
      this.router.navigate([this.parent]);
    }
  }

  downloadFile() {
    this.filesService.getDownloadLink(this.fileDetails.repo_id, this.fileDetails.path).subscribe(resp => {
      window.location.href = resp.data.dl_url;
    });
  }

  replyComment(comment) {
    this.currentComment = `@${comment.user_name} `;
    jQuery('#commentBox').focus();
  }

  deleteComment(comment) {
    this.filesService.removeFileComment(comment.repo_id, comment.id).subscribe(resp => {
      this.loadFileComments();
    });
  }

  viewFileHistory() {
    const routeForNavigate = `/repo/file-revision/${this.fileDetails.repo_id}`;
    this.router.navigate([routeForNavigate], { queryParams: { p: this.fileDetails.path } });
  }

  openShareModal() {
    const itemForShare = {
      repoID: this.fileDetails.repo_id,
      path: this.fileDetails.path,
      type: 'file',
      name: this.fileDetails.filename,
      encrypted: false,
      permission: this.fileDetails.file_perm,
    };
    this.currentShareItem = itemForShare;

    this.fileDetails.name = this.fileDetails.path;
    // this.messageService.send(Type.Share_Folder_Modal, Action.Open_New_Child_File, { data: this.fileDetails });
    this.messageService.send(Type.Password_Protect_Component, Action.Open_New_Child_File, '');
    this.typeModal = 'share';
    setTimeout(() => {
      jQuery('#share-modal').modal('show');
    }, 0);
  }

  goToDiff() {
    this.router.navigate(['repo', 'text-diff', this.fileDetails.repo_id], {
      queryParams: {
        p: this.fileDetails.path,
        commit: this.fileDetails.current_commit.commit_id
      }
    });
  }

  openItem(path, index) {
    if (index === this.fileDetails.zipped.length - 1) {
      this.router.navigate(['preview', this.fileDetails.repo_id], {
        queryParams: {
          p: this.fileDetails.path,
        }
      });
    } else {
      const routeForNavigate = `/folders/${this.fileDetails.repo_id}${path[1]}`;
      this.router.navigate([routeForNavigate]);
    }
  }

  goToProfile() {
    this.router.navigate(['user', 'profile', this.fileDetails.current_commit.contact_email]);
  }

  changeImage(imgPath) {
    console.log(`imgPath`, imgPath);
    this.router.navigate([], { queryParams: { p: imgPath } });
  }
  onPDFLoadingComplete(pdf) {
    const limitPageNumber = 50;
    if (pdf.numPages > limitPageNumber) {
      pdf._pdfInfo.numPages = limitPageNumber;
      this.noti.showNotification('info', this.translate.instant('PREVIEW.PDF_FILE_PAGE_LIMIT_NOTIFICATION', { limitPageNumber }));
    }
  }

  handleString(string: string, limitLength: number = 25, numberHeadStr: number = 20, numberEndStr: number = 5) {
    if (string.length > limitLength) {
      const cutHeadString = string.substring(0, numberHeadStr);
      const cutEndString = string.substring(string.length - numberEndStr, string.length);
      return cutHeadString + ' ... ' + cutEndString;
    } else {
      return string;
    }
  }

  openDeleteFilePreviewModal() {
    jQuery('#remove-file-preview-modal').modal('show');
  }

  deleteFilePreview() {
    jQuery('#remove-file-preview-modal').modal('hide');
    // const pathDelete = `/file/?p=${this.fileDetails.path}`;
    this.filesService.deleteEntry('file', this.fileDetails.repo_id, this.fileDetails.path)
    // this.filesService.deleteFolder(this.fileDetails.repo_id, decodeURIComponent(pathDelete))
      .subscribe(resp => {
        this.noti.showNotification('success', resp.message);
        const root = (this.ref === null || this.ref === undefined || this.ref.trim() === '') ? '/folders' : this.ref;
        const tail = root.split('/')[1] === 'files' ? `/${this.fileDetails.repo_id}/${this.fileDetails.parent_dir}` : '';
        this.router.navigate([`${root}${tail}`]);
      }, error => {
        try {
          this.noti.showNotification('danger', JSON.parse(error._body).message);
        } catch (e) { console.error(error); }
      });
  }
  deleteCommentPermission(comment_owner) {
    if ((this.fileDetails && this.fileDetails.is_repo_owner && this.fileDetails.is_repo_owner === 1) ||
      (comment_owner === this.currentLoginUser.email)) {
      return true;
    }
    return false;
  }

  lockFile(r, index) {
    this.filesService.putLockUnlockFile(this.fileDetails.repo_id, this.fileDetails.path, 'lock').subscribe(resp => {
      this.noti.showNotification('success', this.translate.instant('NOTIFICATION_MESSAGE.LOCK_FILE_SUCCESS'));
      this.fileDetails.file_locked = true;
      this.router.navigate([], { queryParams: { p: this.fileDetails.path } });
    });
  }

  unlockFile(r, index) {
    this.filesService.putLockUnlockFile(this.fileDetails.repo_id, this.fileDetails.path, 'unlock').subscribe(resp => {
      this.noti.showNotification('success', this.translate.instant('NOTIFICATION_MESSAGE.UNLOCK_FILE_SUCCESS'));
      this.fileDetails.file_locked = false;
      this.router.navigate([], { queryParams: { p: this.fileDetails.path } });
    });
  }

  switchToSourceEditor() {
    this.fileDetails.file_content = this.htmlEditor.container.firstChild.innerHTML;
    this.fileDetails.file_content = htmlBeautifier(this.fileDetails.file_content, { indent_size: 2, space_in_empty_paren: true });
    this.showHTMLPreview = false;
    this.showCodeMirrorPreview = true;
    this.editMode = true;
  }

  switchToQuillEditor() {
    this.showCodeMirrorPreview = false;
    this.showHTMLPreview = true;
    this.editMode = true;
    this.initQuillEditor();
  }

  goBack() {
    if (!this.getUrlParentPath) {
      history.go(-1);
    } else {
      this.router.navigate([this.getUrlParentPath]);
    }
  }
}
