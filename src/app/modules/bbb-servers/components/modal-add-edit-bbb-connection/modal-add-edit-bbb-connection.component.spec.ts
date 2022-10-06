import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddEditBbbConnectionComponent } from './modal-add-edit-bbb-connection.component';

describe('ModalAddEditBbbConnectionComponent', () => {
  let component: ModalAddEditBbbConnectionComponent;
  let fixture: ComponentFixture<ModalAddEditBbbConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddEditBbbConnectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddEditBbbConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
