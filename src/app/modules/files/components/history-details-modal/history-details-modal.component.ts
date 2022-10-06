import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';

import { Type } from '@enum/index.enum';
import { MessageService } from '@services/message.service';

declare var jQuery: any;

@Component({
  selector: 'app-history-details-modal',
  templateUrl: './history-details-modal.component.html',
  styleUrls: ['./history-details-modal.component.scss']
})
export class HistoryDetailsModalComponent implements OnInit, OnDestroy {

  private subscription: Subscription;
  @Input() Data;
  detailsHistory = [];
  titles = {
    'deldir': 'Removed directory',
    'modified': 'Modifiedd file',
    'new': 'Add new file',
    'newdir': 'Add new directory',
    'removed': 'Removed file',
    'renamed': 'Rename file'
  };

  dateTime: string;

  constructor(
    private messageService: MessageService
  ) {
    this.subscribe();
  }

  ngOnInit() {
  }

  subscribe() {
    this.subscription = this.messageService.subscribe(Type.Details_History_Modal, (payload) => {
      this.customDetails(payload.data);
    });
  }

  get unsubscribed() {
    return this.subscription && this.subscription.closed;
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.unsubscribe();
  }

  customDetails(data) {
    const details = [];
    this.dateTime = data.date_time;
    Object.entries(data).forEach(([key, value]) => {
      const keys = Object.keys(this.titles);
      if (value['length'] > 0 && keys.includes(key)) {
        details.push({
          'data': value,
          'message': this.titles[key]
        });
      }
    });
    this.detailsHistory = details;
  }
}
