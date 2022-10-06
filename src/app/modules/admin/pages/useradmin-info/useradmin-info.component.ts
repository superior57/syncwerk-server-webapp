import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminService, NotificationService, TitleService } from 'app/services';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

// components
import { UseradminInfoProfilesComponent } from 'app/modules/admin/components/useradmin-info-profiles/useradmin-info-profiles.component';


declare const jQuery: any;

@Component({
  selector: 'app-useradmin-info',
  templateUrl: './useradmin-info.component.html',
  styleUrls: ['./useradmin-info.component.scss']
})
export class UseradminInfoComponent implements OnInit {

  @ViewChild(UseradminInfoProfilesComponent) useradminInfoProfilesComponent;

  userEmail: string;
  tabName = '';
  dataUserAdminInfo = null;
  params: any;
  getInfoUserName = '';

  constructor(
    private adminService: AdminService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private notification: NotificationService,
    private translate: TranslateService,
    private titleService: TitleService
  ) {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      this.tabName = paramMap.get('tab_name');
    });
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      this.userEmail = paramMap.get('email');
      this.getAdminUserInfo();
    });
  }

  getAdminUserInfo() {
    this.adminService.getSysAdminUsersInfo(this.userEmail)
      .subscribe(resps => {
        this.dataUserAdminInfo = resps.data;
        this.getInfoUserName = this.dataUserAdminInfo.email;
        this.handleTabActive(this.tabName);
        this.titleService.setTitle([
          {
            str: this.dataUserAdminInfo.email,
            translate: false
          },
          {
            str: "TITLE_PAGE.USER_INFO",
            translate: true
          }
        ])
      });
  }

  onReloadData(dataReload: any, idModal: string = '') {
    if (idModal !== '') { jQuery(idModal).modal('hide'); }
    this.notification.showNotification('success', dataReload.message_success);
    this.getAdminUserInfo();
  }

  handleTabActive(nameTab: string) {
    this.router.navigate(['/admin', 'users', 'info', this.userEmail, nameTab]);
    this.tabName = nameTab;
    // if (nameTab !== 'profile') {
    //   this.useradminInfoProfilesComponent.changeDisplay('');
    // }
  }
}
