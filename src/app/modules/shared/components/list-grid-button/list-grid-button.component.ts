import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CookieService } from 'ngx-cookie';

import { MessageService } from '@services/index';
import { Type, Action } from '@enum/index.enum';

declare var jQuery: any;

@Component({
  selector: 'app-list-grid-button',
  templateUrl: './list-grid-button.component.html',
  styleUrls: ['./list-grid-button.component.scss']
})
export class ListGridButtonComponent implements OnInit {

  @Output() onChangeViewMode = new EventEmitter;

  isListView = this.cookieService.get('syc_view_mode') === 'list_view' ? true : false;
  params: any;

  constructor(
    private cookieService: CookieService,
    private messageService: MessageService,
  ) { }

  ngOnInit() {
    // set default
    // jQuery('[data-toggle="tooltip"]').tooltip();
    if (!this.cookieService.get('syc_view_mode')) {
      this.cookieService.put('syc_view_mode', 'grid_view');
    }
  }

  changeListView(isListView: boolean) {
    this.isListView = isListView;
    this.cookieService.put('syc_view_mode', this.isListView ? 'list_view' : 'grid_view');
    this.onChangeViewMode.emit(this.isListView);
  }
}
