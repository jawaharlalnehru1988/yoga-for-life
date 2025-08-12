import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, AlertController, ToastController, ModalController } from '@ionic/angular';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import { SequencesService, YogaSequence, SequencePose } from '../services/sequences.service';
import { YogaPosesService, YogaPose } from '../services/yoga-poses.service';

interface PracticeOptions {
  speed: 'slow' | 'normal' | 'fast';
  instructions: boolean;
  music: boolean;
}

interface SessionState {
  currentPoseIndex: number;
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  elapsedTime: number;
  currentPoseTimeLeft: number;
  totalSessionTime: number;
}

@Component({
  selector: 'app-practice-session',
  templateUrl: './practice-session.page.html',
  styleUrls: ['./practice-session.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PracticeSessionPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private timerSubscription?: Subscription;
  private preparationSubscription?: Subscription;
  
  // Data
  sequence: YogaSequence | null = null;
  poses: YogaPose[] = [];
  
  // Practice settings
  options: PracticeOptions = {
    speed: 'normal',
    instructions: true,
    music: true
  };
  
  // Session state
  state: SessionState = {
    currentPoseIndex: 0,
    isActive: false,
    isPaused: false,
    isCompleted: false,
    elapsedTime: 0,
    currentPoseTimeLeft: 0,
    totalSessionTime: 0
  };
  
  // UI state
  isLoading = true;
  isPreparation = false;
  preparationTimeLeft = 10; // 10 seconds preparation
  showControls = true;
  
  // Audio
  private backgroundAudio?: HTMLAudioElement;
  private bellAudio?: HTMLAudioElement;
  
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private sequencesService: SequencesService,
    private yogaPosesService: YogaPosesService,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadSessionData();
    this.initializeAudio();
  }

  ngOnDestroy() {
    this.cleanup();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSessionData() {
    this.route.queryParams
      .pipe(
        switchMap(params => {
          // Load practice options from query params
          this.options = {
            speed: params['speed'] || 'normal',
            instructions: params['instructions'] === 'true',
            music: params['music'] === 'true'
          };
          
          return this.sequencesService.getSequenceById(params['sequenceId']);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(async (sequence) => {
        if (sequence) {
          this.sequence = sequence;
          await this.loadPoseDetails();
          this.calculateSessionTiming();
          this.startPreparation();
        } else {
          this.router.navigate(['/sequences-routines']);
        }
        this.isLoading = false;
      });
  }

  private async loadPoseDetails() {
    if (!this.sequence) return;
    
    try {
      const posePromises = this.sequence.poses.map(sequencePose => 
        this.yogaPosesService.getPoseById(sequencePose.poseId).toPromise()
      );
      
      const poseResults = await Promise.all(posePromises);
      this.poses = poseResults.filter((pose: any) => pose !== undefined) as YogaPose[];
    } catch (error) {
      console.error('Error loading pose details:', error);
      this.showToast('Failed to load pose details', 'warning');
    }
  }

  private calculateSessionTiming() {
    if (!this.sequence) return;
    
    let totalTime = 0;
    this.sequence.poses.forEach(pose => {
      let duration = pose.duration;
      
      // Adjust duration based on speed
      switch (this.options.speed) {
        case 'slow':
          duration = Math.floor(duration * 1.3);
          break;
        case 'fast':
          duration = Math.floor(duration * 0.8);
          break;
      }
      
      totalTime += duration;
    });
    
    this.state.totalSessionTime = totalTime;
  }

  private async initializeAudio() {
    // Initialize bell sound
    this.bellAudio = new Audio('assets/sounds/bell.mp3');
    this.bellAudio.volume = 0.7;
    
    // Initialize background music if enabled
    if (this.options.music) {
      this.backgroundAudio = new Audio('assets/sounds/yoga-music.mp3');
      this.backgroundAudio.loop = true;
      this.backgroundAudio.volume = 0.3;
    }
  }

  private startPreparation() {
    this.isPreparation = true;
    this.preparationTimeLeft = 10;
    
    this.preparationSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.preparationTimeLeft--;
        
        if (this.preparationTimeLeft <= 0) {
          this.preparationSubscription?.unsubscribe();
          this.startSession();
        } else if (this.preparationTimeLeft <= 3) {
          // Play countdown bell for last 3 seconds
          this.playBell();
        }
      });
  }

  private startSession() {
    this.isPreparation = false;
    this.state.isActive = true;
    this.state.isPaused = false;
    this.startCurrentPose();
    
    // Start background music
    if (this.backgroundAudio) {
      this.backgroundAudio.play().catch(console.error);
    }
  }

  private startCurrentPose() {
    if (!this.sequence || this.state.currentPoseIndex >= this.sequence.poses.length) {
      this.completeSession();
      return;
    }
    
    const currentSequencePose = this.sequence.poses[this.state.currentPoseIndex];
    let duration = currentSequencePose.duration;
    
    // Adjust duration based on speed
    switch (this.options.speed) {
      case 'slow':
        duration = Math.floor(duration * 1.3);
        break;
      case 'fast':
        duration = Math.floor(duration * 0.8);
        break;
    }
    
    this.state.currentPoseTimeLeft = duration;
    
    // Play transition bell
    this.playBell();
    
    // Start pose timer
    this.timerSubscription = interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (!this.state.isPaused) {
          this.state.currentPoseTimeLeft--;
          this.state.elapsedTime++;
          
          // Warn when 10 seconds left
          if (this.state.currentPoseTimeLeft === 10) {
            this.showPoseTransitionWarning();
          }
          
          // Move to next pose
          if (this.state.currentPoseTimeLeft <= 0) {
            this.nextPose();
          }
        }
      });
  }

  private nextPose() {
    this.timerSubscription?.unsubscribe();
    this.state.currentPoseIndex++;
    this.startCurrentPose();
  }

  private previousPose() {
    if (this.state.currentPoseIndex > 0) {
      this.timerSubscription?.unsubscribe();
      this.state.currentPoseIndex--;
      this.startCurrentPose();
    }
  }

  private completeSession() {
    this.state.isActive = false;
    this.state.isCompleted = true;
    this.cleanup();
    
    // Play completion bells
    setTimeout(() => this.playBell(), 0);
    setTimeout(() => this.playBell(), 500);
    setTimeout(() => this.playBell(), 1000);
    
    // Save session completion
    this.saveSessionCompletion();
    
    this.showToast('Session completed! Great work! 🎉', 'success');
  }

  private saveSessionCompletion() {
    if (!this.sequence) return;
    
    this.sequencesService.completeSequence(
      this.sequence._id,
      Math.floor(this.state.elapsedTime / 60), // duration in minutes
      5 // default 5-star rating
    );
  }

  // Control Methods
  togglePause() {
    this.state.isPaused = !this.state.isPaused;
    
    if (this.state.isPaused) {
      this.backgroundAudio?.pause();
    } else {
      this.backgroundAudio?.play().catch(console.error);
    }
  }

  skipPose() {
    if (this.state.currentPoseIndex < this.sequence!.poses.length - 1) {
      this.nextPose();
    }
  }

  goBackPose() {
    this.previousPose();
  }

  restartPose() {
    this.timerSubscription?.unsubscribe();
    this.startCurrentPose();
  }

  async endSession() {
    const alert = await this.alertController.create({
      header: 'End Session',
      message: 'Are you sure you want to end your practice session?',
      buttons: [
        {
          text: 'Continue',
          role: 'cancel'
        },
        {
          text: 'End Session',
          handler: () => {
            this.cleanup();
            this.router.navigate(['/sequences-routines']);
          }
        }
      ]
    });
    
    await alert.present();
  }

  toggleControls() {
    this.showControls = !this.showControls;
  }

  openPoseDetail() {
    const currentPose = this.getCurrentPose();
    if (currentPose) {
      this.router.navigate(['/pose-detail', currentPose._id]);
    }
  }

  // Helper Methods
  getCurrentPose(): YogaPose | undefined {
    if (!this.sequence || this.state.currentPoseIndex >= this.sequence.poses.length) {
      return undefined;
    }
    
    const sequencePose = this.sequence.poses[this.state.currentPoseIndex];
    return this.poses.find(pose => pose._id === sequencePose.poseId);
  }

  getCurrentSequencePose(): SequencePose | undefined {
    if (!this.sequence || this.state.currentPoseIndex >= this.sequence.poses.length) {
      return undefined;
    }
    
    return this.sequence.poses[this.state.currentPoseIndex];
  }

  getProgress(): number {
    if (!this.sequence) return 0;
    return Math.round((this.state.currentPoseIndex / this.sequence.poses.length) * 100);
  }

  getTimeDisplay(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getElapsedTimeDisplay(): string {
    return this.getTimeDisplay(this.state.elapsedTime);
  }

  getRemainingTimeDisplay(): string {
    const remaining = this.state.totalSessionTime - this.state.elapsedTime;
    return this.getTimeDisplay(Math.max(0, remaining));
  }

  getElapsedMinutes(): number {
    return Math.ceil(this.state.elapsedTime / 60);
  }

  private showPoseTransitionWarning() {
    // Visual indication that pose is about to change
    this.showToast('10 seconds remaining', 'warning');
  }

  private playBell() {
    if (this.bellAudio) {
      this.bellAudio.currentTime = 0;
      this.bellAudio.play().catch(console.error);
    }
  }

  private cleanup() {
    this.timerSubscription?.unsubscribe();
    this.preparationSubscription?.unsubscribe();
    
    if (this.backgroundAudio) {
      this.backgroundAudio.pause();
      this.backgroundAudio.currentTime = 0;
    }
  }

  private async showToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
