import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-empty-item',
  templateUrl: './empty-item.component.html',
  styleUrls: ['./empty-item.component.scss']
})
export class EmptyItemComponent implements OnInit {

  @Input() messageTitle: string;
  @Input() messageSub: string;
  constructor() { }

  ngOnInit() {
  }

}
