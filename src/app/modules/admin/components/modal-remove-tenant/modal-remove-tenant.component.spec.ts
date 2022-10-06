import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRemoveTenantComponent } from './modal-remove-tenant.component';

describe('ModalRemoveTenantComponent', () => {
  let component: ModalRemoveTenantComponent;
  let fixture: ComponentFixture<ModalRemoveTenantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalRemoveTenantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRemoveTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
