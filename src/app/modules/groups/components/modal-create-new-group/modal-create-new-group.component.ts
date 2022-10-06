import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { setTimeout } from 'core-js/library/web/timers';
import { TranslateService } from '@ngx-translate/core';

import { NotificationService, GroupsService, MessageService, I18nService } from '@services/index';
import { Type, Action } from '@enum/index.enum';

declare var jQuery: any;

@Component({
  selector: 'app-modal-create-new-group',
  templateUrl: './modal-create-new-group.component.html',
  styleUrls: ['./modal-create-new-group.component.scss']
})
export class ModalCreateNewGroupComponent implements OnInit {

  param: any;
  @Output() handleCloseModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() addGroupToList: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('name') inputNameGroup;

  modelGroups;
  errorMessage = '';
  isProcessing = false;

  constructor(
    private groupsService: GroupsService,
    private noti: NotificationService,
    private translate: TranslateService,
    private i18nService: I18nService,
    private messageService: MessageService,
  ) {
    translate.use(i18nService.getLanguage());
    this.autoFocus();
  }

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.modelGroups = {
      name: '',
    };
  }

  autoFocus() {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => this.inputNameGroup.nativeElement.focus(), 600);
      } catch (e) { reject(e); }
    });
  }

  create() {
    if (this.validate()) {
      this.isProcessing = true;
      this.groupsService.createGroup(this.modelGroups.name)
        .subscribe(resps => {
          this.addGroupToList.emit(resps.message);
          this.messageService.send(Type.Side_Menu_Bar_Component, Action.Reload_List_Groups, resps.data);
        }, error => {
          this.noti.showNotification('danger', JSON.parse(error._body).message);
          this.inputNameGroup.nativeElement.focus();
          const lengthInputNameGroup = this.inputNameGroup.nativeElement.value.length;
          this.inputNameGroup.nativeElement.setSelectionRange(0, lengthInputNameGroup);
          this.isProcessing = false;
        });
    } else {
      this.inputNameGroup.nativeElement.focus();
    }
  }

  validate() {
    this.resetValidate();
    if (this.modelGroups.name.trim().length <= 0) {
      this.errorMessage = 'Group name is required.';
      return false;
    } else if (this.modelGroups.name.length > 255) {
      this.errorMessage = 'Group name cannot exceed 255 characters.';
      return false;
    }
    return true;
  }

  resetValidate() {
    this.errorMessage = '';
  }
}
