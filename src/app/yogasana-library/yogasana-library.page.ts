import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  ModalController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import {
  YogaPosesService,
  YogaPose,
  FilterOptions,
  SortOptions
} from '../services/yoga-poses.service';

@Component({
  selector: 'app-yogasana-library',
  templateUrl: './yogasana-library.page.html',
  styleUrls: ['./yogasana-library.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule
  ]
})
export class YogasanaLibraryPage implements OnInit {
  // Data properties
  allPoses: YogaPose[] = [];
  filteredPoses: YogaPose[] = [];

  // UI state
  isLoading = true;
  searchQuery = '';
  selectedFilters: FilterOptions = {};
  sortOptions: SortOptions = { sortBy: 'alphabetical', sortOrder: 'asc' };
  filterOptions: any = { categories: [] };

  constructor(
    private yogaPosesService: YogaPosesService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    this.isLoading = true;
    this.yogaPosesService.getAllPoses().subscribe(poses => {
      this.allPoses = poses;
      // Extract unique categories dynamically from the API response (no hardcoded categories)
      this.filterOptions = this.yogaPosesService.getFilterOptions(poses);
      this.applyFiltersAndSort();
      this.isLoading = false;
    });
  }

  onSearchInput(event: any) {
    const query = event.target.value;
    this.searchQuery = query;
    this.applyFiltersAndSort();
  }

  toggleFilter(filterType: string, value: string) {
    if (this.selectedFilters[filterType as keyof FilterOptions] === value) {
      delete this.selectedFilters[filterType as keyof FilterOptions];
    } else {
      this.selectedFilters[filterType as keyof FilterOptions] = value;
    }
    this.applyFiltersAndSort();
  }

  clearFilter(filterType: string) {
    delete this.selectedFilters[filterType as keyof FilterOptions];
    this.applyFiltersAndSort();
  }

  clearAllFilters() {
    this.selectedFilters = {};
    this.searchQuery = '';
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort() {
    let result = this.yogaPosesService.filterPoses(this.selectedFilters, this.allPoses);

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(pose =>
        pose.yogaName.toLowerCase().includes(query) ||
        pose.category.toLowerCase().includes(query)
      );
    }

    this.filteredPoses = this.yogaPosesService.sortPoses(result, this.sortOptions);
  }

  openProfile() {
    this.router.navigate(['/settings']);
  }

  openPoseDetail(pose: YogaPose) {
    this.router.navigate(['/pose-detail', pose.id]);
  }
}
