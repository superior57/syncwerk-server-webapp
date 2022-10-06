import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteUserConfirmationModalComponent } from './delete-user-confirmation-modal.component';

describe('DeleteUserConfirmationModalComponent', () => {
  let component: DeleteUserConfirmationModalComponent;
  let fixture: ComponentFixture<DeleteUserConfirmationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteUserConfirmationModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteUserConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
