import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareMeetingModalPublicComponent } from './share-meeting-modal-public.component';

describe('ShareMeetingModalPublicComponent', () => {
  let component: ShareMeetingModalPublicComponent;
  let fixture: ComponentFixture<ShareMeetingModalPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareMeetingModalPublicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareMeetingModalPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
