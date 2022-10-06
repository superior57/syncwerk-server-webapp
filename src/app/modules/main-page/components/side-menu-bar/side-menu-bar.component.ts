
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Type, Action } from '@enum/index.enum';
import { Router, NavigationEnd } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AppConfig } from 'app/app.config';
import { User } from 'app/Models/User.model';
import { AuthenticationService, I18nService, GroupsService, MessageService, AdminService, NonAuthenticationService } from '@services/index';
import { setTimeout } from 'core-js/library/web/timers';
import { getTypeRepoFromRoute } from 'app/app.helpers';

declare var jQuery: any;

@Component({
  selector: 'app-side-menu-bar',
  templateUrl: './side-menu-bar.component.html',
  styleUrls: ['./side-menu-bar.component.scss']
})
export class SideMenuBarComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  groupList;
  param: any;
  @Input() UserInfo: User;
  type: string;
  paths;
  menuAccess = {
    logout: true,
    accountSetting: false,
    adminArea: false,
  };
  isGuest = false;
  permissions: {
    can_add_repo: false,
    can_view_org: false,
    can_add_group: false,
    can_use_global_address_book: false,
    can_generate_share_link: false,
    can_generate_upload_link: false
  };

  menuSettings: any = {
    shareToAll: false,
    wiki: false,
  };

  isGetAvaiableFeatures;
  isEnableGroups = false;
  isEnabledFolderManager = false;
  isAdminArea = false;
  isTenantUserManagement = false;
  isWiki = false;
  isEnableVirusScan = false;
  isTrafficTracking = false;
  isEnableAditLog = false;
  isEnableMeetings = false;
  isKanbanEnabled = false;
  constructor(
    private router: Router,
    private appConfig: AppConfig,
    private authenticate: AuthenticationService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private translate: TranslateService,
    private i18nService: I18nService,
    private groupService: GroupsService,
    private adminService: AdminService,
    private nonAuthService: NonAuthenticationService,
  ) {

    this.nonAuthService.getAvailableFeatures().subscribe(resp => {
      this.authenticate.userInfo().subscribe(userResp => {
        this.isGetAvaiableFeatures = resp.data;
        this.isEnableGroups = this.isGetAvaiableFeatures.groups;
        this.isEnabledFolderManager = this.isGetAvaiableFeatures.folder_management;
        this.isAdminArea = this.isGetAvaiableFeatures.admin_area;
        this.isTenantUserManagement = this.isGetAvaiableFeatures.multi_tenancy && userResp.data.is_tenant_admin;
        this.isWiki = this.isGetAvaiableFeatures.wiki;
        this.isEnableVirusScan = this.isGetAvaiableFeatures.virusScanning;
        this.isTrafficTracking = this.isGetAvaiableFeatures.trafficTracking;
        this.isEnableAditLog = this.isGetAvaiableFeatures.auditLog;
        this.isEnableMeetings = this.isGetAvaiableFeatures.bbbMeetings;
        this.isKanbanEnabled = this.isGetAvaiableFeatures.kanban;
      });
    });

    // this.adminService.getRestapiSettingsByKeys('ENABLE_VIRUS_SCANNING').subscribe(resp => {
    //   this.isEnableVirusScan = resp.data.config_dict.ENABLE_VIRUS_SCANNING;
    // });

    this.getGroupList();
    translate.use(i18nService.getLanguage());
    this.paths = this.router.url.replace(/%2528/g, '(').replace(/%2529/g, ')').split('/')
      .filter(data => (data.length > 0))
      .filter(data => data !== 'folders')
      .filter(data => data !== 'files');
    this.handleMenuAccess();

    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd), distinctUntilChanged())
      .subscribe((event) => {
        this.returnType();
      });
  }

  ngOnInit() {
    jQuery('.scrollbar-macosx').scrollbar();
    this.subscribe();
    if (!this.type) { this.getType('mine'); }
    this.getMenuSettings();
  }

  getMenuSettings() {
    this.adminService.getRestapiSettingsByKeys('CLOUD_MODE,ENABLE_WIKI').subscribe(resp => {
      this.menuSettings = resp.data.config_dict;
    });
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Side_Menu_Bar_Component, (payload) => {
      switch (payload.action) {
        case Action.Reload_List_Groups:
          this.getGroupList();
          break;
        case Action.Show_Hide_Meeting_Menu:
          this.isEnableMeetings = payload.data ? true : false
          break;
        default: break;
      }
    });
  }

  get unsubscribed() {
    return this.subscription && this.subscription.closed;
  }

  handleMenuAccess() {
    this.authenticate.checkLogin().subscribe(resp => {
      if (resp.data.is_auth) {
        this.menuAccess.accountSetting = true;
        if (resp.data.is_staff) {
          this.menuAccess.adminArea = true;
        }
      }
      if (resp.data.is_guest !== undefined) {
        this.isGuest = resp.data.is_guest;
      }
      this.permissions = resp.data.permissions;
    });
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  getGroupList() {
    this.groupService.getListGroups()
      .subscribe(resps => this.groupList = this.sortListByName(resps.data), error => console.error(error));
  }

  sortListByName(list) {
    const listSort = list.sort((a, b) => {
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      } else if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }
      return 0;
    });
    return listSort;
  }

  logout() {
    this.authenticate.logout()
      .subscribe(res => {
        // this.cookieService.removeAll();
        this.router.navigate(['login']);
      }, error => {
        const status = error.status;
        switch (status) {
          case 401:
            // this.cookieService.removeAll();
            this.router.navigate(['login']);
            break;
          default: console.error(error); break;
        }
      });
  }

  getType(type, sub_id = null) {
    return new Promise((resovle, reject) => {
      try {
        setTimeout(() => {
          this.type = type;
          if (sub_id) {
            this.type = `${type}--${sub_id}`;
          }
        });
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }

  returnType() {
    this.type = getTypeRepoFromRoute(encodeURI(this.router.url).split('/'));
  }
}
