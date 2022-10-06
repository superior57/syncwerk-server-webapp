import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareMeetingModalGroupComponent } from './share-meeting-modal-group.component';

describe('ShareMeetingModalGroupComponent', () => {
  let component: ShareMeetingModalGroupComponent;
  let fixture: ComponentFixture<ShareMeetingModalGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareMeetingModalGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareMeetingModalGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
