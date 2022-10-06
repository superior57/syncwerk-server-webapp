import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupFoldersComponent } from './group-folders.component';

describe('GroupFoldersComponent', () => {
  let component: GroupFoldersComponent;
  let fixture: ComponentFixture<GroupFoldersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupFoldersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupFoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
