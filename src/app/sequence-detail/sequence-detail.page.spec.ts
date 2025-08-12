import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SequenceDetailPage } from './sequence-detail.page';

describe('SequenceDetailPage', () => {
  let component: SequenceDetailPage;
  let fixture: ComponentFixture<SequenceDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SequenceDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
