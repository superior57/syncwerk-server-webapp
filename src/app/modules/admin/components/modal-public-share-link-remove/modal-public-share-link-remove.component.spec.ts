import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPublicShareLinkRemoveComponent } from './modal-public-share-link-remove.component';

describe('ModalPublicShareLinkRemoveComponent', () => {
  let component: ModalPublicShareLinkRemoveComponent;
  let fixture: ComponentFixture<ModalPublicShareLinkRemoveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalPublicShareLinkRemoveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalPublicShareLinkRemoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
