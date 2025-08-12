import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoseDetailPage } from './pose-detail.page';

describe('PoseDetailPage', () => {
  let component: PoseDetailPage;
  let fixture: ComponentFixture<PoseDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PoseDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
