import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachmentItemComponent } from './attachment-item.component';

describe('AttachmentItemComponent', () => {
  let component: AttachmentItemComponent;
  let fixture: ComponentFixture<AttachmentItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AttachmentItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachmentItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
