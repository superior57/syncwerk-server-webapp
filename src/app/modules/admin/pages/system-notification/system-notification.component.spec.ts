import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemNotificationComponent } from './system-notification.component';

describe('SystemNotificationComponent', () => {
  let component: SystemNotificationComponent;
  let fixture: ComponentFixture<SystemNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
