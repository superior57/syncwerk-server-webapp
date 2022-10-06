import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AdminService, AuthenticationService, NonAuthenticationService, NotificationService } from 'app/services';
import { sortByColumn, onChangeTable } from 'app/app.helpers';
import { Router } from '@angular/router';

declare var jQuery: any;


@Component({
  selector: 'app-auditlog',
  templateUrl: './auditlog.component.html',
  styleUrls: ['./auditlog.component.scss']
})
export class AuditlogComponent implements OnInit {
  
  enableAuditLog: boolean = false;
  columns: Array<any> = [];
  config: any = {
    paging: true,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
  };
  isProcessing = true;
  userList = [];
  hasNextPage = false;
  bigTotalItems = 0;
  isLoadingInProgress = true;
  isModelDelete = false;
  
  page: any = {
    currentPage: 1,
    itemsPerPage: 30,
    totalItems: 0
  };

  maxSize = 5;
  numPages = 1;
  length = 0;

  isShowFormSearch: boolean = false;
  searchAuditLogForm;
  
  auditLogListDisplay: Array<any> = [];

  listAction: Array<any> = [];
  listPermission: Array<any> = [];

  currentUserPermission: any = {
    can_manage_user: false,
  };

  errorForm: any = { 
    isError: false,
    errorMessageDate: '',
    errorMessageIp: ''
  };

  constructor(
    private translate: TranslateService, 
    private adminService: AdminService, 
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private nonAuthService: NonAuthenticationService,
    private router: Router,
    private noti: NotificationService) { 
      const ipPattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
      this.searchAuditLogForm = this.formBuilder.group({
        name: '',
        updated: '',
        startDate: '',
        endDate: '',
        ip: ['', Validators.pattern(ipPattern)],
        device_name: '',
        folder: '',
        folder_id:'',
        subfolder: '',
        action: '',
        recipient: '',
        permissions: ''
      });
    }
   
