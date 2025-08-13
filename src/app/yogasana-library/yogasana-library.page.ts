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
  IonInfiniteScrollContent,
  IonFab,
  IonFabButton,
  ModalController,
  AlertController,
  ToastController
} from '@ionic/angular/standalone';
import { Observable } from 'rxjs';
import { 
  YogaPosesService, 
  YogaPose, 
  FilterOptions, 
  SortOptions 
} from '../services/yoga-poses.service';
import { PoseFormComponent } from '../components/pose-form/pose-form.component';
import { addIcons } from 'ionicons';
import { 
  addOutline,
  add,
  createOutline,
  trashOutline,
  heartOutline,
  heart,
  timeOutline,
  starOutline,
  star,
  close,
  searchOutline
} from 'ionicons/icons';

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
    IonFab,
    IonFabButton,
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
    private router: Router,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.filterOptions = this.yogaPosesService.getFilterOptions();
    
    // Register icons
    addIcons({star,close,timeOutline,createOutline,trashOutline,searchOutline,add,addOutline,heartOutline,heart,starOutline});
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

  // CRUD Operations
  async addNewPose() {
    const modal = await this.modalController.create({
      component: PoseFormComponent,
      componentProps: {
        isEdit: false
      },
      cssClass: 'pose-form-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.handlePoseCreated(result.data);
      }
    });

    return await modal.present();
  }

  async editPose(pose: YogaPose, event: Event) {
    event.stopPropagation(); // Prevent card click
    
    const modal = await this.modalController.create({
      component: PoseFormComponent,
      componentProps: {
        pose: pose,
        isEdit: true
      },
      cssClass: 'pose-form-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.handlePoseUpdated(result.data);
      }
    });

    return await modal.present();
  }

  async deletePose(pose: YogaPose, event: Event) {
    event.stopPropagation(); // Prevent card click

    const alert = await this.alertController.create({
      header: 'Delete Pose',
      message: `Are you sure you want to delete "${pose.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.handlePoseDeleted(pose);
          }
        }
      ]
    });

    await alert.present();
  }

  private handlePoseCreated(newPose: YogaPose) {
    // Generate a temporary ID for the new pose
    newPose._id = 'pose-' + Date.now();
    
    // Add to the beginning of the poses array
    this.allPoses.unshift(newPose);
    
    // Update filtered poses
    this.onFilterChange();
    
    // Show success toast
    this.showToast('Pose created successfully!', 'success');
  }

  private handlePoseUpdated(updatedPose: YogaPose) {
    // Find and update the pose in the array
    const index = this.allPoses.findIndex(p => p._id === updatedPose._id);
    if (index !== -1) {
      this.allPoses[index] = { ...updatedPose };
      
      // Update filtered poses
      this.onFilterChange();
      
      // Update featured poses if this pose is featured
      const featuredIndex = this.featuredPoses.findIndex(p => p._id === updatedPose._id);
      if (featuredIndex !== -1) {
        this.featuredPoses[featuredIndex] = { ...updatedPose };
      }
      
      // Update pose of the day if this is it
      if (this.poseOfTheDay?._id === updatedPose._id) {
        this.poseOfTheDay = { ...updatedPose };
      }
      
      // Show success toast
      this.showToast('Pose updated successfully!', 'success');
    }
  }

  private handlePoseDeleted(poseToDelete: YogaPose) {
    // Remove from poses array
    this.allPoses = this.allPoses.filter(p => p._id !== poseToDelete._id);
    
    // Update filtered poses
    this.onFilterChange();
    
    // Remove from featured poses if present
    this.featuredPoses = this.featuredPoses.filter(p => p._id !== poseToDelete._id);
    
    // Clear pose of the day if this was it
    if (this.poseOfTheDay?._id === poseToDelete._id) {
      this.poseOfTheDay = null;
    }
    
    // Show success toast
    this.showToast('Pose deleted successfully!', 'success');
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }
}
