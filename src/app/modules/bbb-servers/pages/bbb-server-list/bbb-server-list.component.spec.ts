import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BbbServerListComponent } from './bbb-server-list.component';

describe('BbbServerListComponent', () => {
  let component: BbbServerListComponent;
  let fixture: ComponentFixture<BbbServerListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BbbServerListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BbbServerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
