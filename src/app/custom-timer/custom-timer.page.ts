import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule, ActionSheetController, ModalController, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MeditationService, BackgroundSound } from '../services/meditation.service';

@Component({
  selector: 'app-custom-timer',
  templateUrl: './custom-timer.page.html',
  styleUrls: ['./custom-timer.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CustomTimerPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Timer configuration
  selectedDuration = 10; // default 10 minutes
  selectedBackgroundSound: BackgroundSound | null = null;
  intervalBells = false;
  bellInterval = 5; // every 5 minutes
  preparationTime = 30; // 30 seconds preparation
  
  // Available options
  durations = [1, 3, 5, 10, 15, 20, 25, 30, 45, 60];
  bellIntervals = [1, 2, 3, 5, 10, 15];
  preparationTimes = [0, 10, 30, 60]; // in seconds
  
  backgroundSounds: BackgroundSound[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private meditationService: MeditationService,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadBackgroundSounds();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBackgroundSounds() {
    this.meditationService.getBackgroundSounds()
      .pipe(takeUntil(this.destroy$))
      .subscribe((sounds) => {
        this.backgroundSounds = sounds;
      });
  }

  async selectBackgroundSound() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Choose Background Sound',
      subHeader: 'Select a sound to accompany your meditation',
      buttons: [
        {
          text: 'No Sound (Silent)',
          icon: 'volume-mute-outline',
          handler: () => {
            this.selectedBackgroundSound = null;
          }
        },
        ...this.backgroundSounds.map(sound => ({
          text: sound.name,
          icon: sound.icon,
          handler: () => {
            this.selectedBackgroundSound = sound;
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

  async previewSound(sound: BackgroundSound) {
    // TODO: Implement sound preview
    this.showToast(`Preview for ${sound.name} coming soon`);
  }

  onDurationChange(event: any) {
    this.selectedDuration = parseInt(event.detail.value);
  }

  onBellIntervalChange(event: any) {
    this.bellInterval = parseInt(event.detail.value);
  }

  onPreparationTimeChange(event: any) {
    this.preparationTime = parseInt(event.detail.value);
  }

  toggleIntervalBells() {
    this.intervalBells = !this.intervalBells;
  }

  async startCustomTimer() {
    if (this.selectedDuration < 1) {
      this.showToast('Please select a valid duration', 'warning');
      return;
    }

    this.isLoading = true;

    try {
      // Create timer configuration
      const timerConfig = {
        duration: this.selectedDuration,
        backgroundSound: this.selectedBackgroundSound?._id,
        intervalBells: this.intervalBells,
        bellInterval: this.intervalBells ? this.bellInterval : undefined,
        preparationTime: this.preparationTime,
        startDate: new Date()
      };

      // Start the timer in the service
      this.meditationService.startTimer(timerConfig);

      // Navigate to active timer page
      this.router.navigate(['/active-timer'], {
        queryParams: {
          duration: this.selectedDuration,
          backgroundSound: this.selectedBackgroundSound?._id || '',
          intervalBells: this.intervalBells,
          bellInterval: this.bellInterval,
          preparationTime: this.preparationTime
        }
      });

    } catch (error) {
      console.error('Error starting timer:', error);
      this.showToast('Failed to start timer', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  goBack() {
    this.router.navigate(['/meditation']);
  }

  // Preset configurations
  selectPreset(preset: string) {
    switch (preset) {
      case 'quick':
        this.selectedDuration = 5;
        this.intervalBells = false;
        this.preparationTime = 10;
        break;
      case 'standard':
        this.selectedDuration = 15;
        this.intervalBells = true;
        this.bellInterval = 5;
        this.preparationTime = 30;
        break;
      case 'deep':
        this.selectedDuration = 30;
        this.intervalBells = true;
        this.bellInterval = 10;
        this.preparationTime = 60;
        break;
      case 'extended':
        this.selectedDuration = 60;
        this.intervalBells = true;
        this.bellInterval = 15;
        this.preparationTime = 60;
        break;
    }
  }

  getDurationText(duration: number): string {
    if (duration < 60) {
      return `${duration} min`;
    } else {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  getPreparationText(seconds: number): string {
    if (seconds === 0) return 'No preparation';
    if (seconds < 60) return `${seconds} seconds`;
    return `${seconds / 60} minute${seconds === 60 ? '' : 's'}`;
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
}
