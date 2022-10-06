import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateNewWikiComponent } from './modal-create-new-wiki.component';

describe('ModalCreateNewWikiComponent', () => {
  let component: ModalCreateNewWikiComponent;
  let fixture: ComponentFixture<ModalCreateNewWikiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCreateNewWikiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreateNewWikiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
