import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateSystemNotificationComponent } from './modal-create-system-notification.component';

describe('ModalCreateSystemNotificationComponent', () => {
  let component: ModalCreateSystemNotificationComponent;
  let fixture: ComponentFixture<ModalCreateSystemNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCreateSystemNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreateSystemNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
