import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SequenceBuilderPage } from './sequence-builder.page';

describe('SequenceBuilderPage', () => {
  let component: SequenceBuilderPage;
  let fixture: ComponentFixture<SequenceBuilderPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SequenceBuilderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
