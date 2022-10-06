import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTenantRemoveMembersComponent } from './modal-tenant-remove-members.component';

describe('ModalTenantRemoveMembersComponent', () => {
  let component: ModalTenantRemoveMembersComponent;
  let fixture: ComponentFixture<ModalTenantRemoveMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTenantRemoveMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTenantRemoveMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
