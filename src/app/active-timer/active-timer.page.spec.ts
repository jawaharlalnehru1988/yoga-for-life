import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveTimerPage } from './active-timer.page';

describe('ActiveTimerPage', () => {
  let component: ActiveTimerPage;
  let fixture: ComponentFixture<ActiveTimerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveTimerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
