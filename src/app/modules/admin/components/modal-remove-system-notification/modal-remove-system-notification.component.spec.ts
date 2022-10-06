import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRemoveSystemNotificationComponent } from './modal-remove-system-notification.component';

describe('ModalRemoveSystemNotificationComponent', () => {
  let component: ModalRemoveSystemNotificationComponent;
  let fixture: ComponentFixture<ModalRemoveSystemNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalRemoveSystemNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalRemoveSystemNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
