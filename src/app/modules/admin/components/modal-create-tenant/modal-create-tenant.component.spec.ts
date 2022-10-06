import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateTenantComponent } from './modal-create-tenant.component';

describe('ModalCreateTenantComponent', () => {
  let component: ModalCreateTenantComponent;
  let fixture: ComponentFixture<ModalCreateTenantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCreateTenantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreateTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
