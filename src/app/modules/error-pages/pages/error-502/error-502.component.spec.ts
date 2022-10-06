import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Error502Component } from './error-502.component';

describe('Error502Component', () => {
  let component: Error502Component;
  let fixture: ComponentFixture<Error502Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Error502Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Error502Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
