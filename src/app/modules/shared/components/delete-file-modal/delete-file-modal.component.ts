import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie';

import { AppConfig } from 'app/app.config';
import { FilesService, NotificationService, MessageService, I18nService } from '@services/index';
import { Action, Type } from '@enum/index.enum';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;

@Component({
  selector: 'app-delete-file-modal',
  templateUrl: './delete-file-modal.component.html',
  styleUrls: ['./delete-file-modal.component.scss']
})
export class DeleteFileModalComponent implements OnInit {
  @Input() Data;
  @Input() Path;
  @Input() IsFolder = true;
  @Input() RepoId = '';
  @Output() deleted: EventEmitter<any> = new EventEmitter<any>();
  warningMessage;
  isProcessing = false;
  type = '';
  params: any;

  constructor(
    private filesService: FilesService,
    private appConfig: AppConfig,
    private cookieService: CookieService,
    private notiService: NotificationService,
    private messageService: MessageService,
    private i18nService: I18nService,
    private translate: TranslateService,
  ) { }

  async ngOnInit() {
    this.type = await this.getType();
    this.RepoId = this.IsFolder ? this.Data.id : this.RepoId;
    this.handleWarningMessage(this.RepoId);
  }

  getType(): Promise<any> {
    return new Promise((resolve) => {
      this.Data.type === 'repo'
        ? this.translate.get('TYPE_FILES.FOLDER').subscribe(data => resolve(data))
        : this.Data.type === 'dir'
          ? this.translate.get('TYPE_FILES.FOLDER').subscribe(data => resolve(data))
          : this.translate.get('TYPE_FILES.FILE').subscribe(data => resolve(data));
    });
  }

  getUserShared(repoId: string): Promise<[{}]> {
    return new Promise((resolve, reject) => this.filesService.getListSharedFolder(repoId, 'user', this.Path)
      .subscribe(resp => resolve(resp.data), error => console.error(error)));
  }

  getGroupShared(repoId: string): Promise<[{}]> {
    return new Promise((resolve, reject) => this.filesService.getListSharedFolder(repoId, 'group', this.Path)
      .subscribe(resp => resolve(resp.data), error => console.error(error)));
  }

  async handleWarningMessage(repoId: string) {
    try {
      const sharedUsers = await this.getUserShared(repoId);
      const sharedGroup = await this.getGroupShared(repoId);
      const userCount = sharedUsers.length;
      const groupCount = sharedGroup.length;
      if (userCount > 0) {
        if (groupCount > 0) {
          this.warningMessage = this.translate.instant('MODALS.VERIFY_QUESTIONS.FOLDER_CURRENT_SHARED_WITH_USERS_AND_GROUPS', { numberOfUsers: userCount, numberOfGroups: groupCount });
        } else {
          this.warningMessage = this.translate.instant('MODALS.VERIFY_QUESTIONS.FOLDER_CURRENT_SHARED_WITH_USERS', { numberOfUsers: userCount });
        }
      } else if (groupCount > 0) {
        this.warningMessage = this.translate.instant('MODALS.VERIFY_QUESTIONS.FOLDER_CURRENT_SHARED_WITH_GROUPS', { numberOfGroups: groupCount });
      } else {
        this.warningMessage = '';
      }
    } catch (err) { console.error(err); }
  }

  deleteFolder() {
    this.isProcessing = true;
    let pathModifi = this.Path;
    let deleteType = '';
    if (!this.IsFolder) {
      if (this.Path !== '/') { this.Path += '/'; }
      pathModifi = this.Data.type !== 'dir'
        ? `/file/?p=${this.Path}${this.Data.name}`
        : `/dir/?p=${this.Path}${this.Data.name}`;
      deleteType = this.Data.type !== 'dir' ? 'file' : 'dir';
    }
    this.filesService.deleteEntry(deleteType, this.RepoId, `${this.Path}${this.Data.name}`)
    // this.filesService.deleteFolder(this.RepoId, decodeURIComponent(pathModifi))
      .subscribe(resps => {
        this.notiService.showNotification('success', resps.message);
        this.deleted.emit();
        jQuery('#delete-file-modal').modal('hide');
      }, error => {
        console.error(error);
        this.notiService.showNotification('danger', JSON.parse(error._body).message);
      });
  }
}
