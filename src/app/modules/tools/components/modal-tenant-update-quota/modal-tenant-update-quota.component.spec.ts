import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTenantUpdateQuotaComponent } from './modal-tenant-update-quota.component';

describe('ModalTenantUpdateQuotaComponent', () => {
  let component: ModalTenantUpdateQuotaComponent;
  let fixture: ComponentFixture<ModalTenantUpdateQuotaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTenantUpdateQuotaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTenantUpdateQuotaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
