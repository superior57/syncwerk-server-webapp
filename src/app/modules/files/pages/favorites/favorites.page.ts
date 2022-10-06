import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { TranslateService } from '@ngx-translate/core';
import { TitleService }     from 'app/services';
@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss']
})
export class FavoritesPageComponent implements OnInit {

  params: any;
  isListView = this.cookieService.get('syc_view_mode') === 'list_view' ? true : false;
  dataRangeSizeGrid: { [key: string]: any } = {};

  constructor(
    private cookieService: CookieService,
    private translate: TranslateService,
    private titleService: TitleService
  ) { }

  ngOnInit() {
    this.titleService.setTitle(
      [
        {
          str: "TITLE_PAGE.FAVORITES",
          translate: true
        }
      ]);
  }

  onChangeViewMode(isListView: boolean) {
    this.isListView = isListView;
  }

  changeTypeCol(rangeSizeValue: string) {
    const numberRangeSize = Number(rangeSizeValue);
    if (numberRangeSize >= 100 && numberRangeSize < 120) {
      this.dataRangeSizeGrid.rangeTransformScale = numberRangeSize / 100;
      this.dataRangeSizeGrid.rangeClass = 'col-xl-3 col-md-2 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 120 && numberRangeSize < 150) {
      this.dataRangeSizeGrid.rangeTransformScale = (numberRangeSize + 20) / 100;
      this.dataRangeSizeGrid.rangeClass = 'col-xl-3  col-md-3 col-sm-6 col-xs-12';
    } else if (numberRangeSize >= 150 && numberRangeSize <= 160) {
      this.dataRangeSizeGrid.rangeTransformScale = (numberRangeSize + 40) / 100;
      this.dataRangeSizeGrid.rangeClass = 'col-xl-3 col-md-4 col-sm-6 col-xs-12';
    }
    this.dataRangeSizeGrid.rangeHeightPx = 100 * this.dataRangeSizeGrid.rangeTransformScale + 'px';
  }
}
