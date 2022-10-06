import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieDisclaimerModalComponent } from './cookie-disclaimer-modal.component';

describe('CookieDisclaimerModalComponent', () => {
  let component: CookieDisclaimerModalComponent;
  let fixture: ComponentFixture<CookieDisclaimerModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CookieDisclaimerModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CookieDisclaimerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
