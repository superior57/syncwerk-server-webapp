import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRemoveWikiComponent } from './modal-remove-wiki.component';

describe('ModalRemoveWikiComponent', () => {
  let component: ModalRemoveWikiComponent;
  let fixture: ComponentFixture<ModalRemoveWikiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalRemoveWikiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRemoveWikiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
