import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalDeleteBbbServerComponent } from './modal-delete-bbb-server.component';

describe('ModalDeleteBbbServerComponent', () => {
  let component: ModalDeleteBbbServerComponent;
  let fixture: ComponentFixture<ModalDeleteBbbServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalDeleteBbbServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDeleteBbbServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
