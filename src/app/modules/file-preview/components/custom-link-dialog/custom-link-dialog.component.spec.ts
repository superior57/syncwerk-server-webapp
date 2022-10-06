import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomLinkDialogComponent } from './custom-link-dialog.component';

describe('CustomLinkDialogComponent', () => {
  let component: CustomLinkDialogComponent;
  let fixture: ComponentFixture<CustomLinkDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomLinkDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomLinkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
