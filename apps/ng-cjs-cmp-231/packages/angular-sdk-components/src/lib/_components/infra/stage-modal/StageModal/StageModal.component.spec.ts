/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StageModalComponent } from './StageModal.component';

describe('StageModalComponent', () => {
  let component: StageModalComponent;
  let fixture: ComponentFixture<StageModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StageModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
