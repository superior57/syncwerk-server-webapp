import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCmsFileChooserComponent } from './modal-cms-file-chooser.component';

describe('ModalCmsFileChooserComponent', () => {
  let component: ModalCmsFileChooserComponent;
  let fixture: ComponentFixture<ModalCmsFileChooserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCmsFileChooserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCmsFileChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
