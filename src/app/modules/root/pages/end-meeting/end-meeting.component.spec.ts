import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndMeetingComponent } from './end-meeting.component';

describe('EndMeetingComponent', () => {
  let component: EndMeetingComponent;
  let fixture: ComponentFixture<EndMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
