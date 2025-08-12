import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PracticeSessionPage } from './practice-session.page';

describe('PracticeSessionPage', () => {
  let component: PracticeSessionPage;
  let fixture: ComponentFixture<PracticeSessionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeSessionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
