import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge,
  IonLabel,
  IonChip,
  IonSpinner
} from '@ionic/angular/standalone';
import { Observable, Subscription } from 'rxjs';
import { YogaPosesService, YogaPose } from '../services/yoga-poses.service';

@Component({
  selector: 'app-pose-detail',
  templateUrl: './pose-detail.page.html',
  styleUrls: ['./pose-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge,
    IonLabel,
    IonChip,
    IonSpinner,
    CommonModule, 
    FormsModule
  ]
})
export class PoseDetailPage implements OnInit, OnDestroy {
  pose: YogaPose | null = null;
  relatedPoses: YogaPose[] = [];
  isLoading = true;
  error = false;
  currentStep = 0;
  isFavorite!: Observable<boolean>;
  
  private subscriptions: Subscription[] = [];
  private poseId: string = '';

  // Mock share service (in real app this would be injected)
  shareService = {
    sharePose: (pose: YogaPose) => {
      if (navigator.share) {
        navigator.share({
          title: pose.name,
          text: `Check out this yoga pose: ${pose.name} - ${pose.quickBenefit}`,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(window.location.href);
        // In real app, show toast message
        console.log('URL copied to clipboard');
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private yogaPosesService: YogaPosesService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.poseId = params['id'];
      if (this.poseId) {
        this.loadPoseDetails();
      } else {
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadPoseDetails() {
    this.isLoading = true;
    this.error = false;

    const sub = this.yogaPosesService.getPoseById(this.poseId).subscribe({
      next: (pose) => {
        if (pose) {
          this.pose = pose;
          this.isFavorite = this.yogaPosesService.isFavorite(pose._id);
          this.loadRelatedPoses();
        } else {
          this.error = true;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading pose:', err);
        this.error = true;
        this.isLoading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  private loadRelatedPoses() {
    if (!this.pose) return;

    // Find poses with similar tags or same category
    const sub = this.yogaPosesService.getAllPoses().subscribe(allPoses => {
      this.relatedPoses = allPoses
        .filter(p => 
          p._id !== this.pose!._id && 
          (p.category === this.pose!.category || 
           p.tags.some(tag => this.pose!.tags.includes(tag)))
        )
        .slice(0, 4); // Show only 4 related poses
    });

    this.subscriptions.push(sub);
  }

  // Navigation methods
  nextStep() {
    if (this.pose && this.currentStep < this.pose.steps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  navigateToPose(poseId: string) {
    this.router.navigate(['/pose-detail', poseId]);
  }

  // Action methods
  toggleFavorite() {
    if (this.pose) {
      this.yogaPosesService.toggleFavorite(this.pose._id);
    }
  }

  startPractice() {
    if (this.pose) {
      // In a real app, this would navigate to a practice session
      // For now, we'll just log it
      console.log('Starting practice for:', this.pose.name);
      
      // You could navigate to a practice page or show a modal
      // this.router.navigate(['/practice', this.pose._id]);
      
      // Or show instructions in a guided format
      this.showPracticeModal();
    }
  }

  addToRoutine() {
    if (this.pose) {
      // In a real app, this would show a modal to select routines
      // or add to a default routine
      console.log('Adding to routine:', this.pose.name);
      
      // Mock implementation - in real app this would interact with a routine service
      const routines = JSON.parse(localStorage.getItem('yoga-routines') || '[]');
      const defaultRoutine = routines.find((r: any) => r.name === 'My Routine') || {
        id: 'default',
        name: 'My Routine',
        poses: []
      };
      
      if (!defaultRoutine.poses.includes(this.pose._id)) {
        defaultRoutine.poses.push(this.pose._id);
        if (!routines.some((r: any) => r.id === 'default')) {
          routines.push(defaultRoutine);
        }
        localStorage.setItem('yoga-routines', JSON.stringify(routines));
        console.log('Added to My Routine');
      }
    }
  }

  private showPracticeModal() {
    // In a real app, this would show a modal or navigate to practice mode
    // For now, just reset the step counter to start guided practice
    this.currentStep = 0;
    
    // Could implement auto-advance through steps with timer
    // this.startGuidedPractice();
  }

  // Utility methods
  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'danger';
      default: return 'medium';
    }
  }

  // Optional: Auto-advance through steps for guided practice
  private startGuidedPractice() {
    if (!this.pose) return;
    
    // Reset to first step
    this.currentStep = 0;
    
    // Auto-advance every 5 seconds (example)
    const interval = setInterval(() => {
      if (this.currentStep < this.pose!.steps.length - 1) {
        this.currentStep++;
      } else {
        clearInterval(interval);
        console.log('Practice session completed!');
      }
    }, 5000);
  }
}
