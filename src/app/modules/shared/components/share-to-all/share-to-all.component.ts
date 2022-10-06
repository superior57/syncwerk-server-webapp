import { OnInit, OnChanges, Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
import { FilesService, NotificationService } from '../../../../services';

@Component({
  selector: 'app-share-to-all',
  templateUrl: './share-to-all.component.html',
  styleUrls: ['./share-to-all.component.scss']
})
export class ShareToAllComponent implements OnInit, OnChanges {

  @Input() repoID: string;

  public permissions: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };
  repo = {
    id: '',
    permission: 'none'
  };
  selectedPermission = '';
  isProcessing = false;

  constructor(
    private translate: TranslateService,
    private fileService: FilesService,
    private notification: NotificationService
  ) {

  }

  ngOnInit() {
    this.permissions = [
      {
        id: 'none',
        text: this.translate.instant('MODAL_SHARE.NONE')
      },
      {
        id: 'rw',
        text: this.translate.instant('MODAL_SHARE.READ_WRITE')
      },
      {
        id: 'r',
        text: this.translate.instant('MODAL_SHARE.READ_ONLY')
      }
    ];

    // get shared info of this repo
    this.fileService.getListPublicRepos().subscribe((data) => {
      if (data.data) {
        for (let p of data.data) {
          if (p.id === this.repoID) {
            this.repo = p;
          }
        }
      }
    });
  }

  ngOnChanges() {

  }

  changedSettingPermission(data: { value: string }) {
    this.selectedPermission = data.value;
  }

  submit() {
    this.isProcessing = true;

    if (this.selectedPermission === 'none') {
      this.fileService.deleteSharedRepos(this.repoID, 'public')
        .subscribe(resps => {
          this.notification.showNotification('success', resps.message);
          this.isProcessing = false;
        }, error => {
          this.notification.showNotification('danger', JSON.parse(error.body).message);
          this.isProcessing = false;
        });
    } else {
      this.fileService.updateSharedRepos(this.repoID, 'public', this.selectedPermission)
        .subscribe(resps => {
          this.notification.showNotification('success', resps.message);
          this.isProcessing = false;
        }, error => {
          this.notification.showNotification('danger', JSON.parse(error.body).message);
          this.isProcessing = false;
        });
    }
  }
}
