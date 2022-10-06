import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from '@services/index';

@Component({
  selector: 'app-useradmin-info-shared-folders',
  templateUrl: './useradmin-info-shared-folders.component.html',
  styleUrls: ['./useradmin-info-shared-folders.component.scss']
})
export class UseradminInfoSharedLibsComponent implements OnInit {

  @Input() listSharedLibs = [];

  enableViewRepo = false;

  constructor(
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    this.adminService.getRestapiSettingsByKeys('ENABLE_SYS_ADMIN_VIEW_REPO').subscribe(resp => {
      this.enableViewRepo = resp.data.config_dict.ENABLE_SYS_ADMIN_VIEW_REPO;
    });
  }

}
