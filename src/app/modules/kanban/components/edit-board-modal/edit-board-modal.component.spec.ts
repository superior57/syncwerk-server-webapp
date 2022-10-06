import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBoardModalComponent } from './edit-board-modal.component';

describe('EditBoardModalComponent', () => {
  let component: EditBoardModalComponent;
  let fixture: ComponentFixture<EditBoardModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBoardModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBoardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
