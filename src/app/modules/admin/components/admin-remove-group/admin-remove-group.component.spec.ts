import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRemoveGroupComponent } from './admin-remove-group.component';

describe('AdminRemoveGroupComponent', () => {
  let component: AdminRemoveGroupComponent;
  let fixture: ComponentFixture<AdminRemoveGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminRemoveGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRemoveGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
