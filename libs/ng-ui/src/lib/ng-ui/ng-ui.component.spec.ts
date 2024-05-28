import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgUiComponent } from './ng-ui.component';

describe('NgUiComponent', () => {
  let component: NgUiComponent;
  let fixture: ComponentFixture<NgUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgUiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
