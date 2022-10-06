import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalMeetingFileChooserComponent } from './modal-meeting-file-chooser.component';

describe('ModalMeetingFileChooserComponent', () => {
  let component: ModalMeetingFileChooserComponent;
  let fixture: ComponentFixture<ModalMeetingFileChooserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalMeetingFileChooserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalMeetingFileChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
