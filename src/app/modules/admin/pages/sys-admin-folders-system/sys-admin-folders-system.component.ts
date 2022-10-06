import { Component, OnInit } from '@angular/core';
import { AdminService } from 'app/services';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';
@Component({
  selector: 'app-sys-admin-folders-system',
  templateUrl: './sys-admin-folders-system.component.html',
  styleUrls: ['./sys-admin-folders-system.component.scss']
})
export class SysAdminFoldersSystemComponent implements OnInit {

  dataSystemFolders: any;
  isProcessing = true;
  params: any;
  textAll;
  textSystem;
  textTrash;

  public statusSelectData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };

  constructor(
    private adminService: AdminService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private i18nService: I18nService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.get('ADMIN.FOLDERS.DROPDOWN_TITLE.ALL').subscribe(all => this.textAll = all);
    this.translate.get('ADMIN.FOLDERS.DROPDOWN_TITLE.SYSTEM').subscribe(system => this.textSystem = system);
    this.translate.get('ADMIN.FOLDERS.DROPDOWN_TITLE.TRASH').subscribe(trash => this.textTrash = trash);
    this.statusSelectData = [
      {
        id: 'all',
        text: this.textAll
      },
      {
        id: 'system',
        text: this.textSystem
      },
      {
        id: 'trash',
        text: this.textTrash
      }
    ];
    this.handleDataSystemFolders();
  }

  async handleDataSystemFolders() {
    await this.getDataFoldersSystem().then(resps => {
      let des;
      des = resps.data.description.split('\'');
      resps.data.des_name = des[1];
      this.dataSystemFolders = resps.data;
    });
    if (this.isProcessing) {
      this.waitingLoadData();
    }
  }

  getDataFoldersSystem(): Promise<any> {
    return new Promise((resolve) => this.adminService.getSystemFolders().subscribe(resps => resolve(resps)));
  }

  waitingLoadData(): Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve(this.isProcessing = false), 200));
  }

  openSystemFolders() {
    this.router.navigate(['admin', 'folders', 'system', this.dataSystemFolders.id]);
  }

  changeFolder(event) {
    this.router.navigate(['admin/folders/' + event.value + '-folders']);
  }
}
