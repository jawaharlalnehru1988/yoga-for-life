import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonCard,
  IonCardContent,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonProgressBar,
  IonChip,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonList,
  IonThumbnail,
  IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  trophyOutline, 
  flameOutline, 
  timeOutline, 
  calendarOutline,
  heartOutline,
  bodyOutline,
  barChartOutline,
  medalOutline,
  checkmarkCircle,
  starOutline,
  fitness,
  leaf,
  water,
  moon,
  sunny,
  analytics,
  trendingUp,
  ribbon,
  timer,
  calendar,
  checkmark, ellipseOutline } from 'ionicons/icons';

export interface ProgressStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experiencePoints: number;
  nextLevelXP: number;
}

export interface WeeklyActivity {
  date: Date;
  sessions: number;
  minutes: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedDate?: Date;
  progress: number;
  target: number;
  category: 'practice' | 'streak' | 'time' | 'challenge' | 'meditation';
}

export interface RecentSession {
  id: string;
  type: 'yoga' | 'meditation' | 'breathing' | 'challenge';
  title: string;
  duration: number;
  date: Date;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  rating?: number;
}

export interface MonthlyGoal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  category: 'sessions' | 'minutes' | 'challenges' | 'streaks';
  icon: string;
  color: string;
}

@Component({
  selector: 'app-my-progress',
  templateUrl: './my-progress.page.html',
  styleUrls: ['./my-progress.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonCard,
    IonCardContent,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonProgressBar,
    IonChip,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonList,
    IonThumbnail,
    IonNote,
    CommonModule, 
    FormsModule
  ]
})
export class MyProgressPage implements OnInit {
  selectedTimeframe: string = 'week';
  
  stats: ProgressStats = {
    totalSessions: 47,
    totalMinutes: 1420,
    currentStreak: 12,
    longestStreak: 18,
    level: 8,
    experiencePoints: 2340,
    nextLevelXP: 2500
  };

  weeklyActivity: WeeklyActivity[] = [];
  achievements: Achievement[] = [];
  recentSessions: RecentSession[] = [];
  monthlyGoals: MonthlyGoal[] = [];

  constructor() {
    addIcons({analytics,trophyOutline,fitness,timeOutline,flameOutline,medalOutline,calendarOutline,ellipseOutline,trendingUp,ribbon,checkmark,checkmarkCircle,barChartOutline,heartOutline,bodyOutline,starOutline,leaf,water,moon,sunny,timer,calendar});
  }

  ngOnInit() {
    this.initializeData();
  }

  initializeData() {
    this.initializeWeeklyActivity();
    this.initializeAchievements();
    this.initializeRecentSessions();
    this.initializeMonthlyGoals();
  }

