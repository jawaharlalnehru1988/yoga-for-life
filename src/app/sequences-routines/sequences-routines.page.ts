import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ActionSheetController, ToastController, ModalController } from '@ionic/angular';
import { BehaviorSubject, Observable, combineLatest, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { SequencesService, YogaSequence, Challenge } from '../services/sequences.service';

interface FilterOptions {
  difficulties: string[];
  durations: { label: string; value: number }[];
  goals: string[];
  types: { label: string; value: string }[];
}

interface SelectedFilters {
  difficulty: string;
  duration: number | null;
  goal: string;
  type: string;
}

interface UserStats {
  completedSequences: number;
  totalMinutes: number;
  streak: number;
  customSequences: number;
}

@Component({
  selector: 'app-sequences-routines',
  templateUrl: './sequences-routines.page.html',
  styleUrls: ['./sequences-routines.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SequencesRoutinesPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data observables
  allSequences: YogaSequence[] = [];
  filteredSequences: YogaSequence[] = [];
  customSequences: YogaSequence[] = [];
  featuredChallenges: Challenge[] = [];
  userStats: UserStats | null = null;
  
  // UI state
  isLoading = true;
  searchQuery = '';
  selectedCategory = 'all';
  showAdvancedFilters = false;
  
  // Filter options
  filterOptions: FilterOptions = {
    difficulties: ['Beginner', 'Intermediate', 'Advanced'],
    durations: [
      { label: '5-15 min', value: 15 },
      { label: '15-30 min', value: 30 },
      { label: '30-45 min', value: 45 },
      { label: '45+ min', value: 60 }
    ],
    goals: [
      'Weight Loss',
      'Stress Relief',
      'Flexibility',
      'Core Strength',
      'Morning Energy',
      'Better Sleep',
      'Back Pain Relief',
      'Meditation'
    ],
    types: [
      { label: 'Goal-Based', value: 'predefined' },
      { label: 'Time-Based', value: 'predefined' },
      { label: 'Occasion-Based', value: 'predefined' },
      { label: 'Custom', value: 'custom' }
    ]
  };
  
  // Selected filters
  selectedFilters: SelectedFilters = {
    difficulty: '',
    duration: null,
    goal: '',
    type: ''
  };
  
  // Search subject for debouncing
  private searchSubject = new BehaviorSubject<string>('');

  constructor(
    private sequencesService: SequencesService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.initializeData();
    this.setupSearch();
    this.setupFiltering();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeData() {
    try {
      this.isLoading = true;
      
      // Load sequences
      this.sequencesService.getAllSequences()
        .pipe(takeUntil(this.destroy$))
        .subscribe((sequences: YogaSequence[]) => {
          this.allSequences = sequences;
          this.applyFilters();
        });
      
      // Load custom sequences
      this.sequencesService.getCustomSequences()
        .pipe(takeUntil(this.destroy$))
        .subscribe((customSequences: YogaSequence[]) => {
          this.customSequences = customSequences;
          this.updateUserStats();
        });
      
      // Load featured challenges
      this.sequencesService.getAllChallenges()
        .pipe(takeUntil(this.destroy$))
        .subscribe((challenges: Challenge[]) => {
          this.featuredChallenges = challenges.slice(0, 3); // Show top 3
        });
      
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading sequences:', error);
      this.showErrorToast('Failed to load sequences');
      this.isLoading = false;
    }
  }

  private setupSearch() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private setupFiltering() {
    // Watch for filter changes and apply them
    combineLatest([
      this.sequencesService.getAllSequences(),
      this.sequencesService.getCustomSequences()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  onSearchInput(event: any) {
    this.searchQuery = event.target.value || '';
    this.searchSubject.next(this.searchQuery);
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  toggleFilter(filterType: string, value: any) {
    switch (filterType) {
      case 'difficulty':
        this.selectedFilters.difficulty = 
          this.selectedFilters.difficulty === value ? '' : value;
        break;
      case 'duration':
        this.selectedFilters.duration = 
          this.selectedFilters.duration === value ? null : value;
        break;
      case 'goal':
        this.selectedFilters.goal = 
          this.selectedFilters.goal === value ? '' : value;
        break;
      case 'type':
        this.selectedFilters.type = 
          this.selectedFilters.type === value ? '' : value;
        break;
    }
    this.applyFilters();
  }

  clearFilter(filterType: string) {
    switch (filterType) {
      case 'difficulty':
        this.selectedFilters.difficulty = '';
        break;
      case 'duration':
        this.selectedFilters.duration = null;
        break;
      case 'goal':
        this.selectedFilters.goal = '';
        break;
      case 'type':
        this.selectedFilters.type = '';
        break;
    }
    this.applyFilters();
  }

  clearAllFilters() {
    this.selectedFilters = {
      difficulty: '',
      duration: null,
      goal: '',
      type: ''
    };
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(
      this.selectedFilters.difficulty ||
      this.selectedFilters.duration ||
      this.selectedFilters.goal ||
      this.selectedFilters.type
    );
  }

  toggleAdvancedFilters() {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  private applyFilters() {
    let sequences: YogaSequence[] = [];
    
    // Get sequences based on category
    switch (this.selectedCategory) {
      case 'all':
        sequences = [...this.allSequences, ...this.customSequences];
        break;
      case 'custom':
        sequences = this.customSequences;
        break;
      case 'goal-based':
        sequences = this.allSequences.filter(s => 
          s.category === 'goal-based' || 
          (s.goal && ['Weight Loss', 'Stress Relief', 'Flexibility', 'Core Strength'].includes(s.goal))
        );
        break;
      case 'time-based':
        sequences = this.allSequences.filter(s => 
          s.category === 'time-based' || 
          s.name.toLowerCase().includes('quick') ||
          s.name.toLowerCase().includes('minute')
        );
        break;
      case 'occasion-based':
        sequences = this.allSequences.filter(s => 
          s.category === 'occasion-based' ||
          s.name.toLowerCase().includes('morning') ||
          s.name.toLowerCase().includes('evening')
        );
        break;
      default:
        sequences = this.allSequences;
    }
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      sequences = sequences.filter(sequence => 
        sequence.name.toLowerCase().includes(query) ||
        sequence.description.toLowerCase().includes(query) ||
        sequence.goal.toLowerCase().includes(query) ||
        sequence.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply difficulty filter
    if (this.selectedFilters.difficulty) {
      sequences = sequences.filter(s => 
        s.difficulty === this.selectedFilters.difficulty
      );
    }
    
    // Apply duration filter
    if (this.selectedFilters.duration) {
      sequences = sequences.filter(s => 
        s.totalTime <= this.selectedFilters.duration!
      );
    }
    
    // Apply goal filter
    if (this.selectedFilters.goal) {
      sequences = sequences.filter(s => 
        s.goal === this.selectedFilters.goal
      );
    }
    
    // Apply type filter
    if (this.selectedFilters.type) {
      sequences = sequences.filter(s => 
        s.type === this.selectedFilters.type
      );
    }
    
    this.filteredSequences = sequences;
  }

  // Navigation methods
  async openCreateSequence() {
    this.router.navigate(['/sequences-routines/create']);
  }

  openSequenceDetail(sequence: YogaSequence, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/sequences-routines', sequence._id]);
  }

  openChallenge(challenge: Challenge) {
    this.router.navigate(['/challenges', challenge._id]);
  }

  // Sequence actions
  async startSequence(sequence: YogaSequence, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (sequence.isPremium && !this.isPremiumUser()) {
      await this.showPremiumRequiredAction(sequence);
      return;
    }
    
    this.router.navigate(['/sequences-routines', sequence._id, 'practice']);
  }

  async editSequence(sequence: YogaSequence, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/sequences-routines', sequence._id, 'edit']);
  }

  async toggleFavorite(sequence: YogaSequence, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      await this.sequencesService.toggleFavorite(sequence._id);
      const action = await this.isFavorite(sequence._id).pipe(map(isFav => isFav ? 'added to' : 'removed from')).toPromise();
      this.showToast(`Sequence ${action} favorites`);
    } catch (error) {
      this.showErrorToast('Failed to update favorites');
    }
  }

  // Helper methods
  isFavorite(sequenceId: string): Observable<boolean> {
    return this.sequencesService.isFavorite(sequenceId);
  }

  getCompletedCount(sequenceId: string): Observable<number> {
    return this.sequencesService.getCompletedCount(sequenceId);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'medium';
    }
  }

  getDurationLabel(minutes: number): string {
    const duration = this.filterOptions.durations.find(d => d.value === minutes);
    return duration ? duration.label : `${minutes} min`;
  }

  getTypeLabel(type: string): string {
    const typeObj = this.filterOptions.types.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  }

  private isPremiumUser(): boolean {
    // TODO: Implement premium user check
    return false;
  }

  private updateUserStats() {
    // Calculate user stats
    this.userStats = {
      completedSequences: 0, // TODO: Get from service
      totalMinutes: 0, // TODO: Get from service
      streak: 0, // TODO: Get from service
      customSequences: this.customSequences.length
    };
  }

  // UI Helper methods
  private async showPremiumRequiredAction(sequence: YogaSequence) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Premium Content',
      subHeader: `"${sequence.name}" is a premium sequence`,
      buttons: [
        {
          text: 'Upgrade to Premium',
          icon: 'diamond-outline',
          handler: () => {
            this.router.navigate(['/premium']);
          }
        },
        {
          text: 'View Details',
          icon: 'information-circle-outline',
          handler: () => {
            this.openSequenceDetail(sequence);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    this.showToast(message, 'danger');
  }
}
