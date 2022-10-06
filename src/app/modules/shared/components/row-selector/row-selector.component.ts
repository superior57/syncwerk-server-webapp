import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

import { Select2OptionData } from 'ng2-select2';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-row-selector',
  templateUrl: './row-selector.component.html',
  styleUrls: ['./row-selector.component.scss']
})
export class RowSelectorComponent implements OnInit {
  @Input() isShowAll: boolean;
  @Output() changed = new EventEmitter();

  showFull: boolean = false;

  public perPageSelectData: Array<Select2OptionData> = [
    { id: '30', text: `30 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
    { id: '60', text: `60 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
    { id: '90', text: `90 ${this.translate.instant('FORMS.SELECTS.ITEMS')}` },
    { id: '-1', text: `${this.translate.instant('FORMS.SELECTS.EVERYTHING')}` }
  ];
  public perPageSelectDataListView: Array<Select2OptionData> = [
    { id: '30', text: `30 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
    { id: '60', text: `60 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
    { id: '90', text: `90 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
    { id: '-1', text: `${this.translate.instant('FORMS.SELECTS.EVERYTHING')}` }
  ];

  public perPageSelectDataNotAll: Array<Select2OptionData> = [
    { id: '30', text: `30 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
    { id: '60', text: `60 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
    { id: '90', text: `90 ${this.translate.instant('FORMS.SELECTS.ROWS')}` },
  ];

  public perPageSelectOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '130px',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };

  perPage: 10;
  typeViewMode = false;

  constructor(
    private translate: TranslateService,
    private cookiesService: CookieService,
  ) { }

  ngOnInit() {
    setInterval(() => {
      const getTypeViewMode = this.cookiesService.get('syc_view_mode');
      if (getTypeViewMode === 'grid_view') {
        this.typeViewMode = true;
      } else {
        this.typeViewMode = false;
      }
    }, 100);
    this.checkShowFull();
  }


  onValueChanged(data) {
    if (data.data[0].selected) {
      this.changed.emit(data);
    }
  }

  checkShowFull() {
    if (typeof(this.isShowAll) !== 'undefined' && !this.isShowAll) {
      this.showFull = true; 
    }
  }
}
