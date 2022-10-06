import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalChangeUserMaxMeetingComponent } from './modal-change-user-max-meeting.component';

describe('ModalChangeUserMaxMeetingComponent', () => {
  let component: ModalChangeUserMaxMeetingComponent;
  let fixture: ComponentFixture<ModalChangeUserMaxMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalChangeUserMaxMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalChangeUserMaxMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
