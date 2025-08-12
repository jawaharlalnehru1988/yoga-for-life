import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomTimerPage } from './custom-timer.page';

describe('CustomTimerPage', () => {
  let component: CustomTimerPage;
  let fixture: ComponentFixture<CustomTimerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomTimerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
