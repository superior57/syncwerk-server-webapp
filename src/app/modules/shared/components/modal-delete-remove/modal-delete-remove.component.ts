import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-delete-remove',
  templateUrl: './modal-delete-remove.component.html',
  styleUrls: ['./modal-delete-remove.component.scss']
})
export class ModalDeleteRemoveComponent implements OnInit {

  @Input() typeDelete = '';
  @Input() itemName = '';
  @Input() warningMessage = '';
  @Input() isDeleteModal = true;
  @Output() submitDeleteItem = new EventEmitter;
  @Output() submitRemoveItem = new EventEmitter;

  isProcessing = false;
  params: any;

  constructor() { }

  ngOnInit() {
  }

  submitDelete() {
    this.isProcessing = true;
    this.isDeleteModal ? this.submitDeleteItem.emit() : this.submitRemoveItem.emit();
  }
}
