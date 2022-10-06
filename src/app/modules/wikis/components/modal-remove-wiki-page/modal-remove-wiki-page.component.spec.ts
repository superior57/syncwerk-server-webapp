import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRemoveWikiPageComponent } from './modal-remove-wiki-page.component';

describe('ModalRemoveWikiPageComponent', () => {
  let component: ModalRemoveWikiPageComponent;
  let fixture: ComponentFixture<ModalRemoveWikiPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalRemoveWikiPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRemoveWikiPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
