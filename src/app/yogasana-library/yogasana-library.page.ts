import { Component, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonBadge,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonChip,
    IonLabel,
    IonItem,
    IonSelect,
    IonSelectOption,
    IonBadge,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    CommonModule, 
    FormsModule
  ]
})
export class YogasanaLibraryPage implements OnInit {
  @ViewChild('featuredSlides', { static: false }) featuredSlides: any;

  // Data properties
  allPoses: YogaPose[] = [];
  filteredPoses: YogaPose[] = [];
  featuredPoses: YogaPose[] = [];
  poseOfTheDay: YogaPose | null = null;

  // UI state
  isLoading = true;
  showAdvancedFilters = false;
  showFavoritesOnly = false;
  hasMorePoses = false;
  currentPage = 1;
  pageSize = 20;

  // Search and Filter
  searchQuery = '';
  selectedFilters: FilterOptions = {};
  sortOptions: SortOptions = { sortBy: 'popularity', sortOrder: 'desc' };
  filterOptions: any = {};

  // Slides configuration
  slideBreakpoints = {
    768: {
      slidesPerView: 2.2,
    },
    1024: {
      slidesPerView: 3.2,
    }
  };

  constructor(
    private yogaPosesService: YogaPosesService,
    private router: Router
  ) {
    this.filterOptions = this.yogaPosesService.getFilterOptions();
  }

  ngOnInit() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    this.isLoading = true;
    
    try {
      // Load all poses
      this.yogaPosesService.getAllPoses().subscribe(poses => {
        this.allPoses = poses;
        this.applyFiltersAndSort();
        this.isLoading = false;
      });

      // Load featured poses
      this.yogaPosesService.getFeaturedPoses().subscribe(featured => {
        this.featuredPoses = featured;
      });

      // Load pose of the day
      this.yogaPosesService.getPoseOfTheDay().subscribe(pose => {
        this.poseOfTheDay = pose;
      });

    } catch (error) {
      console.error('Error loading poses:', error);
      this.isLoading = false;
    }
  }

  // Search functionality
  onSearchInput(event: any) {
    const query = event.target.value;
    this.searchQuery = query;
    
    if (query.trim() === '') {
      this.applyFiltersAndSort();
    } else {
      this.yogaPosesService.searchPoses(query).subscribe(poses => {
        this.filteredPoses = this.yogaPosesService.sortPoses(poses, this.sortOptions);
        this.applyCurrentFilters();
      });
    }
  }

  // Filter functionality
  toggleFilter(filterType: string, value: string) {
    if (this.selectedFilters[filterType as keyof FilterOptions] === value) {
      delete this.selectedFilters[filterType as keyof FilterOptions];
    } else {
      this.selectedFilters[filterType as keyof FilterOptions] = value;
    }
    this.onFilterChange();
  }

  onFilterChange() {
    this.applyFiltersAndSort();
  }

  onSortChange() {
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort() {
    if (this.showFavoritesOnly) {
      this.loadFavorites();
      return;
    }

    let posesToFilter = this.searchQuery ? 
      this.filteredPoses : 
      this.allPoses;

    if (this.hasActiveFilters()) {
      this.yogaPosesService.filterPoses(this.selectedFilters).subscribe(filtered => {
        if (this.searchQuery) {
          // Apply filters to search results
          const searchResults = posesToFilter.filter(pose => 
            filtered.some(filteredPose => filteredPose._id === pose._id)
          );
          this.filteredPoses = this.yogaPosesService.sortPoses(searchResults, this.sortOptions);
        } else {
          this.filteredPoses = this.yogaPosesService.sortPoses(filtered, this.sortOptions);
        }
      });
    } else {
      this.filteredPoses = this.yogaPosesService.sortPoses(posesToFilter, this.sortOptions);
    }
  }

  private applyCurrentFilters() {
    if (this.hasActiveFilters()) {
      this.yogaPosesService.filterPoses(this.selectedFilters).subscribe(filtered => {
        this.filteredPoses = this.filteredPoses.filter(pose => 
          filtered.some(filteredPose => filteredPose._id === pose._id)
        );
      });
    }
  }

  // Filter management
  clearFilter(filterType: string) {
    delete this.selectedFilters[filterType as keyof FilterOptions];
    this.onFilterChange();
  }

  clearAllFilters() {
    this.selectedFilters = {};
    this.searchQuery = '';
    this.onFilterChange();
  }

  hasActiveFilters(): boolean {
    return Object.keys(this.selectedFilters).some(key => 
      this.selectedFilters[key as keyof FilterOptions] !== undefined && 
      this.selectedFilters[key as keyof FilterOptions] !== ''
    );
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // Favorites functionality
  toggleFavoritesView() {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    if (this.showFavoritesOnly) {
      this.loadFavorites();
    } else {
      this.applyFiltersAndSort();
    }
  }

  private loadFavorites() {
    this.yogaPosesService.getFavoritePoses().subscribe(favorites => {
      this.filteredPoses = this.yogaPosesService.sortPoses(favorites, this.sortOptions);
    });
  }

  toggleFavorite(pose: YogaPose, event: Event) {
    event.stopPropagation(); // Prevent opening pose detail
    this.yogaPosesService.toggleFavorite(pose._id);
    
    // If showing favorites only, refresh the list
    if (this.showFavoritesOnly) {
      this.loadFavorites();
    }
  }

  isFavorite(poseId: string): Observable<boolean> {
    return this.yogaPosesService.isFavorite(poseId);
  }

  // Navigation
  openPoseDetail(pose: YogaPose) {
    this.router.navigate(['/pose-detail', pose._id]);
  }

  // Utility methods
  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'danger';
      default: return 'medium';
    }
  }

  getDurationLabel(durationValue: string): string {
    const duration = this.filterOptions.durations.find((d: any) => d.value === durationValue);
    return duration ? duration.label : durationValue;
  }

  // Infinite scroll
  loadMorePoses(event: any) {
    // Simulate loading more poses (for pagination)
    setTimeout(() => {
      // In a real app, you would load the next page from the API
      this.currentPage++;
      
      // For now, just complete the infinite scroll
      event.target.complete();
      
      // Check if we have more data (mock logic)
      if (this.currentPage >= 3) {
        this.hasMorePoses = false;
        event.target.disabled = true;
      }
    }, 1000);
  }
}
