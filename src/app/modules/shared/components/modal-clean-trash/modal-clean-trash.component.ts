import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-clean-trash',
  templateUrl: './modal-clean-trash.component.html',
  styleUrls: ['./modal-clean-trash.component.scss']
})
export class ModalCleanTrashComponent implements OnInit {

  @Output() submitCleanTrash = new EventEmitter;

  isProcessing = false;

  constructor() { }

  ngOnInit() {
  }

  submitClean() {
    this.isProcessing = true;
    this.submitCleanTrash.emit();
  }
}
