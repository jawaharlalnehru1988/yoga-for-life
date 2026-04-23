import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule, ActionSheetController, ToastController, ModalController, AlertController } from '@ionic/angular';
import { Subject, Observable } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import { SequencesService, YogaSequence } from '../services/sequences.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { MarkdownComponent } from 'ngx-markdown';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sequence-detail',
  templateUrl: './sequence-detail.page.html',
  styleUrls: ['./sequence-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonBackButton, 
    CommonModule, 
    FormsModule,
    MarkdownComponent,
    RouterLink
  ]
})
export class SequenceDetailPage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  sequence: YogaSequence | null = null;
  isLoading = true;
  isFavorite = false;
  safeVideoUrl: SafeResourceUrl | null = null;
  isImageOverlayOpen = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sequencesService: SequencesService,
    private sanitizer: DomSanitizer,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController
  ) { }

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
      .subscribe({
        next: (sequence) => {
          if (sequence) {
            this.sequence = sequence;
            this.loadFavoriteStatus();
            
            if (sequence.videoURL) {
              const videoIdMatch = sequence.videoURL.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
              if (videoIdMatch && videoIdMatch[1]) {
                const videoId = videoIdMatch[1];
                this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
              }
            }
          } else {
            this.router.navigate(['/sequences-routines']);
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading sequence:', err);
          this.isLoading = false;
        }
      });
  }

  private loadFavoriteStatus() {
    if (!this.sequence) return;

    this.sequencesService.isFavorite(this.sequence.id.toString())
      .pipe(takeUntil(this.destroy$))
      .subscribe(isFavorite => {
        this.isFavorite = isFavorite;
      });
  }

  // Actions
  async startPractice() {
    if (!this.sequence) return;
    console.log('Practice session feature disabled as per request. Enjoy the guide!');
    this.showToast('Enjoy the guide and instructions below!');
  }

  async toggleFavorite() {
    if (!this.sequence) return;

    try {
      this.sequencesService.toggleFavorite(this.sequence.id.toString());
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

  openImageOverlay() {
    this.isImageOverlayOpen = true;
  }

  closeImageOverlay() {
    this.isImageOverlayOpen = false;
  }

  goBack() {
    this.router.navigate(['/sequences-routines']);
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
