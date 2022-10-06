import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalGroupRenameComponent } from './modal-group-rename.component';

describe('ModalGroupRenameComponent', () => {
  let component: ModalGroupRenameComponent;
  let fixture: ComponentFixture<ModalGroupRenameComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalGroupRenameComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalGroupRenameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
