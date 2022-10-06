import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SudoComponent } from './sudo.component';

describe('SudoComponent', () => {
  let component: SudoComponent;
  let fixture: ComponentFixture<SudoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SudoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SudoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
