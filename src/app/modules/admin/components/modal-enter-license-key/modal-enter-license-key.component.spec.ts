import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEnterLicenseKeyComponent } from './modal-enter-license-key.component';

describe('ModalEnterLicenseKeyComponent', () => {
  let component: ModalEnterLicenseKeyComponent;
  let fixture: ComponentFixture<ModalEnterLicenseKeyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalEnterLicenseKeyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEnterLicenseKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
