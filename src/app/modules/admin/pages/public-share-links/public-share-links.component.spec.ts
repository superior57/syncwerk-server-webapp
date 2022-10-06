import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicShareLinksComponent } from './public-share-links.component';

describe('PublicShareLinksComponent', () => {
  let component: PublicShareLinksComponent;
  let fixture: ComponentFixture<PublicShareLinksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PublicShareLinksComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicShareLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
