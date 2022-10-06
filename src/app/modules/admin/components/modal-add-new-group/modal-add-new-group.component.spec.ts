import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddNewGroupComponent } from './modal-add-new-group.component';

describe('ModalAddNewGroupComponent', () => {
  let component: ModalAddNewGroupComponent;
  let fixture: ComponentFixture<ModalAddNewGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddNewGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddNewGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
