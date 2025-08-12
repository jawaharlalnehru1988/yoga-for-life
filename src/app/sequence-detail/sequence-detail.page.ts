import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, ActionSheetController, ToastController, ModalController, AlertController } from '@ionic/angular';
import { Subject, Observable } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import { SequencesService, YogaSequence, SequencePose } from '../services/sequences.service';
import { YogaPosesService, YogaPose } from '../services/yoga-poses.service';

@Component({
  selector: 'app-sequence-detail',
  templateUrl: './sequence-detail.page.html',
  styleUrls: ['./sequence-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SequenceDetailPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  sequence: YogaSequence | null = null;
  poses: YogaPose[] = [];
  relatedSequences: YogaSequence[] = [];
  
  isLoading = true;
  isFavorite = false;
  completedCount = 0;
  canEdit = false;
  
  // Practice options
  practiceSpeed = 'normal'; // slow, normal, fast
  includeInstructions = true;
  includeMusic = true;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sequencesService: SequencesService,
    private yogaPosesService: YogaPosesService,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadSequenceData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadSequenceData() {
    this.route.params
      .pipe(
        switchMap(params => this.sequencesService.getSequenceById(params['id'])),
        takeUntil(this.destroy$)
      )
      .subscribe(async (sequence) => {
        if (sequence) {
          this.sequence = sequence;
          this.canEdit = sequence.type === 'custom';
          
          // Load pose details
          await this.loadPoseDetails();
          
          // Load related data
          this.loadFavoriteStatus();
          this.loadCompletedCount();
          this.loadRelatedSequences();
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

  private loadFavoriteStatus() {
    if (!this.sequence) return;
    
    this.sequencesService.isFavorite(this.sequence._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(isFavorite => {
        this.isFavorite = isFavorite;
      });
  }

  private loadCompletedCount() {
    if (!this.sequence) return;
    
    this.sequencesService.getCompletedCount(this.sequence._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.completedCount = count;
      });
  }

  private loadRelatedSequences() {
    if (!this.sequence) return;
    
    this.sequencesService.getAllSequences()
      .pipe(takeUntil(this.destroy$))
      .subscribe(sequences => {
        this.relatedSequences = sequences
          .filter(seq => 
            seq._id !== this.sequence!._id && 
            (seq.category === this.sequence!.category || 
             seq.difficulty === this.sequence!.difficulty ||
             seq.tags.some(tag => this.sequence!.tags.includes(tag)))
          )
          .slice(0, 3);
      });
  }

  // Actions
  async startPractice() {
    if (!this.sequence) return;
    
    if (this.sequence.isPremium && !this.isPremiumUser()) {
      await this.showPremiumRequired();
      return;
    }
    
    // Navigate to practice session with options
    this.router.navigate(['/practice-session'], {
      queryParams: {
        sequenceId: this.sequence._id,
        speed: this.practiceSpeed,
        instructions: this.includeInstructions,
        music: this.includeMusic
      }
    });
  }

  async toggleFavorite() {
    if (!this.sequence) return;
    
    try {
      this.sequencesService.toggleFavorite(this.sequence._id);
      const message = this.isFavorite ? 'Removed from favorites' : 'Added to favorites';
      this.showToast(message);
    } catch (error) {
      this.showToast('Failed to update favorites', 'danger');
    }
  }

  async shareSequence() {
    if (!this.sequence) return;
    
    const actionSheet = await this.actionSheetController.create({
      header: 'Share Sequence',
      buttons: [
        {
          text: 'Copy Link',
          icon: 'link-outline',
          handler: () => {
            this.copyToClipboard();
          }
        },
        {
          text: 'Share with Friends',
          icon: 'share-social-outline',
          handler: () => {
            this.shareWithFriends();
          }
        },
        {
          text: 'Export as PDF',
          icon: 'document-outline',
          handler: () => {
            this.exportToPDF();
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

  async editSequence() {
    if (!this.sequence || !this.canEdit) return;
    
    this.router.navigate(['/sequence-builder'], {
      queryParams: { edit: this.sequence._id }
    });
  }

  async deleteSequence() {
    if (!this.sequence || !this.canEdit) return;
    
    const alert = await this.alertController.create({
      header: 'Delete Sequence',
      message: `Are you sure you want to delete "${this.sequence.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.performDelete();
          }
        }
      ]
    });
    await alert.present();
  }

  private async performDelete() {
    if (!this.sequence) return;
    
    try {
      await this.sequencesService.deleteCustomSequence(this.sequence._id).toPromise();
      this.showToast('Sequence deleted successfully');
      this.router.navigate(['/sequences-routines']);
    } catch (error) {
      this.showToast('Failed to delete sequence', 'danger');
    }
  }

  openPoseDetail(pose: YogaPose) {
    this.router.navigate(['/pose-detail', pose._id]);
  }

  openRelatedSequence(sequence: YogaSequence) {
    this.router.navigate(['/sequence-detail', sequence._id]);
  }

  goBack() {
    this.router.navigate(['/sequences-routines']);
  }

  // Practice options
  onSpeedChange(event: any) {
    this.practiceSpeed = event.detail.value;
  }

  toggleInstructions() {
    this.includeInstructions = !this.includeInstructions;
  }

  toggleMusic() {
    this.includeMusic = !this.includeMusic;
  }

  // Helper methods
  getPoseByPoseId(poseId: string): YogaPose | undefined {
    return this.poses.find(pose => pose._id === poseId);
  }

  getSequencePoseDetails(sequencePose: SequencePose): { pose: YogaPose | undefined, duration: number } {
    return {
      pose: this.getPoseByPoseId(sequencePose.poseId),
      duration: sequencePose.duration
    };
  }

  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'medium';
    }
  }

  getSpeedLabel(speed: string): string {
    switch (speed) {
      case 'slow': return 'Slow & Mindful';
      case 'normal': return 'Normal Pace';
      case 'fast': return 'Quick Flow';
      default: return 'Normal Pace';
    }
  }

  private isPremiumUser(): boolean {
    // TODO: Implement premium user check
    return false;
  }

  private async showPremiumRequired() {
    const alert = await this.alertController.create({
      header: 'Premium Content',
      message: 'This sequence requires a premium subscription to access.',
      buttons: [
        {
          text: 'Maybe Later',
          role: 'cancel'
        },
        {
          text: 'Upgrade Now',
          handler: () => {
            this.router.navigate(['/premium']);
          }
        }
      ]
    });
    await alert.present();
  }

  private async copyToClipboard() {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      this.showToast('Link copied to clipboard');
    } catch (error) {
      this.showToast('Failed to copy link', 'warning');
    }
  }

  private shareWithFriends() {
    // TODO: Implement native sharing
    this.showToast('Sharing feature coming soon!');
  }

  private exportToPDF() {
    // TODO: Implement PDF export
    this.showToast('PDF export coming soon!');
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
