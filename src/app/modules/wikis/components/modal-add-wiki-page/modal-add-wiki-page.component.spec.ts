import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddWikiPageComponent } from './modal-add-wiki-page.component';

describe('ModalAddWikiPageComponent', () => {
  let component: ModalAddWikiPageComponent;
  let fixture: ComponentFixture<ModalAddWikiPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddWikiPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddWikiPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
