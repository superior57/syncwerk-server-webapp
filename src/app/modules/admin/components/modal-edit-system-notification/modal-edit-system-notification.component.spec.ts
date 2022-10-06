import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditSystemNotificationComponent } from './modal-edit-system-notification.component';

describe('ModalEditSystemNotificationComponent', () => {
  let component: ModalEditSystemNotificationComponent;
  let fixture: ComponentFixture<ModalEditSystemNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalEditSystemNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditSystemNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
