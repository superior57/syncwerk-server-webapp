import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmEmailChangeRequestComponent } from './confirm-email-change-request.component';

describe('ConfirmEmailChangeRequestComponent', () => {
  let component: ConfirmEmailChangeRequestComponent;
  let fixture: ComponentFixture<ConfirmEmailChangeRequestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmEmailChangeRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmEmailChangeRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
