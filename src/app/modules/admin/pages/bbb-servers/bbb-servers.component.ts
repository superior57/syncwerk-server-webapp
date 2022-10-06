import { combineLatest as observableCombineLatest, Observable, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, Event, NavigationStart } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

import { AdminService, NonAuthenticationService, NotificationService } from 'app/services';

import { ModalCreateEditBbbServerComponent } from '../../components/modal-create-edit-bbb-server/modal-create-edit-bbb-server.component';
import { ModalDeleteBbbServerConfirmationComponent } from '../../components/modal-delete-bbb-server-confirmation/modal-delete-bbb-server-confirmation.component';

@Component({
  selector: 'app-bbb-servers',
  templateUrl: './bbb-servers.component.html',
  styleUrls: ['./bbb-servers.component.scss']
})
export class BbbServersComponent implements OnInit {

  bsModalRef: BsModalRef;
  subscriptions: Subscription[] = [];

  isProcessing = false;

  currentSearchQuery = '';

  enableMeetings: boolean = false;

  pagination = {
    page: 1,
    itemsPerPage: 30,
  };

  maxSize = 5;

  BBBServerListFromAPI = [];
  BBBServerListForDisplay = [];

  searchTimeOut: any = null;
  searchDelayInMilliseconds = 1000;
  searchChangeTimeStamp = new Date();

  constructor(
    private adminService: AdminService,
    private nonAuthService: NonAuthenticationService,
    private router: Router,
    private modalService: BsModalService,
    private changeDetection: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.enableMeetings = resp.data.bbbMeetings;
      if (!this.enableMeetings) {
        this.router.navigate(['/error', '404']);
      } else {
        this.isProcessing = true;
        this.getListBBBSetting();
      }
    });
  }



  getListBBBSetting() {
    this.adminService.getListBBBServer().subscribe(resp => {
      console.log(resp);
      this.BBBServerListFromAPI = resp.data;
      this.isProcessing = false;
      this.handlePagination();
    }, error => {
    })
  }

  handlePagination() {
    if (this.pagination.itemsPerPage <= 0) {
      this.BBBServerListForDisplay = Object.assign([], this.BBBServerListFromAPI);
    } else {
      const start = (this.pagination.page - 1) * this.pagination.itemsPerPage;
      const end = start + this.pagination.itemsPerPage;

      if (this.currentSearchQuery !== '') {
        this.BBBServerListForDisplay = this.BBBServerListFromAPI.filter(ele => ele.setting_name.toLowerCase().includes(this.currentSearchQuery) || ele.bbb_server.toLowerCase().includes(this.currentSearchQuery)).slice(start, end);
      } else {
        this.BBBServerListForDisplay = this.BBBServerListFromAPI.slice(start, end);
      }
    }
  }

  prepareModalSubscription() {
    const _combine = observableCombineLatest(
      this.modalService.onShow,
      this.modalService.onShown,
      this.modalService.onHide,
      this.modalService.onHidden
    ).subscribe(() => this.changeDetection.markForCheck());

    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        this.getListBBBSetting();
      })
    );

    this.subscriptions.push(
      this.modalService.onHidden.subscribe((reason: string) => {
        this.unsubscribe();
      })
    );
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }

  onSearchFilterChange(data) {
    const currentTimeStamp = new Date();
    if (currentTimeStamp.getTime() - this.searchChangeTimeStamp.getTime() < this.searchDelayInMilliseconds) {
      clearTimeout(this.searchTimeOut);
    }
    this.searchChangeTimeStamp = currentTimeStamp;
    this.searchTimeOut = setTimeout(() => {
      this.currentSearchQuery = data.target.value.toLowerCase();
      this.pagination.page = 1;
      this.getListBBBSetting();
    }, this.searchDelayInMilliseconds);
  }

  onPerPageChanged(data) {
    const newItemsPerPage = parseInt(data.value, 10);
    if (newItemsPerPage <= 0) {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = this.BBBServerListFromAPI.length;
    } else {
      this.pagination.page = 1;
      this.pagination.itemsPerPage = newItemsPerPage;
    }
    this.handlePagination();
  }

  pageChanged(data) {
    this.pagination = data;
    this.handlePagination();
  }

  openAddBBBServerModal() {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalCreateEditBbbServerComponent, {
      class: 'modal-md',
      initialState: {
        isEditMode: false,
        selectedServerId: 0
      }
    });
  }

  openEditBBBServerModal(bbbServerEntry) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalCreateEditBbbServerComponent, {
      class: 'modal-md',
      initialState: {
        isEditMode: true,
        selectedServerId: bbbServerEntry.id
      },
      ignoreBackdropClick: true,
    });
  }

  openDeleteBBBServerConfirmationModal(bbbServerEntry) {
    this.prepareModalSubscription();
    this.bsModalRef = this.modalService.show(ModalDeleteBbbServerConfirmationComponent, {
      class: 'modal-md',
      initialState: {
        selectedBBBServer: bbbServerEntry
      },
      ignoreBackdropClick: true,
    });
  }

}
