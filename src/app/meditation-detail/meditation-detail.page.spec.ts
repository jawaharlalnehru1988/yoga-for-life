import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeditationDetailPage } from './meditation-detail.page';

describe('MeditationDetailPage', () => {
  let component: MeditationDetailPage;
  let fixture: ComponentFixture<MeditationDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MeditationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
