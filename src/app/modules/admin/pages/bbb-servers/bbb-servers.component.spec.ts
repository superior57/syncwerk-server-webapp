import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BbbServersComponent } from './bbb-servers.component';

describe('BbbServersComponent', () => {
  let component: BbbServersComponent;
  let fixture: ComponentFixture<BbbServersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BbbServersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BbbServersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
