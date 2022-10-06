import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupRemoveMemberModalComponent } from './group-remove-member-modal.component';

describe('GroupRemoveMemberModalComponent', () => {
  let component: GroupRemoveMemberModalComponent;
  let fixture: ComponentFixture<GroupRemoveMemberModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupRemoveMemberModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupRemoveMemberModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
