import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NotificationService, NonAuthenticationService } from 'app/services';
import { Select2OptionData } from 'ng2-select2';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-share-admin-listview',
  templateUrl: './share-admin-listview.component.html',
  styleUrls: ['./share-admin-listview.component.scss']
})
export class ShareAdminListviewComponent implements OnInit {
  @Input() listShares = [];
  @Input() columns = [];
  @Output() sorted = new EventEmitter();
  @Output() openModal = new EventEmitter();
  @Output() changedPermission = new EventEmitter();

  public exampleData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100,
    width: 'auto',
    dropdownAutoWidth: true,
  };
  editPermissionIndex = -1;
  params: any;

  isEnabledFilePreview = false;

  constructor(
    private notify: NotificationService,
    private router: Router,
    private translateSerivce: TranslateService,
    private nonAuthService: NonAuthenticationService,

  ) { }

  ngOnInit() {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledFilePreview = resp.data.file_preview;
    });
    this.initDataSelect();
  }

  initDataSelect() {
    this.exampleData = [
      { id: 'rw', text: this.translateSerivce.instant('PERMISSIONS.READ_WRITE')},
      { id: 'r', text: this.translateSerivce.instant('PERMISSIONS.READ')}
    ];
  }

  getLink(linkObj) {
    const link = linkObj.link;
    const splitUrl = link.split('/');
    splitUrl.splice(3, 0, 'share-link');
    const newUrl = splitUrl.join('/');
    return newUrl;
  }

  onSortColumn(column) {
    this.sorted.emit(column);
  }

  onOpenModal(typeModal: string, currentItem) {
    this.openModal.emit({ type: typeModal, currentItem: currentItem });
  }

  copyLinks() {
    this.notify.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.LINK_HAS_BEEN_COPIED_TO_CLIPBOARD');
  }

  changePermission(type, data: { value: string }, dataItem) {
    this.changedPermission.emit({ type, data, dataItem });
    this.editPermissionIndex = -1;
  }

  onFocusOut() {
    setTimeout(() => this.editPermissionIndex = -1, 500);
  }

  routerLinkShares(dataItem: any) {
    if (dataItem.is_dir !== false) {
      if (dataItem.path) {
        this.router.navigateByUrl(`/folders/${dataItem.repo_id}${dataItem.path}`);
      } else {
        this.router.navigateByUrl(`/folders/${dataItem.repo_id}`);
      }
    } else if (dataItem.type === 'download-link' && dataItem.is_dir === false) {
      this.router.navigate(['preview', dataItem.repo_id], {
        queryParams: {
          p: dataItem.path,
          ref: `/shares`,
          parent: `/shares`
        }
      });
    }
  }

  setErrorImg(index) {
    this.listShares[index].imgError = 1;
  }

  removePublicMeetingShare(item) {
    console.log(item);
  }
}
