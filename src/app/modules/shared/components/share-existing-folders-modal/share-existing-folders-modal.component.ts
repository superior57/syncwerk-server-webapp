import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { Select2OptionData } from 'ng2-select2';

import { FilesService, NotificationService } from 'app/services';

declare const jQuery: any;

@Component({
  selector: 'app-share-existing-folders-modal',
  templateUrl: './share-existing-folders-modal.component.html',
  styleUrls: ['./share-existing-folders-modal.component.scss']
})

export class ShareExistingFoldersModalComponent implements OnInit {

  public exampleData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };

  @Output() addShareExisting: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('checkAll') selectedCheckAll;

  shareData: any;
  isCheckedAll = false;
  isProcessing = false;

  constructor(
    private filesService: FilesService,
    private notification: NotificationService,
  ) { }

  ngOnInit() {
    this.initData();
    this.getRepoMine();
  }

  initData() {
    this.exampleData = [
      {
        id: 'rw',
        text: 'Read-Write'
      },
      {
        id: 'r',
        text: 'Read-Only'
      }
    ];
  }

  getRepoMine() {
    this.filesService.getRepo('mine').subscribe(resps => this.shareData = resps.data, error => console.error(error));
  }

  handleCheckAll() {
    this.isCheckedAll = this.selectedCheckAll.nativeElement.checked;
    this.isCheckedAll
      ? this.shareData.forEach(element => element.isChecked = true)
      : this.shareData.forEach(element => element.isChecked = false);
  }

  handleChecked(itemData) {
    itemData.isChecked = !itemData.isChecked;
    if (this.shareData.filter((item) => !item.isChecked).length > 0) {
      this.selectedCheckAll.nativeElement.checked = false;
    }
  }

  changedSettingPermission(data: { value: string }, position: number) {
    this.shareData.forEach((ele, index) => {
      if (index === position) {
        ele.permission = data.value;
      }
    });
  }

  submitShareExisting() {
    this.isProcessing = true;
    const itemsChecked = this.shareData.filter(item => item.isChecked);
    itemsChecked.forEach((item, index, arr) => {
      this.filesService.updateSharedRepos(item.id, 'public', item.permission)
        .subscribe(resps => {
          if (index === arr.length - 1) {
            this.addShareExisting.emit();
            this.notification.showNotification('success', resps.message);
            jQuery('#share-existing-folders-modal').modal('hide');
          }
        }, error => {
          console.error(error);
          this.notification.showNotification('danger', JSON.parse(error.body).message);
        });
    });
  }
}
