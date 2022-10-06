import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDeleteModalComponent } from './admin-delete-modal.component';

describe('AdminDeleteModalComponent', () => {
  let component: AdminDeleteModalComponent;
  let fixture: ComponentFixture<AdminDeleteModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDeleteModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
