import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailChangingRequestComponent } from './email-changing-request.component';

describe('EmailChangingRequestComponent', () => {
  let component: EmailChangingRequestComponent;
  let fixture: ComponentFixture<EmailChangingRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailChangingRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailChangingRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
