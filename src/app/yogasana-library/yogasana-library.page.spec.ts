import { ComponentFixture, TestBed } from '@angular/core/testing';
import { YogasanaLibraryPage } from './yogasana-library.page';

describe('YogasanaLibraryPage', () => {
  let component: YogasanaLibraryPage;
  let fixture: ComponentFixture<YogasanaLibraryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(YogasanaLibraryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
