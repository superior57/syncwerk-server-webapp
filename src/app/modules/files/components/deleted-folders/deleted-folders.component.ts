import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select2OptionData } from 'ng2-select2';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie';

import { Action, Type } from '@enum/index.enum';
import { FilesService, MessageService, NotificationService } from '@services/index';

declare var jQuery: any;
@Component({
  selector: 'app-deleted-folders',
  templateUrl: './deleted-folders.component.html',
  styleUrls: ['./deleted-folders.component.scss']
})
export class DeletedFoldersComponent implements OnInit {
  resData;
  typeSort: string;
  isSortNameAtoZ = true;
  isSortTimestampAtoZ = true;
  params: any;
  itemsForDisplay = [];
  isProcessing = true;

  private subscription: Subscription;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fileService: FilesService,
    private messageService: MessageService,
    private noti: NotificationService,
    private cookieService: CookieService,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.retrievingDeletedFolders();
    });
  }

  retrievingDeletedFolders() {
    this.fileService.getDeletedFolders().subscribe(resp => {
      this.resData = resp;
      this.itemsForDisplay = Object.assign([], this.resData.data);
      this.isProcessing = false;
    }, error => {
      console.error(error);
    });
  }

  get unsubscribed() {
    return this.subscription && this.subscription.closed;
  }

  subscribe() {
    this.subscription = this.messageService
      .subscribe('sender', (payload) => {
      });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  restoreFolder(repo_id: string) {
    this.fileService.restoreDeletedFolders(repo_id).subscribe(resp => {
      this.noti.showNotification('success', resp.message);
      this.retrievingDeletedFolders();
    }, error => {
      console.error(error);
      this.noti.showNotification('danger', JSON.parse(error._body).message);
    });
  }

  sortAction(typeSort: string) {
    this.typeSort = typeSort;
    if (typeSort === 'sortName') {
      this.isSortNameAtoZ = !this.isSortNameAtoZ;
      this.handleSortByName();
    } else {
      this.isSortTimestampAtoZ = !this.isSortTimestampAtoZ;
      this.handleSortByDeletedTime();
    }
  }

  handleSortByName() {
    const listSort = this.resData.data.sort((a, b) => {
      const elementA = a.repo_name.toLowerCase();
      const elementB = b.repo_name.toLowerCase();
      if (elementA < elementB) {
        return this.isSortNameAtoZ ? -1 : 1;
      }
      if (elementA > elementB) {
        return this.isSortNameAtoZ ? 1 : -1;
      }
      return 0;
    });
    return listSort;
  }

  handleSortByDeletedTime() {
    const listSort = this.resData.data.sort((a, b) => {
      if (a.del_timestamp < b.del_timestamp) {
        return this.isSortTimestampAtoZ ? -1 : 1;
      }
      if (a.del_timestamp > b.del_timestamp) {
        return this.isSortTimestampAtoZ ? 1 : -1;
      }
      return 0;
    });
    return listSort;
  }

  goBack() {
    this.router.navigate(['/folders']);
  }

  onSearchFilterChange(data) {
    const searchQuery = data.target.value.toLowerCase();
    if (data.target.value.trim() === '') {
      this.itemsForDisplay = Object.assign(this.resData.data);
    } else {
      this.itemsForDisplay = this.resData.data.filter(ele => ele.repo_name.toLowerCase().includes(searchQuery));
    }
  }
}
