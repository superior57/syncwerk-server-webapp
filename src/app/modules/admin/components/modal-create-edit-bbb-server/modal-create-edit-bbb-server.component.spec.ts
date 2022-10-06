import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreateEditBbbServerComponent } from './modal-create-edit-bbb-server.component';

describe('ModalCreateEditBbbServerComponent', () => {
  let component: ModalCreateEditBbbServerComponent;
  let fixture: ComponentFixture<ModalCreateEditBbbServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCreateEditBbbServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreateEditBbbServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
