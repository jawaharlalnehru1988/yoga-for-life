import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, ActionSheetController, ToastController } from '@ionic/angular';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { 
  MeditationService, 
  MeditationSession, 
  BackgroundSound 
} from '../services/meditation.service';

@Component({
  selector: 'app-meditation-detail',
  templateUrl: './meditation-detail.page.html',
  styleUrls: ['./meditation-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class MeditationDetailPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  session: MeditationSession | null = null;
  relatedSessions: MeditationSession[] = [];
  backgroundSounds: BackgroundSound[] = [];
  
  isLoading = true;
  isPlaying = false;
  currentPlayTime = 0;
  isFavorite = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meditationService: MeditationService,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadSession();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSession() {
    const sessionId = this.route.snapshot.paramMap.get('id');
    if (!sessionId) {
      this.router.navigate(['/meditation']);
      return;
    }

    this.isLoading = true;
    
    // Load session details
    this.meditationService.getSessionById(sessionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (session) => {
          if (session) {
            this.session = session;
            this.loadRelatedSessions();
            this.checkFavoriteStatus();
          } else {
            this.router.navigate(['/meditation']);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading session:', error);
          this.showErrorToast('Failed to load meditation session');
          this.router.navigate(['/meditation']);
        }
      });

    // Load background sounds
    this.meditationService.getBackgroundSounds()
      .pipe(takeUntil(this.destroy$))
      .subscribe((sounds) => {
        this.backgroundSounds = sounds;
      });
  }

  private loadRelatedSessions() {
    if (!this.session) return;
    
    // Get all sessions and filter by category
    this.meditationService.getAllSessions()
      .pipe(takeUntil(this.destroy$))
      .subscribe((sessions: MeditationSession[]) => {
        this.relatedSessions = sessions
          .filter(s => s._id !== this.session!._id && s.category === this.session!.category)
          .slice(0, 4);
      });
  }

  private checkFavoriteStatus() {
    if (!this.session) return;
    
    this.meditationService.isFavorite(this.session._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((favorite) => {
        this.isFavorite = favorite;
      });
  }

  async playMeditation() {
    if (!this.session) return;
    
    if (this.session.isPremium && !this.isPremiumUser()) {
      await this.showPremiumRequiredAction();
      return;
    }
    
    const actionSheet = await this.actionSheetController.create({
      header: 'Play Meditation',
      subHeader: this.session.title,
      buttons: [
        {
          text: 'Play with Voice Only',
          icon: 'person-outline',
          handler: () => {
            this.startMeditation();
          }
        },
        {
          text: 'Play with Background Sound',
          icon: 'musical-notes-outline',
          handler: () => {
            this.selectBackgroundSound();
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

  private startMeditation(backgroundSoundId?: string) {
    if (!this.session) return;
    
    // For now, just show a toast - later we'll implement the actual player
    this.showToast('Meditation player coming soon!');
  }

  private async selectBackgroundSound() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choose Background Sound',
      buttons: [
        ...this.backgroundSounds.map(sound => ({
          text: sound.name,
          icon: sound.icon,
          handler: () => {
            this.startMeditation(sound._id);
          }
        })),
        {
          text: 'No Background Sound',
          icon: 'volume-mute-outline',
          handler: () => {
            this.startMeditation();
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

  async toggleFavorite() {
    if (!this.session) return;
    
    try {
      this.meditationService.toggleFavorite(this.session._id);
      this.isFavorite = !this.isFavorite;
      
      const action = this.isFavorite ? 'added to' : 'removed from';
      this.showToast(`Meditation ${action} favorites`);
    } catch (error) {
      this.showErrorToast('Failed to update favorites');
    }
  }

  async shareMeditation() {
    if (!this.session) return;
    
    const actionSheet = await this.actionSheetController.create({
      header: 'Share Meditation',
      subHeader: this.session.title,
      buttons: [
        {
          text: 'Copy Link',
          icon: 'link-outline',
          handler: () => {
            this.copyLink();
          }
        },
        {
          text: 'Share via Message',
          icon: 'chatbubble-outline',
          handler: () => {
            this.shareViaMessage();
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

  private copyLink() {
    const url = `${window.location.origin}/meditation-detail?id=${this.session?._id}`;
    navigator.clipboard.writeText(url).then(() => {
      this.showToast('Link copied to clipboard');
    }).catch(() => {
      this.showErrorToast('Failed to copy link');
    });
  }

  private shareViaMessage() {
    const url = `${window.location.origin}/meditation-detail?id=${this.session?._id}`;
    const text = `Check out this meditation: "${this.session?.title}" on Yoga for Life`;
    
    if (navigator.share) {
      navigator.share({
        title: this.session?.title,
        text: text,
        url: url
      });
    } else {
      this.copyLink();
    }
  }

  openRelatedSession(session: MeditationSession) {
    this.router.navigate(['/meditation-detail'], { queryParams: { id: session._id } });
  }

  downloadForOffline() {
    if (!this.session) return;
    
    if (this.session.isPremium && !this.isPremiumUser()) {
      this.showPremiumRequiredAction();
      return;
    }
    
    this.showToast('Download feature coming soon');
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

  private isPremiumUser(): boolean {
    // TODO: Implement premium user check
    return false;
  }

  private async showPremiumRequiredAction() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Premium Content',
      subHeader: 'This meditation requires a premium subscription',
      buttons: [
        {
          text: 'Upgrade to Premium',
          icon: 'diamond-outline',
          handler: () => {
            this.router.navigate(['/premium']);
          }
        },
        {
          text: 'View Free Meditations',
          icon: 'gift-outline',
          handler: () => {
            this.router.navigate(['/meditation'], { 
              queryParams: { filter: 'free' } 
            });
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

  goBack() {
    this.router.navigate(['/meditation']);
  }
}
