import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareLinkKanbanProjectComponent } from './share-link-kanban-project.component';

describe('ShareLinkKanbanProjectComponent', () => {
  let component: ShareLinkKanbanProjectComponent;
  let fixture: ComponentFixture<ShareLinkKanbanProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareLinkKanbanProjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareLinkKanbanProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
