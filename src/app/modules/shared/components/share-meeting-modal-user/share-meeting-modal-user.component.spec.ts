import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareMeetingModalUserComponent } from './share-meeting-modal-user.component';

describe('ShareMeetingModalUserComponent', () => {
  let component: ShareMeetingModalUserComponent;
  let fixture: ComponentFixture<ShareMeetingModalUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareMeetingModalUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareMeetingModalUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
