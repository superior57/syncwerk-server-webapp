import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRenameWikiPageComponent } from './modal-rename-wiki-page.component';

describe('ModalRenameWikiPageComponent', () => {
  let component: ModalRenameWikiPageComponent;
  let fixture: ComponentFixture<ModalRenameWikiPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalRenameWikiPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRenameWikiPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
