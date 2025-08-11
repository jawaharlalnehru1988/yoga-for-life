import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonMenuButton, 
  IonButton, 
  IonIcon, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonChip 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  personCircleOutline, 
  flame, 
  calendarOutline, 
  timeOutline, 
  trophyOutline, 
  bulbOutline, 
  refreshOutline, 
  playOutline, 
  flashOutline, 
  leafOutline, 
  planetOutline, 
  listOutline, 
  libraryOutline, 
  ribbonOutline, 
  starOutline, 
  star 
} from 'ionicons/icons';
import { ThemeService } from '../services/theme.service';
import { Subscription } from 'rxjs';

interface Suggestion {
  name: string;
  description: string;
  duration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  image: string;
  type: string;
}

interface Challenge {
  name: string;
  description: string;
  progress: number;
  currentDay: number;
  totalDays: number;
  daysLeft: number;
}

interface DailyTip {
  quote: string;
  author: string;
  category: string;
}

interface RecentSession {
  name: string;
  date: Date;
  duration: number;
  type: string;
  rating: number;
}

interface MotivationalQuote {
  text: string;
  author: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonMenuButton, 
    IonButton, 
    IonIcon, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent,
    IonChip,
    CommonModule, 
    FormsModule
  ]
})
export class HomePage implements OnInit, OnDestroy {
  
  // User data
  userName = 'Yogi';
  currentGreeting = '';
  currentStreak = 7;
  
  // Stats
  totalSessions = 24;
  totalMinutes = 480;
  achievementsCount = 5;
  
  // Today's suggestion
  todaysSuggestion: Suggestion = {
    name: 'Morning Sun Salutation',
    description: 'Start your day with energizing sun salutations to awaken your body and mind.',
    duration: 15,
    difficulty: 'beginner',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&crop=center',
    type: 'sequence'
  };
  
  // Current challenge
  currentChallenge: Challenge | null = {
    name: '21-Day Flexibility Challenge',
    description: 'Improve your flexibility with daily stretching routines',
    progress: 33,
    currentDay: 7,
    totalDays: 21,
    daysLeft: 14
  };
  
  // Daily wellness tip
  dailyTip: DailyTip = {
    quote: 'Yoga is not about touching your toes. It is about what you learn on the way down.',
    author: 'Judith Hanson Lasater',
    category: 'Philosophy'
  };
  
  // Recent sessions
  recentSessions: RecentSession[] = [
    {
      name: 'Evening Relaxation',
      date: new Date(Date.now() - 86400000), // Yesterday
      duration: 20,
      type: 'meditation',
      rating: 5
    },
    {
      name: 'Morning Stretch',
      date: new Date(Date.now() - 2 * 86400000), // 2 days ago
      duration: 15,
      type: 'sequence',
      rating: 4
    },
    {
      name: 'Breathing Practice',
      date: new Date(Date.now() - 3 * 86400000), // 3 days ago
      duration: 10,
      type: 'breathing',
      rating: 5
    }
  ];
  
  // Motivational quote
  motivationalQuote: MotivationalQuote = {
    text: 'The success of yoga does not lie in the ability to attain the perfect posture but in how it brings positive changes in people\'s lives.',
    author: 'T.K.V. Desikachar'
  };

  private suggestions: Suggestion[] = [
    {
      name: 'Morning Sun Salutation',
      description: 'Start your day with energizing sun salutations to awaken your body and mind.',
      duration: 15,
      difficulty: 'beginner',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&crop=center',
      type: 'sequence'
    },
    {
      name: 'Stress Relief Flow',
      description: 'Gentle movements to release tension and calm your nervous system.',
      duration: 20,
      difficulty: 'beginner',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop&crop=center',
      type: 'sequence'
    },
    {
      name: 'Core Strength Builder',
      description: 'Build core stability with targeted poses and movements.',
      duration: 25,
      difficulty: 'intermediate',
      image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=300&fit=crop&crop=center',
      type: 'sequence'
    },
    {
      name: 'Deep Breathing Session',
      description: 'Practice pranayama techniques for better focus and relaxation.',
      duration: 10,
      difficulty: 'beginner',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center',
      type: 'breathing'
    }
  ];

  private themeSubscription?: Subscription;

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {
    addIcons({ 
      personCircleOutline, 
      flame, 
      calendarOutline, 
      timeOutline, 
      trophyOutline, 
      bulbOutline, 
      refreshOutline, 
      playOutline, 
      flashOutline, 
      leafOutline, 
      planetOutline, 
      listOutline, 
      libraryOutline, 
      ribbonOutline, 
      starOutline, 
      star 
    });
  }

  ngOnInit() {
    this.setGreeting();
    this.loadUserData();
    
    // Subscribe to theme changes if needed
    this.themeSubscription = this.themeService.currentTheme$.subscribe(() => {
      // Handle theme changes if needed
    });
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  private setGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.currentGreeting = 'Good morning! Ready to start your practice?';
    } else if (hour < 17) {
      this.currentGreeting = 'Good afternoon! Time for some mindful movement.';
    } else {
      this.currentGreeting = 'Good evening! Let\'s unwind with some yoga.';
    }
  }

  private loadUserData() {
    // In a real app, this would load from a service/API
    // For now, we'll use mock data
    const savedUserName = localStorage.getItem('yoga-user-name');
    if (savedUserName) {
      this.userName = savedUserName;
    }
    
    // Load user stats
    const savedStats = localStorage.getItem('yoga-user-stats');
    if (savedStats) {
      const stats = JSON.parse(savedStats);
      this.totalSessions = stats.totalSessions || this.totalSessions;
      this.totalMinutes = stats.totalMinutes || this.totalMinutes;
      this.currentStreak = stats.currentStreak || this.currentStreak;
      this.achievementsCount = stats.achievementsCount || this.achievementsCount;
    }
  }

  openProfile() {
    // Navigate to profile page or open profile modal
    this.router.navigate(['/settings']);
  }

  refreshSuggestion() {
    // Get a random suggestion from the array
    const randomIndex = Math.floor(Math.random() * this.suggestions.length);
    this.todaysSuggestion = { ...this.suggestions[randomIndex] };
  }

  startSuggestedPractice() {
    // Navigate to the appropriate page based on suggestion type
    switch (this.todaysSuggestion.type) {
      case 'sequence':
        this.router.navigate(['/sequences-routines']);
        break;
      case 'breathing':
        this.router.navigate(['/breathing']);
        break;
      case 'meditation':
        this.router.navigate(['/meditation']);
        break;
      default:
        this.router.navigate(['/yogasana-library']);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  viewChallenge() {
    this.router.navigate(['/challenges']);
  }

  getSessionIcon(type: string): string {
    switch (type) {
      case 'meditation':
        return 'planet-outline';
      case 'breathing':
        return 'leaf-outline';
      case 'sequence':
        return 'list-outline';
      default:
        return 'fitness-outline';
    }
  }
}
