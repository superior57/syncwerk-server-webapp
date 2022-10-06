import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareLinkMeetingComponent } from './share-link-meeting.component';

describe('ShareLinkMeetingComponent', () => {
  let component: ShareLinkMeetingComponent;
  let fixture: ComponentFixture<ShareLinkMeetingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareLinkMeetingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareLinkMeetingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
