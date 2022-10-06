import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareMeetingModalComponent } from './share-meeting-modal.component';

describe('ShareMeetingModalComponent', () => {
  let component: ShareMeetingModalComponent;
  let fixture: ComponentFixture<ShareMeetingModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareMeetingModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareMeetingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
