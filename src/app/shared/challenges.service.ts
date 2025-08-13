import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Import interfaces from challenges page
export interface Challenge {
  _id: string;
  title: string;
  description: string;
  shortDescription: string;
  type: 'yoga' | 'breathing' | 'meditation' | 'lifestyle' | 'mixed';
  category: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  duration: number; // in days
  estimatedTimePerDay: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  participants: number;
  completionRate: number; // percentage
  rating: number;
  goals: ChallengeGoal[];
  rewards: ChallengeReward[];
  requirements: string[];
  tips: string[];
  imageUrl: string;
  bannerUrl?: string;
  instructorName?: string;
  instructorImage?: string;
  prerequisites?: string[];
  equipment?: string[];
  benefits: string[];
  tags: string[];
  isPopular: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ChallengeGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  type: 'daily' | 'weekly' | 'total';
  isRequired: boolean;
}

export interface ChallengeReward {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  badgeColor: string;
  pointsValue: number;
  unlocksAt: number; // goal completion percentage
}

export interface UserChallengeProgress {
  challengeId: string;
  userId: string;
  startedAt: Date;
  currentDay: number;
  totalDays: number;
  completedGoals: { [goalId: string]: number };
  isCompleted: boolean;
  isJoined: boolean;
  streakDays: number;
  missedDays: number;
  lastActivityDate: Date;
  progressPercentage: number;
  completionPercentage: number;
  earnedRewards: string[];
  notes?: string[];
  completedDays: number[];
  currentStreak: number;
  goalProgress: { [goalId: string]: number };
}

