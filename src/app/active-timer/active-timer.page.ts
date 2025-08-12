import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import { MeditationService, BackgroundSound } from '../services/meditation.service';

interface TimerConfig {
  duration: number;
  backgroundSound?: string;
  intervalBells: boolean;
  bellInterval?: number;
  preparationTime: number;
}

@Component({
  selector: 'app-active-timer',
  templateUrl: './active-timer.page.html',
  styleUrls: ['./active-timer.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ActiveTimerPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private timerSubscription?: Subscription;
  private preparationSubscription?: Subscription;

  // Timer state
  config: TimerConfig = {
    duration: 10,
    intervalBells: false,
    preparationTime: 0
  };

  // Current state
  isPreparation = false;
  isActive = false;
  isPaused = false;
  isCompleted = false;
  
  // Time tracking
  totalSeconds = 0;
  remainingSeconds = 0;
  preparationSecondsLeft = 0;
  
  // Display
  currentBackgroundSound?: BackgroundSound;
  circleProgress = 0;
  timeDisplay = '00:00';
  
  // Audio
  private audio?: HTMLAudioElement;
  private bellAudio?: HTMLAudioElement;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private meditationService: MeditationService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadTimerConfig();
    this.initializeAudio();
    this.startSession();
  }

  ngOnDestroy() {
    this.cleanup();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTimerConfig() {
    this.route.queryParams.subscribe(params => {
      this.config = {
        duration: parseInt(params['duration']) || 10,
        backgroundSound: params['backgroundSound'] || undefined,
        intervalBells: params['intervalBells'] === 'true',
        bellInterval: parseInt(params['bellInterval']) || 5,
        preparationTime: parseInt(params['preparationTime']) || 0
      };
      
      this.totalSeconds = this.config.duration * 60;
      this.remainingSeconds = this.totalSeconds;
      this.preparationSecondsLeft = this.config.preparationTime;
      
      this.updateTimeDisplay();
    });
  }

  private async initializeAudio() {
    // Load background sound if specified
    if (this.config.backgroundSound) {
      this.meditationService.getBackgroundSounds()
        .pipe(takeUntil(this.destroy$))
        .subscribe(sounds => {
          this.currentBackgroundSound = sounds.find(s => s._id === this.config.backgroundSound);
          if (this.currentBackgroundSound?.audioUrl) {
            this.audio = new Audio(this.currentBackgroundSound.audioUrl);
            this.audio.loop = true;
            this.audio.volume = 0.5;
          }
        });
    }

    // Initialize bell sound
    this.bellAudio = new Audio('assets/sounds/bell.mp3');
    this.bellAudio.volume = 0.7;
  }

  private startSession() {
    if (this.config.preparationTime > 0) {
      this.startPreparation();
    } else {
      this.startMeditation();
    }
  }

  private startPreparation() {
    this.isPreparation = true;
    this.isActive = false;
    
    this.preparationSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.preparationSecondsLeft--;
        
        if (this.preparationSecondsLeft <= 0) {
          this.preparationSubscription?.unsubscribe();
          this.startMeditation();
        }
      });
  }

  private startMeditation() {
    this.isPreparation = false;
    this.isActive = true;
    this.isPaused = false;
    
    // Start background sound
    this.playBackgroundSound();
    
    // Start main timer
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.isPaused) {
          this.remainingSeconds--;
          this.updateProgress();
          this.updateTimeDisplay();
          this.checkIntervalBell();
          
          if (this.remainingSeconds <= 0) {
            this.completeMeditation();
          }
        }
      });
  }

  private updateProgress() {
    const elapsed = this.totalSeconds - this.remainingSeconds;
    this.circleProgress = (elapsed / this.totalSeconds) * 100;
  }

  private updateTimeDisplay() {
    const seconds = this.isPreparation ? this.preparationSecondsLeft : this.remainingSeconds;
    const minutes = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    this.timeDisplay = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private checkIntervalBell() {
    if (!this.config.intervalBells || !this.config.bellInterval) return;
    
    const elapsedMinutes = Math.floor((this.totalSeconds - this.remainingSeconds) / 60);
    const shouldRing = elapsedMinutes > 0 && 
                      elapsedMinutes % this.config.bellInterval === 0 && 
                      this.remainingSeconds % 60 === 0;
    
    if (shouldRing) {
      this.playBell();
    }
  }

  private playBackgroundSound() {
    if (this.audio) {
      this.audio.play().catch(console.error);
    }
  }

  private playBell() {
    if (this.bellAudio) {
      this.bellAudio.currentTime = 0;
      this.bellAudio.play().catch(console.error);
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      this.audio?.pause();
    } else {
      this.audio?.play().catch(console.error);
    }
  }

  async endSession() {
    const alert = await this.alertController.create({
      header: 'End Meditation',
      message: 'Are you sure you want to end your meditation session?',
      buttons: [
        {
          text: 'Continue',
          role: 'cancel'
        },
        {
          text: 'End Session',
          handler: () => {
            this.cleanup();
            this.router.navigate(['/meditation']);
          }
        }
      ]
    });
    
    await alert.present();
  }

  private completeMeditation() {
    this.isActive = false;
    this.isCompleted = true;
    this.cleanup();
    
    // Play completion bell
    this.playBell();
    
    // Save session to service
    this.saveSession();
    
    // Show completion message
    this.showCompletionToast();
  }

  private saveSession() {
    const session = {
      duration: this.config.duration,
      completedAt: new Date(),
      backgroundSound: this.config.backgroundSound,
      type: 'custom-timer'
    };
    
    // TODO: Implement session saving in meditation service
    console.log('Meditation session completed:', session);
  }

  private async showCompletionToast() {
    const toast = await this.toastController.create({
      message: `🎉 Meditation completed! ${this.config.duration} minutes of mindfulness.`,
      duration: 3000,
      color: 'success',
      position: 'top',
      buttons: [
        {
          text: 'Done',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  backToMeditation() {
    this.router.navigate(['/meditation']);
  }

  restartSession() {
    this.cleanup();
    this.remainingSeconds = this.totalSeconds;
    this.preparationSecondsLeft = this.config.preparationTime;
    this.isCompleted = false;
    this.circleProgress = 0;
    this.updateTimeDisplay();
    this.startSession();
  }

  // Volume control
  adjustVolume(event: any) {
    const volume = event.detail.value / 100;
    if (this.audio) {
      this.audio.volume = volume;
    }
  }

  private cleanup() {
    this.timerSubscription?.unsubscribe();
    this.preparationSubscription?.unsubscribe();
    
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  // Getters for template
  get progressPercentage(): number {
    return Math.min(100, Math.max(0, this.circleProgress));
  }

  get isTimerRunning(): boolean {
    return this.isActive && !this.isPaused;
  }

  get statusText(): string {
    if (this.isCompleted) return 'Meditation Complete';
    if (this.isPreparation) return 'Preparation Time';
    if (this.isPaused) return 'Paused';
    if (this.isActive) return 'Meditating';
    return 'Ready';
  }

  get currentVolume(): number {
    return this.audio ? Math.round(this.audio.volume * 100) : 50;
  }

  getRoundedProgress(): number {
    return Math.round(this.progressPercentage);
  }
}
