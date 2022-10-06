import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CookieService } from 'ngx-cookie';

@Component({
  selector: 'app-range-size-grid',
  templateUrl: './range-size-grid.component.html',
  styleUrls: ['./range-size-grid.component.scss']
})
export class RangeSizeGridComponent implements OnInit {

  @Input() sizeMin = 100;
  @Input() sizeMax = 160;
  @Output() onRangeSize = new EventEmitter;

  isListView = this.cookieService.get('syc_view_mode') === 'list_view';
  cookieRangeSize = Number(this.cookieService.get('syc_range_size'));
  sizeValue = (this.cookieRangeSize >= this.sizeMin && this.cookieRangeSize <= this.sizeMax)
    ? this.cookieService.get('syc_range_size')
    : this.sizeMin;
  rangeDefaultValue;

  constructor(
    private cookieService: CookieService,
  ) { }

  ngOnInit() {
    this.rangeDefaultValue = this.sizeValue;
    this.onRangeSize.emit(this.sizeValue);
  }

  onChangeSize(size: string) {
    this.sizeValue = size;
    this.cookieService.put('syc_range_size', size);
    this.onRangeSize.emit(this.sizeValue);
  }
}
