import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInternalShareRemoveComponent } from './modal-internal-share-remove.component';

describe('ModalInternalShareRemoveComponent', () => {
  let component: ModalInternalShareRemoveComponent;
  let fixture: ComponentFixture<ModalInternalShareRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInternalShareRemoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInternalShareRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
