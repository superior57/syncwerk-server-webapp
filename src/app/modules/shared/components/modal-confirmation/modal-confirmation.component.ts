import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-confirmation',
  templateUrl: './modal-confirmation.component.html',
  styleUrls: ['./modal-confirmation.component.scss']
})
export class ModalConfirmationComponent implements OnInit {

  @Input() title: string;
  @Input() verifyQuestion: string;
  @Input() warningMessage = '';
  @Output() submit = new EventEmitter;

  isProcessing = false;
  params: any;

  constructor() { }

  ngOnInit() {
  }

  submitYes() {
    this.isProcessing = true;
    this.submit.emit();
  }
}
