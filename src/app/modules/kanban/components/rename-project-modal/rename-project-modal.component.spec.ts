import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenameProjectModalComponent } from './rename-project-modal.component';

describe('RenameProjectModalComponent', () => {
  let component: RenameProjectModalComponent;
  let fixture: ComponentFixture<RenameProjectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenameProjectModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameProjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
