import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTaskModalComponent } from './manage-task-modal.component';

describe('ManageTaskModalComponent', () => {
  let component: ManageTaskModalComponent;
  let fixture: ComponentFixture<ManageTaskModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTaskModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTaskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
