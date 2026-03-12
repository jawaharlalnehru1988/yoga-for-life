import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { Observable, Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { YogaPosesService, YogaPose } from '../services/yoga-poses.service';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-pose-detail',
  templateUrl: './pose-detail.page.html',
  styleUrls: ['./pose-detail.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    RouterLink,
    MarkdownComponent
  ]
})
export class PoseDetailPage implements OnInit, OnDestroy {
  pose: YogaPose | null = null;
  relatedPoses: YogaPose[] = [];
  isLoading = true;
  error = false;
  isFavorite!: Observable<boolean>;

  private subscriptions: Subscription[] = [];
  private poseId: string = '';

  shareService = {
    sharePose: (pose: YogaPose) => {
      if (navigator.share) {
        navigator.share({
          title: pose.yogaName,
          text: `Check out this yoga pose: ${pose.yogaName}`,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        console.log('URL copied to clipboard');
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private yogaPosesService: YogaPosesService
  ) { }

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
          this.isFavorite = this.yogaPosesService.isFavorite(pose.id);
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

    const sub = this.yogaPosesService.getAllPoses().subscribe(allPoses => {
      this.relatedPoses = allPoses
        .filter(p =>
          p.id !== this.pose!.id &&
          (p.category === this.pose!.category)
        )
        .slice(0, 4);
    });

    this.subscriptions.push(sub);
  }

  navigateToPose(poseId: number) {
    this.router.navigate(['/pose-detail', poseId]);
  }

  toggleFavorite() {
    if (this.pose) {
      this.yogaPosesService.toggleFavorite(this.pose.id);
    }
  }

  startPractice() {
    if (this.pose) {
      console.log('Starting practice for:', this.pose.yogaName);
    }
  }
}
