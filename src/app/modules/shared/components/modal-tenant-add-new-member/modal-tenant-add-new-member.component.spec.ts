import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTenantAddNewMemberComponent } from './modal-tenant-add-new-member.component';

describe('ModalTenantAddNewMemberComponent', () => {
  let component: ModalTenantAddNewMemberComponent;
  let fixture: ComponentFixture<ModalTenantAddNewMemberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTenantAddNewMemberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalTenantAddNewMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
