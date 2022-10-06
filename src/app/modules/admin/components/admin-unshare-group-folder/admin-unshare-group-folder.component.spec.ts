import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUnshareGroupFolderComponent } from './admin-unshare-group-folder.component';

describe('AdminUnshareGroupFolderComponent', () => {
  let component: AdminUnshareGroupFolderComponent;
  let fixture: ComponentFixture<AdminUnshareGroupFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminUnshareGroupFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminUnshareGroupFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
