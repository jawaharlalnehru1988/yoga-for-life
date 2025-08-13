import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonicModule, AlertController, ToastController, 
  ModalController, Platform 
} from '@ionic/angular';
import { Subject, takeUntil, interval, Subscription } from 'rxjs';

import { BreathingService, BreathingTechnique, SessionSettings } from '../services/breathing.service';
import { ChallengesService } from '../shared/challenges.service';

interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  currentPhase: 'inhale' | 'hold1' | 'exhale' | 'hold2';
  currentCycle: number;
  totalCycles: number;
  phaseProgress: number;
  sessionProgress: number;
  remainingTime: number;
  totalTime: number;
  currentPhaseTime: number;
  currentPhaseTotal: number;
}

@Component({
  selector: 'app-breathing-session',
  templateUrl: './breathing-session.page.html',
  styleUrls: ['./breathing-session.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class BreathingSessionPage implements OnInit, OnDestroy {
  @ViewChild('breathingCircle', { static: false }) breathingCircle!: ElementRef;
  Math = Math;
  private destroy$ = new Subject<void>();
  private sessionTimer?: Subscription;
  private phaseTimer?: Subscription;
  
  technique: BreathingTechnique | null = null;
  sessionSettings: SessionSettings | null = null;
  sessionState: SessionState = {
    isActive: false,
    isPaused: false,
    currentPhase: 'inhale',
    currentCycle: 0,
    totalCycles: 0,
    phaseProgress: 0,
    sessionProgress: 0,
    remainingTime: 0,
    totalTime: 0,
    currentPhaseTime: 0,
    currentPhaseTotal: 0
  };
  
  // UI state
  isLoading = true;
  showInstructions = false;
  showStats = false;
  isSessionComplete = false;
  
  // Challenge integration
  challengeId: string | null = null;
  challengeDay: number | null = null;
  
  // Audio context
  private audioContext?: AudioContext;
  private backgroundAudio?: HTMLAudioElement;
  private voiceAudio?: HTMLAudioElement;
  
  // Animation state
  circleScale = 1;
  animationClass = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breathingService: BreathingService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private platform: Platform,
    private challengesService: ChallengesService
  ) {}

  ngOnInit() {
    // Check for challenge context
    this.challengeId = this.route.snapshot.queryParamMap.get('challengeId');
    this.challengeDay = Number(this.route.snapshot.queryParamMap.get('challengeDay')) || null;
    
    this.loadSessionConfiguration();
    this.setupAudioContext();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanup();
  }

  private async loadSessionConfiguration() {
    try {
      this.isLoading = true;
      
      // Get parameters from query params
      const params = this.route.snapshot.queryParams;
      const techniqueId = params['techniqueId'];
      const duration = parseInt(params['duration']) || 5;
      const voiceGuidance = params['voiceGuidance'] === 'true';
      const backgroundSound = params['backgroundSound'] || 'ocean';
      
      this.sessionSettings = {
        techniqueId,
        duration,
        voiceGuidance,
        backgroundSound
      };
      
      // Load technique
      this.breathingService.getTechniqueById(techniqueId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((technique: BreathingTechnique | undefined) => {
          if (technique) {
            this.technique = technique;
            this.initializeSession();
          } else {
            this.showErrorAndExit('Technique not found');
          }
          this.isLoading = false;
        });
        
    } catch (error) {
      console.error('Error loading session:', error);
      this.showErrorAndExit('Failed to load breathing session');
    }
  }

  private initializeSession() {
    if (!this.technique || !this.sessionSettings) return;
    
    const pattern = this.technique.pattern;
    const cycleDuration = pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2;
    const totalMinutes = this.sessionSettings.duration;
    const totalSeconds = totalMinutes * 60;
    const totalCycles = Math.floor(totalSeconds / cycleDuration);
    
    this.sessionState = {
      isActive: false,
      isPaused: false,
      currentPhase: 'inhale',
      currentCycle: 0,
      totalCycles,
      phaseProgress: 0,
      sessionProgress: 0,
      remainingTime: totalSeconds,
      totalTime: totalSeconds,
      currentPhaseTime: 0,
      currentPhaseTotal: pattern.inhale
    };
    
    this.showInstructions = true;
  }

  private setupAudioContext() {
    if (this.platform.is('capacitor')) {
      // Setup for mobile
      this.setupMobileAudio();
    } else {
      // Setup for web
      this.setupWebAudio();
    }
  }

  private setupWebAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  private setupMobileAudio() {
    // Mobile audio setup will be handled by Capacitor plugins
    console.log('Mobile audio setup');
  }

  async startSession() {
    if (!this.technique || !this.sessionSettings) return;
    
    this.showInstructions = false;
    this.sessionState.isActive = true;
    this.sessionState.currentPhase = 'inhale';
    this.sessionState.currentPhaseTime = 0;
    this.sessionState.currentPhaseTotal = this.technique.pattern.inhale;
    
    await this.playBackgroundSound();
    this.startPhaseTimer();
    this.startSessionTimer();
    
    if (this.sessionSettings.voiceGuidance) {
      this.playVoiceGuidance('session_start');
    }
  }

  pauseSession() {
    this.sessionState.isPaused = true;
    this.stopTimers();
    this.pauseAudio();
  }

  resumeSession() {
    this.sessionState.isPaused = false;
    this.startPhaseTimer();
    this.startSessionTimer();
    this.resumeAudio();
  }

  async stopSession() {
    const alert = await this.alertController.create({
      header: 'End Session',
      message: 'Are you sure you want to end your breathing session?',
      buttons: [
        {
          text: 'Continue',
          role: 'cancel'
        },
        {
          text: 'End Session',
          handler: () => {
            this.endSession();
          }
        }
      ]
    });
    await alert.present();
  }

  private startPhaseTimer() {
    this.stopPhaseTimer();
    
    this.phaseTimer = interval(100).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (!this.sessionState.isPaused && this.sessionState.isActive) {
        this.updatePhaseProgress();
      }
    });
  }

  private startSessionTimer() {
    this.stopSessionTimer();
    
    this.sessionTimer = interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (!this.sessionState.isPaused && this.sessionState.isActive) {
        this.sessionState.remainingTime--;
        this.sessionState.sessionProgress = 
          ((this.sessionState.totalTime - this.sessionState.remainingTime) / this.sessionState.totalTime) * 100;
        
        if (this.sessionState.remainingTime <= 0) {
          this.completeSession();
        }
      }
    });
  }

  private updatePhaseProgress() {
    if (!this.technique) return;
    
    this.sessionState.currentPhaseTime += 0.1;
    this.sessionState.phaseProgress = 
      (this.sessionState.currentPhaseTime / this.sessionState.currentPhaseTotal) * 100;
    
    // Update circle animation
    this.updateCircleAnimation();
    
    // Check if phase is complete
    if (this.sessionState.currentPhaseTime >= this.sessionState.currentPhaseTotal) {
      this.nextPhase();
    }
  }

  private updateCircleAnimation() {
    const progress = this.sessionState.phaseProgress / 100;
    
    switch (this.sessionState.currentPhase) {
      case 'inhale':
        this.circleScale = 1 + (progress * 0.5); // Scale from 1 to 1.5
        this.animationClass = 'inhaling';
        break;
      case 'hold1':
        this.circleScale = 1.5; // Hold at maximum
        this.animationClass = 'holding';
        break;
      case 'exhale':
        this.circleScale = 1.5 - (progress * 0.5); // Scale from 1.5 to 1
        this.animationClass = 'exhaling';
        break;
      case 'hold2':
        this.circleScale = 1; // Hold at minimum
        this.animationClass = 'holding';
        break;
    }
  }

  private nextPhase() {
    if (!this.technique) return;
    
    const pattern = this.technique.pattern;
    
    switch (this.sessionState.currentPhase) {
      case 'inhale':
        if (pattern.hold1 > 0) {
          this.sessionState.currentPhase = 'hold1';
          this.sessionState.currentPhaseTotal = pattern.hold1;
        } else {
          this.sessionState.currentPhase = 'exhale';
          this.sessionState.currentPhaseTotal = pattern.exhale;
        }
        break;
      case 'hold1':
        this.sessionState.currentPhase = 'exhale';
        this.sessionState.currentPhaseTotal = pattern.exhale;
        break;
      case 'exhale':
        if (pattern.hold2 > 0) {
          this.sessionState.currentPhase = 'hold2';
          this.sessionState.currentPhaseTotal = pattern.hold2;
        } else {
          this.completeCycle();
          return;
        }
        break;
      case 'hold2':
        this.completeCycle();
        return;
    }
    
    this.sessionState.currentPhaseTime = 0;
    this.sessionState.phaseProgress = 0;
    
    // Play voice guidance for phase change
    if (this.sessionSettings?.voiceGuidance) {
      this.playVoiceGuidance(this.sessionState.currentPhase);
    }
  }

  private completeCycle() {
    this.sessionState.currentCycle++;
    this.sessionState.currentPhase = 'inhale';
    this.sessionState.currentPhaseTime = 0;
    this.sessionState.currentPhaseTotal = this.technique!.pattern.inhale;
    this.sessionState.phaseProgress = 0;
  }

  private async completeSession() {
    this.sessionState.isActive = false;
    this.isSessionComplete = true;
    this.stopTimers();
    this.stopAudio();
    
    // Save session data
    await this.saveSessionData();
    
    // Track challenge progress if this is part of a challenge
    if (this.challengeId && this.challengeDay && this.technique) {
      this.challengesService.completeDayActivity(this.challengeId, this.challengeDay, {
        type: 'breathing',
        activityId: this.technique._id,
        duration: this.sessionState.totalTime / 1000 // Convert to seconds
      });
    }
    
    // Play completion sound
    if (this.sessionSettings?.voiceGuidance) {
      this.playVoiceGuidance('session_complete');
    }
    
    const message = this.challengeId ? 
      'Breathing session completed! Challenge progress updated!' :
      'Breathing session completed! Great work!';
    this.showToast(message, 'success');
  }

  private endSession() {
    this.sessionState.isActive = false;
    this.stopTimers();
    this.stopAudio();
    this.router.navigate(['/breathing']);
  }

  private async saveSessionData() {
    try {
      const sessionData = {
        techniqueId: this.sessionSettings!.techniqueId,
        duration: this.sessionSettings!.duration,
        completedAt: new Date(),
        cyclesCompleted: this.sessionState.currentCycle,
        totalCycles: this.sessionState.totalCycles
      };
      
      // Save to breathing service
      this.breathingService.saveSessionData(sessionData);
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  private async playBackgroundSound() {
    if (!this.sessionSettings?.backgroundSound || this.sessionSettings.backgroundSound === 'none') {
      return;
    }
    
    try {
      const soundUrl = this.getBackgroundSoundUrl(this.sessionSettings.backgroundSound);
      this.backgroundAudio = new Audio(soundUrl);
      this.backgroundAudio.loop = true;
      this.backgroundAudio.volume = 0.3;
      await this.backgroundAudio.play();
    } catch (error) {
      console.warn('Could not play background sound:', error);
    }
  }

  private playVoiceGuidance(instruction: string) {
    try {
      const voiceUrl = this.getVoiceGuidanceUrl(instruction);
      this.voiceAudio = new Audio(voiceUrl);
      this.voiceAudio.volume = 0.8;
      this.voiceAudio.play();
    } catch (error) {
      console.warn('Could not play voice guidance:', error);
    }
  }

  private getBackgroundSoundUrl(sound: string): string {
    // TODO: Replace with actual audio files
    const soundMap: { [key: string]: string } = {
      ocean: '/assets/audio/ocean-waves.mp3',
      forest: '/assets/audio/forest-sounds.mp3',
      rain: '/assets/audio/rain.mp3',
      bells: '/assets/audio/tibetan-bells.mp3'
    };
    return soundMap[sound] || '';
  }

  private getVoiceGuidanceUrl(instruction: string): string {
    // TODO: Replace with actual voice guidance files
    const voiceMap: { [key: string]: string } = {
      session_start: '/assets/audio/voice/session-start.mp3',
      inhale: '/assets/audio/voice/inhale.mp3',
      hold1: '/assets/audio/voice/hold.mp3',
      exhale: '/assets/audio/voice/exhale.mp3',
      hold2: '/assets/audio/voice/hold.mp3',
      session_complete: '/assets/audio/voice/session-complete.mp3'
    };
    return voiceMap[instruction] || '';
  }

  private pauseAudio() {
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
    }
  }

  private resumeAudio() {
    if (this.backgroundAudio) {
      this.backgroundAudio.play();
    }
  }

  private stopAudio() {
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio.currentTime = 0;
    }
    if (this.voiceAudio) {
      this.voiceAudio.pause();
      this.voiceAudio.currentTime = 0;
    }
  }

  private stopTimers() {
    this.stopPhaseTimer();
    this.stopSessionTimer();
  }

  private stopPhaseTimer() {
    if (this.phaseTimer) {
      this.phaseTimer.unsubscribe();
      this.phaseTimer = undefined;
    }
  }

  private stopSessionTimer() {
    if (this.sessionTimer) {
      this.sessionTimer.unsubscribe();
      this.sessionTimer = undefined;
    }
  }

  private cleanup() {
    this.stopTimers();
    this.stopAudio();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }

  // UI Helper methods
  getPhaseInstruction(): string {
    switch (this.sessionState.currentPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold1': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'hold2': return 'Hold';
      default: return '';
    }
  }

  getPhaseDescription(): string {
    switch (this.sessionState.currentPhase) {
      case 'inhale': return 'Slowly breathe in through your nose';
      case 'hold1': return 'Hold your breath gently';
      case 'exhale': return 'Slowly breathe out through your mouth';
      case 'hold2': return 'Rest and prepare for the next breath';
      default: return '';
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  toggleStats() {
    this.showStats = !this.showStats;
  }

  async restartSession() {
    const alert = await this.alertController.create({
      header: 'Restart Session',
      message: 'Would you like to start a new breathing session?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Yes',
          handler: () => {
            this.isSessionComplete = false;
            this.initializeSession();
          }
        }
      ]
    });
    await alert.present();
  }

  goHome() {
    this.router.navigate(['/breathing']);
  }

  private async showErrorAndExit(message: string) {
    this.showToast(message, 'danger');
    setTimeout(() => {
      this.router.navigate(['/breathing']);
    }, 2000);
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