export interface ActivitySession {
  id: string;
  challengeId: string;
  day: number;
  type: 'yoga' | 'breathing' | 'meditation';
  activityId: string; // ID of pose, breathing exercise, or meditation
  duration: number;
  completedAt: Date;
  difficulty?: string;
  userRating?: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChallengesService {
  private challengesSubject = new BehaviorSubject<Challenge[]>([]);
  private userProgressSubject = new BehaviorSubject<{ [challengeId: string]: UserChallengeProgress }>({});
  private activitySessionsSubject = new BehaviorSubject<ActivitySession[]>([]);

  public challenges$ = this.challengesSubject.asObservable();
  public userProgress$ = this.userProgressSubject.asObservable();
  public activitySessions$ = this.activitySessionsSubject.asObservable();

  constructor() {
    this.loadMockData();
  }

  // Get all challenges
  getAllChallenges(): Observable<Challenge[]> {
    return this.challenges$;
  }

  // Get challenge by ID
  getChallengeById(id: string): Observable<Challenge | undefined> {
    return new Observable(observer => {
      this.challenges$.subscribe(challenges => {
        const challenge = challenges.find(c => c._id === id);
        observer.next(challenge);
      });
    });
  }

  // Get user progress for a specific challenge
  getUserProgress(challengeId: string): Observable<UserChallengeProgress | undefined> {
    return new Observable(observer => {
      this.userProgress$.subscribe(progress => {
        observer.next(progress[challengeId]);
      });
    });
  }

  // Join a challenge
  joinChallenge(challengeId: string): void {
    const currentProgress = this.userProgressSubject.value;
    const challenge = this.challengesSubject.value.find(c => c._id === challengeId);
    
    if (challenge && !currentProgress[challengeId]) {
      const newProgress: UserChallengeProgress = {
        challengeId,
        userId: 'user123', // In real app, get from auth service
        startedAt: new Date(),
        currentDay: 1,
        totalDays: challenge.duration,
        completedGoals: {},
        isCompleted: false,
        isJoined: true,
        streakDays: 0,
        missedDays: 0,
        lastActivityDate: new Date(),
        progressPercentage: 0,
        completionPercentage: 0,
        earnedRewards: [],
        notes: [],
        completedDays: [],
        currentStreak: 0,
        goalProgress: {}
      };

      this.userProgressSubject.next({
        ...currentProgress,
        [challengeId]: newProgress
      });
    }
  }

  // Leave a challenge
  leaveChallenge(challengeId: string): void {
    const currentProgress = this.userProgressSubject.value;
    const { [challengeId]: removed, ...remainingProgress } = currentProgress;
    this.userProgressSubject.next(remainingProgress);
  }

  // Complete a day's activity
  completeDayActivity(challengeId: string, day: number, activitySession: Omit<ActivitySession, 'id' | 'challengeId' | 'day' | 'completedAt'>): void {
    const currentProgress = this.userProgressSubject.value;
    const userProgress = currentProgress[challengeId];
    
    if (userProgress) {
      // Update current day if this is the next day
      if (day === userProgress.currentDay) {
        userProgress.currentDay = Math.min(day + 1, userProgress.totalDays);
      }

      // Update progress percentage
      userProgress.progressPercentage = (day / userProgress.totalDays) * 100;
      
      // Update streak
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (this.isSameDay(userProgress.lastActivityDate, yesterday) || day === 1) {
        userProgress.streakDays++;
      } else if (!this.isSameDay(userProgress.lastActivityDate, today)) {
        userProgress.streakDays = 1;
      }
      
      userProgress.lastActivityDate = new Date();

      // Check if challenge is completed
      if (day === userProgress.totalDays) {
        userProgress.isCompleted = true;
      }

      // Update the progress
      this.userProgressSubject.next({
        ...currentProgress,
        [challengeId]: userProgress
      });

      // Record the activity session
      const session: ActivitySession = {
        id: this.generateId(),
        challengeId,
        day,
        completedAt: new Date(),
        ...activitySession
      };

      const currentSessions = this.activitySessionsSubject.value;
      this.activitySessionsSubject.next([...currentSessions, session]);
    }
  }

  // Get challenge-related activities for different types
  getChallengeActivities(challengeId: string, day: number, type: 'yoga' | 'breathing' | 'meditation'): any[] {
    const challenge = this.challengesSubject.value.find(c => c._id === challengeId);
    if (!challenge) return [];

    // Generate relevant activities based on challenge type and day
    switch (type) {
      case 'yoga':
        return this.getYogaActivities(challenge, day);
      case 'breathing':
        return this.getBreathingActivities(challenge, day);
      case 'meditation':
        return this.getMeditationActivities(challenge, day);
      default:
        return [];
    }
  }

  // Integration methods for existing features
  getYogaActivities(challenge: Challenge, day: number): any[] {
    // This would integrate with YogasanaLibraryPage poses
    const poses = [
      { id: 'pose1', name: 'Mountain Pose', difficulty: 'beginner', duration: 60 },
      { id: 'pose2', name: 'Forward Fold', difficulty: 'beginner', duration: 90 },
      { id: 'pose3', name: 'Warrior I', difficulty: 'intermediate', duration: 120 },
      { id: 'pose4', name: 'Tree Pose', difficulty: 'intermediate', duration: 60 },
      { id: 'pose5', name: 'Child\'s Pose', difficulty: 'beginner', duration: 120 }
    ];

    // Select poses based on challenge type and day progression
    const posesPerDay = challenge.type === 'yoga' ? 3 : 2;
    const startIndex = ((day - 1) * posesPerDay) % poses.length;
    
    return poses.slice(startIndex, startIndex + posesPerDay);
  }

  getBreathingActivities(challenge: Challenge, day: number): any[] {
    // This would integrate with BreathingPage exercises
    const exercises = [
      { id: 'breath1', name: '4-7-8 Breathing', duration: 300, difficulty: 'beginner' },
      { id: 'breath2', name: 'Box Breathing', duration: 600, difficulty: 'beginner' },
      { id: 'breath3', name: 'Alternate Nostril', duration: 480, difficulty: 'intermediate' },
      { id: 'breath4', name: 'Belly Breathing', duration: 360, difficulty: 'beginner' },
      { id: 'breath5', name: 'Wim Hof Method', duration: 900, difficulty: 'advanced' }
    ];

    // Select exercises based on challenge and day
    const exerciseIndex = (day - 1) % exercises.length;
    return [exercises[exerciseIndex]];
  }

  getMeditationActivities(challenge: Challenge, day: number): any[] {
    // This would integrate with MeditationPage sessions
    const meditations = [
      { id: 'med1', name: 'Mindfulness Meditation', duration: 600, type: 'mindfulness' },
      { id: 'med2', name: 'Body Scan', duration: 900, type: 'relaxation' },
      { id: 'med3', name: 'Loving Kindness', duration: 720, type: 'compassion' },
      { id: 'med4', name: 'Breath Awareness', duration: 480, type: 'focus' },
      { id: 'med5', name: 'Walking Meditation', duration: 1200, type: 'movement' }
    ];

    const meditationIndex = (day - 1) % meditations.length;
    return [meditations[meditationIndex]];
  }

  // Get user's active challenges
  getActiveChallenges(): Observable<Challenge[]> {
    return new Observable(observer => {
      this.challenges$.subscribe(challenges => {
        this.userProgress$.subscribe(progress => {
          const activeChallenges = challenges.filter(challenge => {
            const userProgress = progress[challenge._id];
            return userProgress && !userProgress.isCompleted;
          });
          observer.next(activeChallenges);
        });
      });
    });
  }

  // Get user's completed challenges
  getCompletedChallenges(): Observable<Challenge[]> {
    return new Observable(observer => {
      this.challenges$.subscribe(challenges => {
        this.userProgress$.subscribe(progress => {
          const completedChallenges = challenges.filter(challenge => {
            const userProgress = progress[challenge._id];
            return userProgress && userProgress.isCompleted;
          });
          observer.next(completedChallenges);
        });
      });
    });
  }

  // Get activity sessions for a challenge
  getChallengeActivitySessions(challengeId: string): Observable<ActivitySession[]> {
    return new Observable(observer => {
      this.activitySessions$.subscribe(sessions => {
        const challengeSessions = sessions.filter(s => s.challengeId === challengeId);
        observer.next(challengeSessions);
      });
    });
  }

  // Calculate total challenge statistics
  getChallengeStats(): Observable<{totalChallenges: number, activeChallenges: number, completedChallenges: number, totalPoints: number}> {
    return new Observable(observer => {
      this.challenges$.subscribe(challenges => {
        this.userProgress$.subscribe(progress => {
          const progressValues = Object.values(progress);
          const stats = {
            totalChallenges: challenges.length,
            activeChallenges: progressValues.filter(p => !p.isCompleted).length,
            completedChallenges: progressValues.filter(p => p.isCompleted).length,
            totalPoints: progressValues.reduce((sum, p) => sum + p.earnedRewards.length * 100, 0)
          };
          observer.next(stats);
        });
      });
    });
  }

  // Utility methods
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Load mock data (in real app, this would come from API)
  private loadMockData(): void {
    const mockChallenges: Challenge[] = [
      {
        _id: 'challenge001',
        title: '30-Day Flexibility Flow',
        description: 'Transform your flexibility with our comprehensive 30-day program. Each day features carefully selected poses designed to gradually increase your range of motion, reduce stiffness, and improve overall mobility.',
        shortDescription: 'Daily flexibility-focused sequences to improve mobility and reduce stiffness.',
        type: 'yoga',
        category: 'beginner',
        duration: 30,
        estimatedTimePerDay: 20,
        difficulty: 'Easy',
        participants: 15847,
        completionRate: 68,
        rating: 4.8,
        goals: [
          {
            id: '1',
            title: 'Complete Daily Practice',
            description: 'Practice yoga for at least 20 minutes each day',
            targetValue: 20,
            unit: 'minutes',
            type: 'daily',
            isRequired: true
          }
        ],
        rewards: [
          {
            id: '1',
            title: 'Flexibility Novice',
            description: 'Complete your first week',
            badgeIcon: 'leaf',
            badgeColor: '#4CAF50',
            pointsValue: 100,
            unlocksAt: 25
          }
        ],
        requirements: ['Yoga mat', 'Comfortable clothing'],
        tips: ['Practice in the morning', 'Focus on breathing'],
        imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755012958/14-Day_Flexibility_J_twnllw.png',
        bannerUrl: '/assets/images/challenges/flexibility-banner.jpg',
        instructorName: 'Sarah Chen',
        instructorImage: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755051882/OIP_vavt1q.webp',
        prerequisites: ['Basic yoga knowledge helpful but not required'],
        equipment: ['Yoga mat', 'Yoga blocks (optional)', 'Strap (optional)'],
        benefits: [
          'Increased flexibility and range of motion',
          'Reduced muscle tension and stiffness',
          'Improved posture and alignment',
          'Better sleep quality',
          'Enhanced athletic performance'
        ],
        tags: ['flexibility', 'beginner', 'daily'],
        isPopular: true,
        isFeatured: true,
        isPremium: false,
        isActive: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-01')
      },
      {
        _id: 'challenge002',
        title: '21-Day Mindful Breathing',
        description: 'Master the art of conscious breathing through daily breathing exercises and mindfulness practices.',
        shortDescription: 'Learn breathing techniques for stress relief and mental clarity.',
        type: 'breathing',
        category: 'all-levels',
        duration: 21,
        estimatedTimePerDay: 15,
        difficulty: 'Medium',
        participants: 8432,
        completionRate: 72,
        rating: 4.6,
        goals: [
          {
            id: '1',
            title: 'Daily Breathing Practice',
            description: 'Complete a breathing exercise each day',
            targetValue: 1,
            unit: 'session',
            type: 'daily',
            isRequired: true
          }
        ],
        rewards: [
          {
            id: '1',
            title: 'Breath Master',
            description: 'Complete the breathing challenge',
            badgeIcon: 'refresh',
            badgeColor: '#2196F3',
            pointsValue: 200,
            unlocksAt: 100
          }
        ],
        requirements: ['Quiet space'],
        tips: ['Practice at the same time daily', 'Find a comfortable position'],
        imageUrl: '/assets/images/challenges/breathing.jpg',
        bannerUrl: '/assets/images/challenges/breathing-banner.jpg',
        instructorName: 'Dr. Michael Johnson',
        instructorImage: '/assets/images/instructors/michael-johnson.jpg',
        prerequisites: ['No experience required'],
        equipment: ['Comfortable seating'],
        benefits: [
          'Reduced stress and anxiety',
          'Improved focus and concentration',
          'Better sleep quality',
          'Enhanced emotional regulation',
          'Lower blood pressure'
        ],
        tags: ['breathing', 'mindfulness', 'stress-relief'],
        isPopular: true,
        isFeatured: false,
        isPremium: false,
        isActive: true,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-15')
      },
      {
        _id: 'challenge003',
        title: 'Meditation for Beginners',
        description: 'A gentle introduction to meditation with daily guided sessions to cultivate mindfulness and inner peace.',
        shortDescription: 'Daily guided meditations to develop mindfulness and relaxation.',
        type: 'meditation',
        category: 'beginner',
        duration: 14,
        estimatedTimePerDay: 10,
        difficulty: 'Easy',
        participants: 10234,
        completionRate: 80,
        rating: 4.9,
        goals: [
          {
            id: '1',
            title: 'Daily Meditation Practice',
            description: 'Meditate for at least 10 minutes each day',
            targetValue: 10,
            unit: 'minutes',
            type: 'daily',
            isRequired: true
          }
        ],
        rewards: [
          {
            id: '1',
            title: 'Mindful Beginner',
            description: 'Complete your first week of meditation',
            badgeIcon: 'heart',
            badgeColor: '#FF9800',
            pointsValue: 150,
            unlocksAt: 50
          }
        ],
        requirements: ['Quiet space', 'Comfortable seating'],
        tips: ['Start with guided sessions', 'Focus on your breath'],
        imageUrl: '/assets/images/challenges/meditation.jpg',
        bannerUrl: '/assets/images/challenges/meditation-banner.jpg',
        instructorName: 'Emily Tran',
        instructorImage: '/assets/images/instructors/emily-tran.jpg',
        prerequisites: ['No prior experience needed'],
        equipment: ['Cushion or chair'],
        benefits: [
          'Reduced stress and anxiety',
          'Improved emotional well-being',
          'Enhanced focus and clarity of thought',
          'Better sleep quality',
          'Increased self-awareness'
        ],
        tags: ['meditation', 'mindfulness', 'relaxation'],
        isPopular: true,
        isFeatured: true,
        isPremium: false,
        isActive: true,
        createdAt: new Date('2024-03-01')
      },
      {
        _id: 'challenge004',
        title: 'Yoga for Flexibility',
        description: 'A comprehensive program designed to improve flexibility through targeted yoga poses and stretches.',
        shortDescription: 'Daily yoga sessions to enhance flexibility and mobility.',
        type: 'yoga',
        category: 'intermediate',
        duration: 21,
        estimatedTimePerDay: 15,
        difficulty: 'Medium',
        participants: 5678,
        completionRate: 75,
        rating: 4.7,
        goals: [
          {
            id: '1',
            title: 'Daily Stretching Routine',
            description: 'Complete a 15-minute stretching routine each day',
            targetValue: 15,
            unit: 'minutes',
            type: 'daily',
            isRequired: true
          }
        ],
        rewards: [
          {
            id: '1',
            title: 'Flexibility Guru',
            description: 'Achieve a full split',
            badgeIcon: 'star',
            badgeColor: '#4CAF50',
            pointsValue: 300,
            unlocksAt: 100
          }
        ],
        requirements: ['Yoga mat', 'Comfortable clothing'],
        tips: ['Breathe deeply during stretches', 'Listen to your body'],
        imageUrl: '/assets/images/challenges/yoga.jpg',
        bannerUrl: '/assets/images/challenges/yoga-banner.jpg',
        instructorName: 'Sophia Lee',
        instructorImage: '/assets/images/instructors/sophia-lee.jpg',
        prerequisites: ['Basic yoga experience recommended'],
        equipment: ['Yoga blocks', 'Strap'],
        benefits: [
          'Increased flexibility and range of motion',
          'Improved posture and alignment',
          'Enhanced athletic performance',
          'Reduced risk of injury',
          'Greater mind-body connection'
        ],
        tags: ['yoga', 'flexibility', 'wellness'],
        isPopular: true,
        isFeatured: false,
        isPremium: false,
        isActive: true,
        createdAt: new Date('2024-04-01')
      }
    ];

    this.challengesSubject.next(mockChallenges);
  }
}
