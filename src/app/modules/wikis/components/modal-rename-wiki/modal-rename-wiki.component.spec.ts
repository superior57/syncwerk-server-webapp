import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRenameWikiComponent } from './modal-rename-wiki.component';

describe('ModalRenameWikiComponent', () => {
  let component: ModalRenameWikiComponent;
  let fixture: ComponentFixture<ModalRenameWikiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalRenameWikiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRenameWikiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
