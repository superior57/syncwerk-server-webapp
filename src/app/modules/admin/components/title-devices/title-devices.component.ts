import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18nService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';
import { Select2OptionData } from 'ng2-select2';

@Component({
  selector: 'app-title-devices',
  templateUrl: './title-devices.component.html',
  styleUrls: ['./title-devices.component.scss']
})
export class TitleDevicesComponent implements OnInit {

  @Input() typeDevice: string;
  params: any;
  textDesktops;
  textMobiles;

  public statusSelectData: Array<Select2OptionData>;
  public options: Select2Options = {
    minimumResultsForSearch: 100
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private i18nService: I18nService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.get('ADMIN.DEVICES.TITLE.DESKTOPS').subscribe(desktops => this.textDesktops = desktops);
    this.translate.get('ADMIN.DEVICES.TITLE.MOBILES').subscribe(mobiles => this.textMobiles = mobiles);
    this.statusSelectData = [
      {
        id: 'desktops',
        text: this.textDesktops
      },
      {
        id: 'mobiles',
        text: this.textMobiles
      }
    ];
  }

  changeDevice(event) {
    this.router.navigate(['admin/devices/' + event.value]);
  }

}
