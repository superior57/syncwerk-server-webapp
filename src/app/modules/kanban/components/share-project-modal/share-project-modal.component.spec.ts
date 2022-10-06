import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareProjectModalComponent } from './share-project-modal.component';

describe('ShareProjectModalComponent', () => {
  let component: ShareProjectModalComponent;
  let fixture: ComponentFixture<ShareProjectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProjectModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareProjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
