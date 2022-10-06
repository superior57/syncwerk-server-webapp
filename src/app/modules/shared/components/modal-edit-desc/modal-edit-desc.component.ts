import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FilesService, NotificationService, MessageService } from 'app/services';
import { Action, Type } from 'app/enum/index.enum';

declare const jQuery: any;

@Component({
  selector: 'app-modal-edit-desc',
  templateUrl: './modal-edit-desc.component.html',
  styleUrls: ['./modal-edit-desc.component.scss']
})
export class ModalEditDescComponent implements OnInit {

  @Input() dataItem: any;
  @Output() changed = new EventEmitter();
  @ViewChild('desc') private descEle: ElementRef;

  model = {
    change_desc: ''
  };
  isProcessing = false;
  params: any;

  constructor(
    private filesService: FilesService,
    private notify: NotificationService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    this.model.change_desc = this.dataItem.desc;
    setTimeout(() => {
      this.descEle.nativeElement.focus();
      this.descEle.nativeElement.setSelectionRange(0, this.dataItem.desc.length);
    }, 600);
  }

  submitChangeDesc() {
    this.isProcessing = true;
    if (this.dataItem.desc !== this.model.change_desc) {
      this.filesService.renameFolder(this.dataItem.id, this.dataItem.name, this.model.change_desc)
        .subscribe(resps => {
          this.messageService.send(Type.Root_Files_Componenet, Action.Reload, '');
          this.notify.showNotification('success', resps.message);
          jQuery('#modal-edit-desc').modal('hide');
        }, error => {
          this.notify.showNotification('danger', JSON.parse(error._body).message);
          this.isProcessing = false;
        });
    }
  }
}
