import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreateChildFileModalComponent } from './admin-create-child-file-modal.component';

describe('AdminCreateChildFileModalComponent', () => {
  let component: AdminCreateChildFileModalComponent;
  let fixture: ComponentFixture<AdminCreateChildFileModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminCreateChildFileModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCreateChildFileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
