import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyProgressPage } from './my-progress.page';

describe('MyProgressPage', () => {
  let component: MyProgressPage;
  let fixture: ComponentFixture<MyProgressPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyProgressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
