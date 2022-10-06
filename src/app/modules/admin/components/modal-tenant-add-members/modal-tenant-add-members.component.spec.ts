import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTenantAddMembersComponent } from './modal-tenant-add-members.component';

describe('ModalTenantAddMembersComponent', () => {
  let component: ModalTenantAddMembersComponent;
  let fixture: ComponentFixture<ModalTenantAddMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTenantAddMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTenantAddMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
