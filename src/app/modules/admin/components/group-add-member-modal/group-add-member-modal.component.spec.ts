import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupAddMemberModalComponent } from './group-add-member-modal.component';

describe('GroupAddMemberModalComponent', () => {
  let component: GroupAddMemberModalComponent;
  let fixture: ComponentFixture<GroupAddMemberModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupAddMemberModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupAddMemberModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
