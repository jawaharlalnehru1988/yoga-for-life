import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonSegment, 
  IonSegmentButton, IonLabel, IonCard, IonCardContent, IonCardHeader, 
  IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonChip, IonBadge,
  IonGrid, IonRow, IonCol, IonItem, IonList, IonAvatar, IonText,
  IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonProgressBar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  searchOutline, heartOutline, heart, playOutline, timeOutline, starOutline, 
  leafOutline, flashOutline, moonOutline, eyeOutline, refreshOutline,
  filterOutline, gridOutline, listOutline, trendingUpOutline, sparklesOutline
} from 'ionicons/icons';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { BreathingService, BreathingTechnique, BreathingStats } from '../services/breathing.service';
import { ChallengesService } from '../shared/challenges.service';

@Component({
  selector: 'app-breathing',
  templateUrl: './breathing.page.html',
  styleUrls: ['./breathing.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonSearchbar, IonSegment, 
    IonSegmentButton, IonLabel, IonCard, IonCardContent, IonCardHeader, 
    IonCardTitle, IonCardSubtitle, IonButton, IonIcon, IonChip, IonBadge,
    IonGrid, IonRow, IonCol, IonItem, IonList, IonAvatar, IonText,
    IonRefresher, IonRefresherContent, IonFab, IonFabButton, IonProgressBar,
    CommonModule, FormsModule
  ]
})
export class BreathingPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data
  allTechniques: BreathingTechnique[] = [];
  filteredTechniques: BreathingTechnique[] = [];
  featuredTechniques: BreathingTechnique[] = [];
  quickStartTechnique: BreathingTechnique | null = null;
  stats: BreathingStats | null = null;
  favorites: string[] = [];

  // Challenge Integration
  challengeId: string | null = null;
  challengeDay: number | null = null;
  recommendedExercise: string | null = null;
  
  // UI State
  selectedCategory = 'all';
  searchQuery = '';
  viewMode: 'grid' | 'list' = 'grid';
  isLoading = false;
  
  // Categories for filtering
  categories = [
    { value: 'all', label: 'All', icon: 'grid-outline', emoji: '🔍' },
    { value: 'relaxation', label: 'Relaxation', icon: 'leaf-outline', emoji: '🧘' },
    { value: 'energizing', label: 'Energizing', icon: 'flash-outline', emoji: '⚡' },
    { value: 'sleep', label: 'Sleep Support', icon: 'moon-outline', emoji: '🌙' },
    { value: 'focus', label: 'Focus', icon: 'eye-outline', emoji: '🎯' },
    { value: 'cleansing', label: 'Cleansing', icon: 'refresh-outline', emoji: '🌬' }
  ];

  constructor(
    private breathingService: BreathingService,
    private router: Router,
    private route: ActivatedRoute,
    private challengesService: ChallengesService
  ) {
    addIcons({
      searchOutline, heartOutline, heart, playOutline, timeOutline, starOutline,
      leafOutline, flashOutline, moonOutline, eyeOutline, refreshOutline,
      filterOutline, gridOutline, listOutline, trendingUpOutline, sparklesOutline
    });
  }

  ngOnInit() {
    // Check for challenge context from query params
    this.challengeId = this.route.snapshot.queryParamMap.get('challengeId');
    this.challengeDay = Number(this.route.snapshot.queryParamMap.get('day')) || null;
    this.recommendedExercise = this.route.snapshot.queryParamMap.get('exercise');
    
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.isLoading = true;
    
    combineLatest([
      this.breathingService.getAllTechniques(),
      this.breathingService.getFeaturedTechniques(),
      this.breathingService.getQuickStartTechnique(),
      this.breathingService.getBreathingStats(),
      this.breathingService.favorites$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([techniques, featured, quickStart, stats, favorites]) => {
        this.allTechniques = techniques;
        this.featuredTechniques = featured;
        this.quickStartTechnique = quickStart;
        this.stats = stats;
        this.favorites = favorites;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading breathing data:', error);
        this.isLoading = false;
      }
    });
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    this.applyFilters();
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value || '';
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.allTechniques];
    
    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(technique => technique.category === this.selectedCategory);
    }
    
    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(technique =>
        technique.name.toLowerCase().includes(query) ||
        technique.shortDescription.toLowerCase().includes(query) ||
        technique.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    this.filteredTechniques = filtered;
  }

  toggleFavorite(technique: BreathingTechnique, event: Event) {
    event.stopPropagation();
    this.breathingService.toggleFavorite(technique._id);
  }

  isFavorite(techniqueId: string): boolean {
    return this.favorites.includes(techniqueId);
  }

  navigateToDetail(technique: BreathingTechnique) {
    this.router.navigate(['/breathing-detail', technique._id]);
  }

  startQuickSession() {
    if (this.quickStartTechnique) {
      this.router.navigate(['/breathing-session', this.quickStartTechnique._id], {
        queryParams: { duration: 2, quick: true }
      });
    }
  }

  startTechnique(technique: BreathingTechnique, event: Event) {
    event.stopPropagation();
    
    // Navigate to detail page with challenge context if applicable
    const navigationExtras: any = {};
    if (this.challengeId) {
      navigationExtras.queryParams = {
        challengeId: this.challengeId,
        challengeDay: this.challengeDay
      };
    }
    
    this.router.navigate(['/breathing-detail', technique._id], navigationExtras);
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  onRefresh(event: any) {
    this.loadData();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'danger';
      default: return 'medium';
    }
  }

  getCategoryIcon(category: string): string {
    const categoryObj = this.categories.find(c => c.value === category);
    return categoryObj?.icon || 'help-outline';
  }

  getCategoryEmoji(category: string): string {
    const categoryObj = this.categories.find(c => c.value === category);
    return categoryObj?.emoji || '💫';
  }

  formatRating(rating: number): string {
    return rating.toFixed(1);
  }

  getStatsProgress(): number {
    if (!this.stats) return 0;
    return Math.min((this.stats.currentStreak / 7) * 100, 100);
  }

  getCategoryTitle(): string {
    if (this.selectedCategory === 'all') {
      return 'All Techniques';
    }
    const category = this.categories.find(c => c.value === this.selectedCategory);
    return category ? category.label : 'Techniques';
  }
}
