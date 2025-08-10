import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeditationPage } from './meditation.page';

describe('MeditationPage', () => {
  let component: MeditationPage;
  let fixture: ComponentFixture<MeditationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MeditationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
