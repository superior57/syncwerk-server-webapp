import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateWikiFromExistingFolderComponent } from './modal-create-wiki-from-existing-folder.component';

describe('ModalCreateWikiFromExistingFolderComponent', () => {
  let component: ModalCreateWikiFromExistingFolderComponent;
  let fixture: ComponentFixture<ModalCreateWikiFromExistingFolderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCreateWikiFromExistingFolderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreateWikiFromExistingFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
