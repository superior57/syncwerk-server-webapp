import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

@Component({
  selector: 'app-cookie-disclaimer-modal',
  templateUrl: './cookie-disclaimer-modal.component.html',
  styleUrls: ['./cookie-disclaimer-modal.component.scss']
})
export class CookieDisclaimerModalComponent implements OnInit {

  disclaimerContent = '';

  constructor(
    private bsModalRef: BsModalRef,
  ) { }

  ngOnInit() {
  }

  closeModal() {
    this.bsModalRef.hide();
  }
}
