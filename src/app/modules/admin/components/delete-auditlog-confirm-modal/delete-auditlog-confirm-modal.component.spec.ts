import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAuditlogConfirmModalComponent } from './delete-auditlog-confirm-modal.component';

describe('DeleteAuditlogConfirmModalComponent', () => {
  let component: DeleteAuditlogConfirmModalComponent;
  let fixture: ComponentFixture<DeleteAuditlogConfirmModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteAuditlogConfirmModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteAuditlogConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
