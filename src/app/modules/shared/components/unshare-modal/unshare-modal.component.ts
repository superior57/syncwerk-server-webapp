import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-unshare-modal',
  templateUrl: './unshare-modal.component.html',
  styleUrls: ['./unshare-modal.component.scss']
})
export class UnshareModalComponent implements OnInit {
  @Input() type: string;
  @Input() name: string;
  @Input() data: any;
  @Output() UnshareCallBack = new EventEmitter<any>();

  isProcessing = false;

  constructor() { }

  ngOnInit() {
    this.isProcessing = false;
  }

  unshareSubmit() {
    this.isProcessing = true;
    console.log(this.data);
    this.UnshareCallBack.emit(this.data);
  }
}
