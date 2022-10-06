import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantUserListComponent } from './tenant-user-list.component';

describe('TenantUserListComponent', () => {
  let component: TenantUserListComponent;
  let fixture: ComponentFixture<TenantUserListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TenantUserListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantUserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
