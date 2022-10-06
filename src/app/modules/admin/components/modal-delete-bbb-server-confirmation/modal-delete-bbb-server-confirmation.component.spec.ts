import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDeleteBbbServerConfirmationComponent } from './modal-delete-bbb-server-confirmation.component';

describe('ModalDeleteBbbServerConfirmationComponent', () => {
  let component: ModalDeleteBbbServerConfirmationComponent;
  let fixture: ComponentFixture<ModalDeleteBbbServerConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalDeleteBbbServerConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDeleteBbbServerConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
