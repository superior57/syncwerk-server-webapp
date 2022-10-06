import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConfirmRemoveEmailChangeRequestComponent } from './modal-confirm-remove-email-change-request.component';

describe('ModalConfirmRemoveEmailChangeRequestComponent', () => {
  let component: ModalConfirmRemoveEmailChangeRequestComponent;
  let fixture: ComponentFixture<ModalConfirmRemoveEmailChangeRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalConfirmRemoveEmailChangeRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalConfirmRemoveEmailChangeRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
