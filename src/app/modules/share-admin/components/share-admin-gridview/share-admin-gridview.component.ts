import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NotificationService, NonAuthenticationService } from 'app/services';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-share-admin-gridview',
  templateUrl: './share-admin-gridview.component.html',
  styleUrls: ['./share-admin-gridview.component.scss']
})
export class ShareAdminGridviewComponent implements OnInit, OnChanges {
  @Input() listShares = [];
  @Input() columns = [];
  @Input() rangeSize: string;
  @Output() openModal = new EventEmitter();

  params: any;

  // For slider
  rangeTransformScale: number;
  classRangeSize: string;
  rangeHeightPx: string;

  isEnabledFilePreview = false;

  constructor(
    private notify: NotificationService,
    private router: Router,
    private cookieService: CookieService,
    private nonAuthService: NonAuthenticationService,

  ) { }

  ngOnInit() {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.isEnabledFilePreview = resp.data.file_preview;
    });
  }

  getLink(linkObj) {
    const link = linkObj.link;
    const splitUrl = link.split('/');
    splitUrl.splice(3, 0, 'share-link');
    const newUrl = splitUrl.join('/');
    return newUrl;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rangeSize']) {
      this.handleChangeRangeSize();
      this.cookieService.put('syc_range_size', this.rangeSize);
    }
  }

  copyLinks() {
    this.notify.showNotificationByMessageKey('success', 'NOTIFICATION_MESSAGE.LINK_HAS_BEEN_COPIED_TO_CLIPBOARD');
  }

  onOpenModal(typeModal: string, currentItem) {
    this.openModal.emit({ type: typeModal, currentItem: currentItem });
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

  handleChangeRangeSize() {
    const numberRangeSize = Number(this.rangeSize);
    if (numberRangeSize >= 100 && numberRangeSize < 120) {
      this.rangeTransformScale = numberRangeSize / 100;
      this.classRangeSize = 'col-xl-3 col-md-2 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 110 && numberRangeSize < 150) {
      this.rangeTransformScale = (numberRangeSize + 20) / 100;
      this.classRangeSize = 'col-xl-3  col-md-3 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 150 && numberRangeSize <= 160) {
      this.rangeTransformScale = (numberRangeSize + 40) / 100;
      this.classRangeSize = 'col-xl-3 col-md-4 col-sm-6 col-xs-12';
    }
    this.rangeHeightPx = 100 * this.rangeTransformScale + 'px';
  }

  setErrorImg(index) {
    this.listShares[index].imgError = 1;
  }
}
