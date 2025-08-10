import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SequencesRoutinesPage } from './sequences-routines.page';

describe('SequencesRoutinesPage', () => {
  let component: SequencesRoutinesPage;
  let fixture: ComponentFixture<SequencesRoutinesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SequencesRoutinesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
