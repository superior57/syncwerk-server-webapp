import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalStartJoinMeetingComponent } from './modal-start-join-meeting.component';

describe('ModalStartJoinMeetingComponent', () => {
  let component: ModalStartJoinMeetingComponent;
  let fixture: ComponentFixture<ModalStartJoinMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalStartJoinMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalStartJoinMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