  ngOnInit() {
    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.enableAuditLog = resp.data.auditLog;
      if (!this.enableAuditLog) {
        this.router.navigate(['/error', '404']);
      }
    });

    this.authService.userInfo().subscribe(resp => {
      this.currentUserPermission = resp.data.permissions;
      this.initDataTable();
      this.getListAuditLog();
    })

    this.getListDropDown();
  }

  initDataTable() {
    this.columns = [
      {
        title: this.translate.instant('ADMIN.AUDIT_LOG.TABLE.NAME'),
        name: 'name',
        width: '20%',
        class: '',
      },
      {
        title: this.translate.instant('ADMIN.AUDIT_LOG.TABLE.UPDATED'),
        name: 'updated_at',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      },
      {
        title: this.translate.instant('ADMIN.AUDIT_LOG.TABLE.IP/DEVICE'),
        name: 'ip_address',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      },
      {
        title: this.translate.instant('ADMIN.AUDIT_LOG.TABLE.DEVICE_NAME'),
        name: 'device_name',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      },
      {
        title: this.translate.instant('ADMIN.AUDIT_LOG.TABLE.FOLDER'),
        name: 'folder',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      },
      {
        title: this.translate.instant('ADMIN.AUDIT_LOG.TABLE.FOLDER_ID'),
        name: 'folder_id',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      },
      {
        title: this.translate.instant('ADMIN.AUDIT_LOG.TABLE.SUB_FOLDER'),
        name: 'sub_folder_file',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      },
      {
        title: this.translate.instant('ADMIN.AUDIT_LOG.TABLE.ACTIONS'),
        name: 'action_type',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      },
      {
        title: this.translate.instant('ADMIN.AUDIT_LOG.TABLE.RECIPIENT'),
        name: 'recipient',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      },
      {
        title: this.translate.instant('ADMIN.AUDIT_LOG.TABLE.PERMISSION'),
        name: 'permission',
        width: '10%',
        class: 'd-none d-lg-table-cell'
      }
    ];
    this.config.sorting.columns = this.columns;
  }

  getListAuditLog(perPage = 10, page = 1) {
    this.formatData(this.searchAuditLogForm.value);
    console.log(this.searchAuditLogForm.value);
    this.adminService.getListAuditLog(perPage, page, this.searchAuditLogForm.value).subscribe(
      (resps) => {
        this.auditLogListDisplay = resps.data.audit_log;
        this.isProcessing = false;
        this.page.totalItems = resps.data.page_info.total_result;
      }
    );
  }

  getListDropDown() {
    this.adminService.getListDropDownAuditLog().subscribe(
      (resps) => {
        this.listAction = resps.data.action_type
        this.listPermission = resps.data.permission
      }
    )
  }

  sortColumn(column, config) {
    const data = sortByColumn(column, this.auditLogListDisplay, this.columns, config, this.page);
    this.auditLogListDisplay = data.rows;
  }

  onPerPageChanged(e) {
    this.page.itemsPerPage = e.value;
    this.getListAuditLog(this.page.itemsPerPage, this.page.currentPage);
  }

  onSearch(dataSearch) {
    console.log('search');
    console.log(this.searchAuditLogForm.value);
    this.formatData(this.searchAuditLogForm.value);
    this.validateForm();
    if (!this.errorForm.isError) {
      this.page.currentPage = 1;
      this.getListAuditLog(this.page.itemsPerPage);
    }
  }

  validateForm() {
    let ip = this.searchAuditLogForm.value.ip;
    if (ip !== '') {
      this.validateIPaddress(this.searchAuditLogForm.value.ip);
    } else if (ip == '') {
      this.errorForm.errorMessageIp = '';
    }
    
    this.compareTwoDates();
    if (this.errorForm.errorMessageIp.length > 0 || this.errorForm.errorMessageDate.length > 0) {
      this.errorForm.isError = true;
    } else if (this.errorForm.errorMessageIp.length == 0 && this.errorForm.errorMessageDate.length == 0) {
      this.errorForm.isError = false;
    }
  }

  validateIPaddress(ipaddress) {  
    const ipPattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
    if (ipPattern.test(ipaddress)) {  
      this.errorForm.errorMessageIp = '';
    } else {
      this.errorForm.errorMessageIp = 'Invalid Ip Address';
    }
  }  

  compareTwoDates(){
    if (new Date(this.searchAuditLogForm.value.endDate) < new Date(this.searchAuditLogForm.value.startDate)){
      this.errorForm.errorMessageDate = 'End date must be after start date';
    } else {
      this.errorForm.errorMessageDate = '';
    }
  }

  formatData(data) {
    for( let key in data ){
      if (data[key] === null) {
        data[key] = '';
      }
    }
  }

  resetForm() {
    this.errorForm = {
      isError: false,
      errorMessageDate: '',
      errorMessageIp: ''
    };
    this.searchAuditLogForm.reset();
    this.getListAuditLog();
  }

  showFormSearch() {
    this.isShowFormSearch = !this.isShowFormSearch;
  }

  clearLogs() {
    this.adminService.deleteAllAuditLog().subscribe((resps) => {
      this.getListAuditLog();
    })
  }

  refreshLogs() {
    this.getListAuditLog();
  }

  export(event) {
    event.target.disabled = true;
    this.formatData(this.searchAuditLogForm.value);
    this.adminService.exportAuditLog(this.searchAuditLogForm.value).subscribe((resps) => {
      this.noti.showNotification('success',this.translate.instant('ADMIN.AUDIT_LOG.CSV_EXPORT_SUCCESS'))
      window.location.href = resps.url;
    }, err => {
      if (err.status === 400) {
        this.noti.showNotification('danger', this.translate.instant('ADMIN.AUDIT_LOG.CSV_EXPORT_WRONG_DATE'));
      } else {
        this.noti.showNotification('danger', this.translate.instant('ADMIN.SUDO.MESSAGES.INTERNAL_SERVER_ERROR'));
      }
      this.isProcessing = false;
    }).add(() => {
      event.target.disabled = false;
 });
  }

  pageChanged(config, page = this.page) {
    const requestPage = config.page;
    this.page.currentPage = requestPage;
    this.getListAuditLog(this.page.itemsPerPage, this.page.currentPage);
    document.documentElement.scrollTop = 0;
  }

  openDeleteConfirmModal() {
    this.isModelDelete = true;
    this.openModal('#delete-auditlog-confirm-modal', () => this.isModelDelete = false);
  }

  openModal(idModal: string, functionCloseModal: any) {
    setTimeout(() => {
      jQuery(idModal)
        .on('hidden.bs.modal', functionCloseModal)
        .modal('show');
    });
  }

  onAuditLogDeleteSuccess(data) {
    jQuery('#delete-auditlog-confirm-modal').modal('hide');
    this.noti.showNotification('success', data.message);
    this.getListAuditLog();
  }
}