  initializeWeeklyActivity() {
    const today = new Date();
    this.weeklyActivity = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const activity: WeeklyActivity = {
        date: date,
        sessions: Math.floor(Math.random() * 3),
        minutes: Math.floor(Math.random() * 90) + 10,
        completed: Math.random() > 0.3
      };
      
      this.weeklyActivity.push(activity);
    }
  }

  initializeAchievements() {
    this.achievements = [
      {
        id: 'first_session',
        title: 'First Steps',
        description: 'Complete your first yoga session',
        icon: 'leaf',
        color: 'success',
        unlocked: true,
        unlockedDate: new Date(Date.now() - 86400000 * 30),
        progress: 1,
        target: 1,
        category: 'practice'
      },
      {
        id: 'week_streak',
        title: 'Seven Days Strong',
        description: 'Practice for 7 consecutive days',
        icon: 'flameOutline',
        color: 'warning',
        unlocked: true,
        unlockedDate: new Date(Date.now() - 86400000 * 15),
        progress: 7,
        target: 7,
        category: 'streak'
      },
      {
        id: 'meditation_master',
        title: 'Meditation Master',
        description: 'Complete 20 meditation sessions',
        icon: 'moon',
        color: 'secondary',
        unlocked: false,
        progress: 14,
        target: 20,
        category: 'meditation'
      },
      {
        id: 'time_keeper',
        title: 'Time Keeper',
        description: 'Practice for 1000 minutes total',
        icon: 'timeOutline',
        color: 'primary',
        unlocked: true,
        unlockedDate: new Date(Date.now() - 86400000 * 7),
        progress: 1420,
        target: 1000,
        category: 'time'
      },
      {
        id: 'challenge_champion',
        title: 'Challenge Champion',
        description: 'Complete 5 yoga challenges',
        icon: 'trophyOutline',
        color: 'tertiary',
        unlocked: false,
        progress: 3,
        target: 5,
        category: 'challenge'
      },
      {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Practice before 7 AM for 5 days',
        icon: 'sunny',
        color: 'warning',
        unlocked: false,
        progress: 2,
        target: 5,
        category: 'practice'
      }
    ];
  }

  initializeRecentSessions() {
    this.recentSessions = [
      {
        id: 'session1',
        type: 'yoga',
        title: 'Morning Flow Sequence',
        duration: 30,
        date: new Date(Date.now() - 86400000),
        difficulty: 'intermediate',
        completed: true,
        rating: 5
      },
      {
        id: 'session2',
        type: 'meditation',
        title: 'Mindful Breathing',
        duration: 15,
        date: new Date(Date.now() - 86400000 * 2),
        difficulty: 'beginner',
        completed: true,
        rating: 4
      },
      {
        id: 'session3',
        type: 'breathing',
        title: '4-7-8 Breathing Technique',
        duration: 10,
        date: new Date(Date.now() - 86400000 * 3),
        difficulty: 'beginner',
        completed: true,
        rating: 5
      },
      {
        id: 'session4',
        type: 'challenge',
        title: '30-Day Flexibility Challenge',
        duration: 45,
        date: new Date(Date.now() - 86400000 * 4),
        difficulty: 'advanced',
        completed: true,
        rating: 4
      },
      {
        id: 'session5',
        type: 'yoga',
        title: 'Evening Restorative Yoga',
        duration: 25,
        date: new Date(Date.now() - 86400000 * 5),
        difficulty: 'beginner',
        completed: true,
        rating: 5
      }
    ];
  }

  initializeMonthlyGoals() {
    this.monthlyGoals = [
      {
        id: 'sessions_goal',
        title: 'Practice Sessions',
        description: 'Complete 25 sessions this month',
        target: 25,
        current: 18,
        unit: 'sessions',
        category: 'sessions',
        icon: 'fitness',
        color: 'primary'
      },
      {
        id: 'minutes_goal',
        title: 'Practice Time',
        description: 'Reach 500 minutes of practice',
        target: 500,
        current: 340,
        unit: 'minutes',
        category: 'minutes',
        icon: 'timeOutline',
        color: 'success'
      },
      {
        id: 'challenges_goal',
        title: 'Challenge Completion',
        description: 'Complete 2 yoga challenges',
        target: 2,
        current: 1,
        unit: 'challenges',
        category: 'challenges',
        icon: 'trophyOutline',
        color: 'tertiary'
      },
      {
        id: 'streak_goal',
        title: 'Consistency Streak',
        description: 'Maintain a 15-day streak',
        target: 15,
        current: 12,
        unit: 'days',
        category: 'streaks',
        icon: 'flameOutline',
        color: 'warning'
      }
    ];
  }

  onTimeframeChange() {
    // Handle timeframe changes for analytics
    console.log('Timeframe changed to:', this.selectedTimeframe);
  }

  getProgressPercentage(): number {
    return (this.stats.experiencePoints / this.stats.nextLevelXP) * 100;
  }

  getLevelProgressText(): string {
    const remaining = this.stats.nextLevelXP - this.stats.experiencePoints;
    return `${remaining} XP to level ${this.stats.level + 1}`;
  }

  getSessionTypeIcon(type: string): string {
    switch (type) {
      case 'yoga': return 'body-outline';
      case 'meditation': return 'moon';
      case 'breathing': return 'water';
      case 'challenge': return 'trophy-outline';
      default: return 'fitness';
    }
  }

  getSessionTypeColor(type: string): string {
    switch (type) {
      case 'yoga': return 'primary';
      case 'meditation': return 'secondary';
      case 'breathing': return 'tertiary';
      case 'challenge': return 'warning';
      default: return 'medium';
    }
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'medium';
    }
  }

  getGoalProgress(goal: MonthlyGoal): number {
    return Math.min((goal.current / goal.target) * 100, 100);
  }

  getAchievementProgress(achievement: Achievement): number {
    return Math.min((achievement.progress / achievement.target) * 100, 100);
  }

  formatDate(date: Date): string {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  generateStars(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'star' : 'star-outline');
    }
    return stars;
  }

  getUnlockedAchievementsCount(): number {
    return this.achievements.filter(a => a.unlocked).length;
  }

  roundNumber(num: number): number {
    return Math.round(num);
  }
}
