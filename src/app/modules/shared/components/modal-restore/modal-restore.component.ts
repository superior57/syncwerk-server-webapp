import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-restore',
  templateUrl: './modal-restore.component.html',
  styleUrls: ['./modal-restore.component.scss']
})
export class ModalRestoreComponent implements OnInit {

  @Input() typeRestore = '';
  @Input() itemName = '';
  @Output() submitRestoreItem = new EventEmitter;

  isProcessing = false;
  params: any;

  constructor() { }

  ngOnInit() {
  }

  submitRestore() {
    this.isProcessing = true;
    this.submitRestoreItem.emit();
  }
}
