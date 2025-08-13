import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  chevronBack, 
  play, 
  pause, 
  checkmarkCircle, 
  ellipseOutline,
  star,
  flame,
  trophy,
  people,
  calendar,
  time,
  fitness,
  heart,
  leaf,
  moon,
  flash,
  refresh,
  water,
  happy,
  sparkles,
  eye,
  gift,
  medalOutline,
  trendingUp,
  playCircle,
  lockClosed,
  flag,
  share,
  bookmark,
  bookmarkOutline
} from 'ionicons/icons';
import { ChallengesService, Challenge, UserChallengeProgress } from '../shared/challenges.service';

interface DailyActivity {
  day: number;
  date: Date;
  isCompleted: boolean;
  completedAt?: Date;
  activities: ActivityItem[];
  notes?: string;
  mood?: 'excellent' | 'good' | 'neutral' | 'challenging';
}

interface ActivityItem {
  id: string;
  title: string;
  type: 'pose' | 'breathing' | 'meditation' | 'lifestyle';
  duration: number;
  isCompleted: boolean;
  completedAt?: Date;
  difficulty?: string;
  instructions?: string;
}

@Component({
  selector: 'app-challenge-detail',
  templateUrl: './challenge-detail.page.html',
  styleUrls: ['./challenge-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChallengeDetailPage implements OnInit {
  challengeId: string = '';
  challenge: Challenge | null = null;
  userProgress: UserChallengeProgress | null = null;
  currentTab: 'overview' | 'progress' | 'community' = 'overview';
  dailyActivities: DailyActivity[] = [];
  isBookmarked = false;
  showFullDescription = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private challengesService: ChallengesService
  ) {
    addIcons({
      chevronBack,
      play,
      pause,
      checkmarkCircle,
      ellipseOutline,
      star,
      flame,
      trophy,
      people,
      calendar,
      time,
      fitness,
      heart,
      leaf,
      moon,
      flash,
      refresh,
      water,
      happy,
      sparkles,
      eye,
      gift,
      medalOutline,
      trendingUp,
      playCircle,
      lockClosed,
      flag,
      share,
      bookmark,
      bookmarkOutline
    });
  }

  ngOnInit() {
    this.challengeId = this.route.snapshot.paramMap.get('id') || '';
    this.loadChallenge();
    this.loadUserProgress();
  }

  loadChallenge() {
    this.challengesService.getChallengeById(this.challengeId).subscribe(challenge => {
      this.challenge = challenge || null;
      if (this.challenge) {
        this.generateDailyActivities();
      }
    });
    this.isBookmarked = Math.random() > 0.5; // Mock bookmark status
  }

  loadUserProgress() {
    this.challengesService.getUserProgress(this.challengeId).subscribe(progress => {
      this.userProgress = progress || null;
      if (this.challenge && this.userProgress) {
        this.generateDailyActivities();
      }
    });
  }

  generateDailyActivities() {
    if (!this.challenge) return;

    this.dailyActivities = Array.from({ length: this.challenge.duration }, (_, i) => {
      const day = i + 1;
      const date = new Date();
      date.setDate(date.getDate() - (this.challenge!.duration - day));

      const isCompleted = this.userProgress ? day <= this.userProgress.currentDay - 1 : false;

      return {
        day,
        date,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
        activities: this.generateDayActivities(day),
        mood: isCompleted ? 
          ['excellent', 'good', 'neutral', 'challenging'][Math.floor(Math.random() * 4)] as any : undefined
      };
    });
  }

  generateDayActivities(day: number): ActivityItem[] {
    if (!this.challenge) return [];

    // Get activities from the service based on challenge type
    const activities: ActivityItem[] = [];

    // Add yoga activities if applicable
    if (this.challenge.type === 'yoga' || this.challenge.type === 'mixed') {
      const yogaActivities = this.challengesService.getChallengeActivities(this.challengeId, day, 'yoga');
      yogaActivities.forEach(activity => {
        activities.push({
          id: `${day}-yoga-${activity.id}`,
          title: activity.name,
          type: 'pose',
          duration: activity.duration,
          isCompleted: this.userProgress ? day < this.userProgress.currentDay : false,
          difficulty: activity.difficulty,
          instructions: `Practice ${activity.name} with focus on alignment`
        });
      });
    }

    // Add breathing activities if applicable
    if (this.challenge.type === 'breathing' || this.challenge.type === 'mixed') {
      const breathingActivities = this.challengesService.getChallengeActivities(this.challengeId, day, 'breathing');
      breathingActivities.forEach(activity => {
        activities.push({
          id: `${day}-breathing-${activity.id}`,
          title: activity.name,
          type: 'breathing',
          duration: activity.duration,
          isCompleted: this.userProgress ? day < this.userProgress.currentDay : false,
          difficulty: activity.difficulty,
          instructions: `Practice ${activity.name} for relaxation and focus`
        });
      });
    }

    // Add meditation activities if applicable
    if (this.challenge.type === 'meditation' || this.challenge.type === 'mixed') {
      const meditationActivities = this.challengesService.getChallengeActivities(this.challengeId, day, 'meditation');
      meditationActivities.forEach(activity => {
        activities.push({
          id: `${day}-meditation-${activity.id}`,
          title: activity.name,
          type: 'meditation',
          duration: activity.duration,
          isCompleted: this.userProgress ? day < this.userProgress.currentDay : false,
          instructions: `Practice ${activity.name} meditation`
        });
      });
    }

    return activities;
  }

  goBack() {
    this.router.navigate(['/challenges']);
  }

  joinChallenge() {
    if (!this.userProgress) {
      this.challengesService.joinChallenge(this.challengeId);
      this.loadUserProgress();
    } else {
      this.challengesService.leaveChallenge(this.challengeId);
      this.userProgress = null;
    }
  }

  startDailyPractice() {
    if (!this.userProgress || !this.challenge) return;
    
    const nextDay = this.userProgress.currentDay;
    const activity = this.dailyActivities.find(a => a.day === nextDay);
    
    if (activity && activity.activities.length > 0) {
      const firstActivity = activity.activities[0];
      
      // Navigate to the appropriate practice session based on activity type
      switch (firstActivity.type) {
        case 'pose':
          this.router.navigate(['/practice-session'], {
            queryParams: {
              challengeId: this.challengeId,
              day: nextDay,
              activityId: firstActivity.id,
              type: 'yoga'
            }
          });
          break;
        case 'breathing':
          this.router.navigate(['/breathing'], {
            queryParams: {
              challengeId: this.challengeId,
              day: nextDay,
              exercise: firstActivity.id
            }
          });
          break;
        case 'meditation':
          this.router.navigate(['/meditation'], {
            queryParams: {
              challengeId: this.challengeId,
              day: nextDay,
              session: firstActivity.id
            }
          });
          break;
      }
    }
  }

  markDayComplete(day: number) {
    if (!this.userProgress || !this.challenge) return;

    if (day === this.userProgress.currentDay) {
      const activity = this.dailyActivities.find(a => a.day === day);
      if (activity && activity.activities.length > 0) {
        const firstActivity = activity.activities[0];
        
        // Complete the day's activity using the service
        const activityType = firstActivity.type === 'pose' ? 'yoga' : 
                           firstActivity.type === 'lifestyle' ? 'yoga' : 
                           firstActivity.type as 'breathing' | 'meditation' | 'yoga';
        
        this.challengesService.completeDayActivity(this.challengeId, day, {
          type: activityType,
          activityId: firstActivity.id,
          duration: firstActivity.duration
        });

        // Reload progress
        this.loadUserProgress();
      }
    }
  }

  toggleBookmark() {
    this.isBookmarked = !this.isBookmarked;
  }

  shareChallenge() {
    // Implement sharing functionality
    console.log('Sharing challenge:', this.challenge?.title);
  }

  switchTab(tab: 'overview' | 'progress' | 'community') {
    this.currentTab = tab;
  }

  toggleDescription() {
    this.showFullDescription = !this.showFullDescription;
  }

  getDayStatus(day: number): 'completed' | 'current' | 'upcoming' | 'locked' {
    if (!this.userProgress) return 'locked';
    
    if (day < this.userProgress.currentDay) return 'completed';
    if (day === this.userProgress.currentDay) return 'current';
    if (day === this.userProgress.currentDay + 1) return 'upcoming';
    return 'locked';
  }

  getProgressColor(percentage: number): string {
    if (percentage >= 80) return '#4CAF50';
    if (percentage >= 60) return '#FF9800';
    if (percentage >= 40) return '#2196F3';
    return '#9E9E9E';
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }
}
