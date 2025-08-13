import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonicModule, ActionSheetController, ToastController, 
  ModalController, AlertController 
} from '@ionic/angular';
import { Subject, takeUntil, Observable } from 'rxjs';

import { BreathingService, BreathingTechnique, SessionSettings } from '../services/breathing.service';

@Component({
  selector: 'app-breathing-detail',
  templateUrl: './breathing-detail.page.html',
  styleUrls: ['./breathing-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BreathingDetailPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  technique: BreathingTechnique | null = null;
  relatedTechniques: BreathingTechnique[] = [];
  isLoading = true;
  isFavorite = false;
  
  // Session customization
  selectedDuration = 5;
  selectedVoiceGuide = true;
  selectedBackgroundSound = 'ocean';
  
  // UI state
  showFullDescription = false;
  activeSegment = 'overview';
  
  // Available options
  backgroundSounds = [
    { value: 'none', label: 'No Sound', icon: 'volume-mute-outline' },
    { value: 'ocean', label: 'Ocean Waves', icon: 'water-outline' },
    { value: 'forest', label: 'Forest', icon: 'leaf-outline' },
    { value: 'rain', label: 'Rain', icon: 'rainy-outline' },
    { value: 'bells', label: 'Tibetan Bells', icon: 'musical-notes-outline' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breathingService: BreathingService,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    const techniqueId = this.route.snapshot.paramMap.get('id');
    if (techniqueId) {
      this.loadTechnique(techniqueId);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadTechnique(id: string) {
    try {
      this.isLoading = true;
      
      // Load main technique
      this.breathingService.getTechniqueById(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((technique: BreathingTechnique | undefined) => {
          this.technique = technique || null;
          if (technique) {
            this.selectedDuration = technique.durationOptions[0] || 5;
            this.loadRelatedTechniques(technique.category);
          }
          this.isLoading = false;
        });
      
      // Check if favorite
      this.breathingService.isFavorite(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe((isFav: boolean) => {
          this.isFavorite = isFav;
        });
      
    } catch (error) {
      console.error('Error loading technique:', error);
      this.showErrorToast('Failed to load technique details');
      this.isLoading = false;
    }
  }

  private loadRelatedTechniques(category: string) {
    this.breathingService.getTechniquesByCategory(category)
      .pipe(takeUntil(this.destroy$))
      .subscribe((techniques: BreathingTechnique[]) => {
        this.relatedTechniques = techniques
          .filter(t => t._id !== this.technique?._id)
          .slice(0, 3);
      });
  }

  async toggleFavorite() {
    if (!this.technique) return;
    
    try {
      this.breathingService.toggleFavorite(this.technique._id);
      this.isFavorite = !this.isFavorite;
      
      const message = this.isFavorite 
        ? `${this.technique.name} added to favorites`
        : `${this.technique.name} removed from favorites`;
      this.showToast(message);
    } catch (error) {
      this.showErrorToast('Failed to update favorites');
    }
  }

  async startSession() {
    if (!this.technique) return;
    
    if (this.technique.isPremium && !this.isPremiumUser()) {
      await this.showPremiumAlert();
      return;
    }
    
    const sessionSettings: SessionSettings = {
      techniqueId: this.technique._id,
      duration: this.selectedDuration,
      voiceGuidance: this.selectedVoiceGuide,
      backgroundSound: this.selectedBackgroundSound
    };
    
    this.router.navigate(['/breathing-session'], {
      queryParams: sessionSettings
    });
  }

  async customizeSession() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Customize Session',
      buttons: [
        {
          text: 'Duration',
          icon: 'time-outline',
          handler: () => this.selectDuration()
        },
        {
          text: 'Voice Guidance',
          icon: 'mic-outline',
          handler: () => this.toggleVoiceGuidance()
        },
        {
          text: 'Background Sound',
          icon: 'musical-notes-outline',
          handler: () => this.selectBackgroundSound()
        },
        {
          text: 'Reset to Defaults',
          icon: 'refresh-outline',
          handler: () => this.resetSettings()
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

  async selectDuration() {
    if (!this.technique) return;
    
    const actionSheet = await this.actionSheetController.create({
      header: 'Session Duration',
      buttons: [
        ...this.technique.durationOptions.map(duration => ({
          text: `${duration} minute${duration > 1 ? 's' : ''}`,
          icon: duration === this.selectedDuration ? 'checkmark' : '',
          handler: () => {
            this.selectedDuration = duration;
            this.showToast(`Duration set to ${duration} minutes`);
          }
        })),
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  toggleVoiceGuidance() {
    this.selectedVoiceGuide = !this.selectedVoiceGuide;
    const status = this.selectedVoiceGuide ? 'enabled' : 'disabled';
    this.showToast(`Voice guidance ${status}`);
  }

  async selectBackgroundSound() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Background Sound',
      buttons: [
        ...this.backgroundSounds.map(sound => ({
          text: sound.label,
          icon: sound.value === this.selectedBackgroundSound ? 'checkmark' : sound.icon,
          handler: () => {
            this.selectedBackgroundSound = sound.value;
            this.showToast(`Background sound: ${sound.label}`);
          }
        })),
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  resetSettings() {
    if (!this.technique) return;
    
    this.selectedDuration = this.technique.durationOptions[0] || 5;
    this.selectedVoiceGuide = true;
    this.selectedBackgroundSound = 'ocean';
    this.showToast('Settings reset to defaults');
  }

  navigateToRelated(technique: BreathingTechnique) {
    this.router.navigate(['/breathing-detail', technique._id]);
  }

  goBack() {
    this.router.navigate(['/breathing']);
  }

  onSegmentChange(event: any) {
    this.activeSegment = event.detail.value;
  }

  toggleDescription() {
    this.showFullDescription = !this.showFullDescription;
  }

  // Helper methods
  getDifficultyColor(): string {
    if (!this.technique) return 'medium';
    
    switch (this.technique.difficulty.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'medium';
    }
  }

  getCategoryIcon(): string {
    if (!this.technique) return 'ellipse-outline';
    
    const iconMap: { [key: string]: string } = {
      relaxation: 'leaf-outline',
      energizing: 'flash-outline',
      sleep: 'moon-outline',
      focus: 'eye-outline',
      cleansing: 'refresh-outline'
    };
    
    return iconMap[this.technique.category] || 'ellipse-outline';
  }

  getCategoryEmoji(): string {
    if (!this.technique) return '💫';
    
    const emojiMap: { [key: string]: string } = {
      relaxation: '🧘',
      energizing: '⚡',
      sleep: '🌙',
      focus: '🎯',
      cleansing: '🌬'
    };
    
    return emojiMap[this.technique.category] || '💫';
  }

  getPatternDisplay(): string {
    if (!this.technique) return '';
    
    const pattern = this.technique.pattern;
    if (pattern.hold1 === 0 && pattern.hold2 === 0) {
      return `${pattern.inhale}-${pattern.exhale}`;
    }
    return `${pattern.inhale}-${pattern.hold1}-${pattern.exhale}-${pattern.hold2}`;
  }

  getSelectedBackgroundSoundLabel(): string {
    const sound = this.backgroundSounds.find(s => s.value === this.selectedBackgroundSound);
    return sound ? sound.label : 'Ocean Waves';
  }

  isPremiumUser(): boolean {
    // TODO: Implement premium user check
    return false;
  }

  private async showPremiumAlert() {
    const alert = await this.alertController.create({
      header: 'Premium Content',
      subHeader: 'Unlock Premium Features',
      message: 'This technique requires a premium subscription. Upgrade now to access all breathing exercises and exclusive features.',
      buttons: [
        {
          text: 'Learn More',
          handler: () => {
            this.router.navigate(['/premium']);
          }
        },
        {
          text: 'Maybe Later',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
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
