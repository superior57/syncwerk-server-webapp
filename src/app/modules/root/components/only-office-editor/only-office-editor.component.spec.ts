import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlyOfficeEditorComponent } from './only-office-editor.component';

describe('OnlyOfficeEditorComponent', () => {
  let component: OnlyOfficeEditorComponent;
  let fixture: ComponentFixture<OnlyOfficeEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlyOfficeEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlyOfficeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
