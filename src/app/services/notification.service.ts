import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { TranslateService } from '@ngx-translate/core';
declare var jQuery: any;

@Injectable()
export class NotificationService {
  constructor(private translateService: TranslateService) { }
  showNotificationByMessageKey(type: string, messageKey: string, time: number = 1000) {
    const message = this.translateService.instant(messageKey);
    this.showNotification(type, message, time);
  }

  showNotification(type: string, message: string, time: number = 1000) {
    jQuery.notify({
      // options
      message: message
    }, {
        // settings
        z_index: 1051,
        type: type,
        timer: time,
        placement: {
          from: 'bottom',
          align: 'right'
        },
        animate: {
          enter: 'animated flipInX',
          exit: 'animated flipOutX'
        },
        // tslint:disable-next-line:max-line-length
        template: '<div data-notify="container" class="alert alert-dismissible alert-{0} alert--notify" role="alert">' +
          '<span data-notify="icon"></span> ' +
          '<span data-notify="title">{1}</span> ' +
          '<span data-notify="message">{2}</span>' +
          '<div class="progress" data-notify="progressbar">' +
          // tslint:disable-next-line:max-line-length
          '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
          '</div>' +
          '<a href="{3}" target="{4}" data-notify="url"></a>' +
          '<button type="button" aria-hidden="true" data-notify="dismiss" class="alert--notify__close">X</button>' +
          '</div>'
      });
  }
}
