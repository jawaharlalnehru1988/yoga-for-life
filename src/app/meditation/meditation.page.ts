import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ModalController, ActionSheetController, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { 
  MeditationService, 
  MeditationSession, 
  MeditationStats, 
  DailyMeditationChallenge, 
  BackgroundSound 
} from '../services/meditation.service';

@Component({
  selector: 'app-meditation',
  templateUrl: './meditation.page.html',
  styleUrls: ['./meditation.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MeditationPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Data properties
  featuredMeditations: MeditationSession[] = [];
  filteredSessions: MeditationSession[] = [];
  allSessions: MeditationSession[] = [];
  meditationStats: MeditationStats | null = null;
  meditationChallenges: DailyMeditationChallenge[] = [];
  backgroundSounds: BackgroundSound[] = [];
  
  // UI state
  isLoading = true;
  searchQuery = '';
  selectedCategory = 'all';
  selectedDuration = 'all';
  
  // Quick timer durations
  quickTimerDurations = [1, 3, 5, 10, 15, 20];
  
  // Filter options
  categoryFilters = [
    { value: 'all', label: 'All', icon: 'apps-outline' },
    { value: 'relaxation', label: 'Relaxation', icon: 'leaf-outline' },
    { value: 'sleep', label: 'Sleep', icon: 'moon-outline' },
    { value: 'stress-relief', label: 'Stress Relief', icon: 'heart-outline' },
    { value: 'focus', label: 'Focus', icon: 'eye-outline' },
    { value: 'healing', label: 'Healing', icon: 'medical-outline' },
    { value: 'energy', label: 'Energy', icon: 'flash-outline' },
    { value: 'anxiety', label: 'Anxiety', icon: 'shield-outline' }
  ];
  
  durationFilters = [
    { value: 'all', label: 'Any Duration' },
    { value: 'short', label: 'Short (1-5 min)' },
    { value: 'medium', label: 'Medium (6-15 min)' },
    { value: 'long', label: 'Long (15+ min)' }
  ];
  
  // Search subject for debouncing
  private searchSubject = new BehaviorSubject<string>('');

  constructor(
    private meditationService: MeditationService,
    private router: Router,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.initializeData();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async initializeData() {
    try {
      this.isLoading = true;
      
      // Load all sessions
      this.meditationService.getAllSessions()
        .pipe(takeUntil(this.destroy$))
        .subscribe((sessions: MeditationSession[]) => {
          this.allSessions = sessions;
          this.applyFilters();
        });
      
      // Load featured meditations
      this.meditationService.getFeaturedSessions()
        .pipe(takeUntil(this.destroy$))
        .subscribe((featured: MeditationSession[]) => {
          this.featuredMeditations = featured;
        });
      
      // Load meditation stats
      this.meditationService.getMeditationStats()
        .pipe(takeUntil(this.destroy$))
        .subscribe((stats: MeditationStats) => {
          this.meditationStats = stats;
        });
      
      // Load challenges
      this.meditationService.getChallenges()
        .pipe(takeUntil(this.destroy$))
        .subscribe((challenges: DailyMeditationChallenge[]) => {
          this.meditationChallenges = challenges;
        });
      
      // Load background sounds
      this.meditationService.getBackgroundSounds()
        .pipe(takeUntil(this.destroy$))
        .subscribe((sounds: BackgroundSound[]) => {
          this.backgroundSounds = sounds;
        });
      
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading meditation data:', error);
      this.showErrorToast('Failed to load meditations');
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

  onSearchInput(event: any) {
    this.searchQuery = event.target.value || '';
    this.searchSubject.next(this.searchQuery);
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  selectDuration(duration: string) {
    this.selectedDuration = duration;
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedDuration = 'all';
    this.applyFilters();
  }

  private applyFilters() {
    let sessions = [...this.allSessions];
    
    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      sessions = sessions.filter(session =>
        session.title.toLowerCase().includes(query) ||
        session.shortDescription.toLowerCase().includes(query) ||
        session.category.toLowerCase().includes(query) ||
        session.technique.toLowerCase().includes(query) ||
        session.tags.some(tag => tag.toLowerCase().includes(query)) ||
        session.benefits.some(benefit => benefit.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (this.selectedCategory !== 'all') {
      sessions = sessions.filter(session => session.category === this.selectedCategory);
    }
    
    // Apply duration filter
    if (this.selectedDuration !== 'all') {
      sessions = sessions.filter(session => {
        switch (this.selectedDuration) {
          case 'short': return session.duration <= 5;
          case 'medium': return session.duration > 5 && session.duration <= 15;
          case 'long': return session.duration > 15;
          default: return true;
        }
      });
    }
    
    this.filteredSessions = sessions;
  }

  // Navigation methods
  openMeditationDetail(session: MeditationSession) {
    this.router.navigate(['/meditation', session._id]);
  }

  openChallenge(challenge: DailyMeditationChallenge) {
    this.router.navigate(['/meditation/challenges', challenge._id]);
  }

  // Meditation actions
  async playMeditation(session: MeditationSession, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    if (session.isPremium && !this.isPremiumUser()) {
      await this.showPremiumRequiredAction(session);
      return;
    }
    
    // Navigate to meditation player
    this.router.navigate(['/meditation', session._id, 'play']);
  }

  async toggleFavorite(session: MeditationSession, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    
    try {
      this.meditationService.toggleFavorite(session._id);
      const isFav = await this.isFavorite(session._id).toPromise();
      const action = isFav ? 'added to' : 'removed from';
      this.showToast(`Meditation ${action} favorites`);
    } catch (error) {
      this.showErrorToast('Failed to update favorites');
    }
  }

  // Timer methods
  async startQuickTimer(duration: number) {
    const actionSheet = await this.actionSheetController.create({
      header: `${duration}-Minute Timer`,
      subHeader: 'Choose your meditation style',
      buttons: [
        {
          text: 'Silent Timer',
          icon: 'timer-outline',
          handler: () => {
            this.startSilentTimer(duration);
          }
        },
        {
          text: 'With Background Sound',
          icon: 'musical-notes-outline',
          handler: () => {
            this.openTimerWithSound(duration);
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

  async openCustomTimer() {
    // TODO: Open custom timer modal
    this.router.navigate(['/meditation/timer']);
  }

  private startSilentTimer(duration: number) {
    this.meditationService.startTimer({
      duration,
      intervalBells: false,
      startDate: new Date()
    });
    
    this.router.navigate(['/meditation/timer/active']);
  }

  private async openTimerWithSound(duration: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choose Background Sound',
      buttons: [
        ...this.backgroundSounds.slice(0, 4).map(sound => ({
          text: sound.name,
          icon: sound.icon,
          handler: () => {
            this.startTimerWithSound(duration, sound._id);
          }
        })),
        {
          text: 'More Sounds...',
          icon: 'ellipsis-horizontal',
          handler: () => {
            this.openSoundSelector(duration);
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

  private startTimerWithSound(duration: number, soundId: string) {
    this.meditationService.startTimer({
      duration,
      backgroundSound: soundId,
      intervalBells: false,
      startDate: new Date()
    });
    
    this.router.navigate(['/meditation/timer/active']);
  }

  private async openSoundSelector(duration: number) {
    // TODO: Open sound selector modal
    console.log('Open sound selector for', duration, 'minutes');
  }

  // Helper methods
  isFavorite(sessionId: string): Observable<boolean> {
    return this.meditationService.isFavorite(sessionId);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'medium';
    }
  }

  getTechniqueIcon(technique: string): string {
    const icons: { [key: string]: string } = {
      'breathwork': 'wind-outline',
      'body-scan': 'body-outline',
      'mantra': 'chatbubble-outline',
      'visualization': 'eye-outline',
      'walking': 'walk-outline',
      'loving-kindness': 'heart-outline',
      'mindfulness': 'flower-outline'
    };
    return icons[technique] || 'leaf-outline';
  }

  getTechniqueLabel(technique: string): string {
    const labels: { [key: string]: string } = {
      'breathwork': 'Breathwork',
      'body-scan': 'Body Scan',
      'mantra': 'Mantra',
      'visualization': 'Visualization',
      'walking': 'Walking',
      'loving-kindness': 'Loving-Kindness',
      'mindfulness': 'Mindfulness'
    };
    return labels[technique] || technique;
  }

  getCategoryLabel(category: string): string {
    const filter = this.categoryFilters.find(f => f.value === category);
    return filter ? filter.label : category;
  }

  private isPremiumUser(): boolean {
    // TODO: Implement premium user check
    return false;
  }

  // UI Helper methods
  private async showPremiumRequiredAction(session: MeditationSession) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Premium Content',
      subHeader: `"${session.title}" is a premium meditation`,
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
            this.openMeditationDetail(session);
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
