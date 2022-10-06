import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-page-notification',
  templateUrl: './page-notification.component.html',
  styleUrls: ['./page-notification.component.scss']
})
export class PageNotificationComponent implements OnInit {

  @Input() message = '';
  constructor() { }

  ngOnInit() {
  }

}
