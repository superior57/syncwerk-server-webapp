import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareExistingFolderComponent } from './share-existing-folder.component';

describe('ShareExistingFolderComponent', () => {
  let component: ShareExistingFolderComponent;
  let fixture: ComponentFixture<ShareExistingFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareExistingFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareExistingFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
