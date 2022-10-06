import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareLinkKanbanTaskModalComponent } from './share-link-kanban-task-modal.component';

describe('ShareLinkKanbanTaskModalComponent', () => {
  let component: ShareLinkKanbanTaskModalComponent;
  let fixture: ComponentFixture<ShareLinkKanbanTaskModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareLinkKanbanTaskModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareLinkKanbanTaskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
