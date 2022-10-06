import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WikiPagesComponent } from './wiki-pages.component';

describe('WikiPagesComponent', () => {
  let component: WikiPagesComponent;
  let fixture: ComponentFixture<WikiPagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WikiPagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WikiPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
