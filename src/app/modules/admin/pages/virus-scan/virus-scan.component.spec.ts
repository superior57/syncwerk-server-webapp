import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirusScanComponent } from './virus-scan.component';

describe('VirusScanComponent', () => {
  let component: VirusScanComponent;
  let fixture: ComponentFixture<VirusScanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VirusScanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirusScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
