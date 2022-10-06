import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTrafficComponent } from './admin-traffic.component';

describe('AdminTrafficComponent', () => {
  let component: AdminTrafficComponent;
  let fixture: ComponentFixture<AdminTrafficComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminTrafficComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTrafficComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
