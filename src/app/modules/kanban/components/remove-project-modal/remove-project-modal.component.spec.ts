import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveProjectModalComponent } from './remove-project-modal.component';

describe('RemoveProjectModalComponent', () => {
  let component: RemoveProjectModalComponent;
  let fixture: ComponentFixture<RemoveProjectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoveProjectModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveProjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
