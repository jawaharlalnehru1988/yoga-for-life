import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyTipsPage } from './daily-tips.page';

describe('DailyTipsPage', () => {
  let component: DailyTipsPage;
  let fixture: ComponentFixture<DailyTipsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyTipsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
