import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export interface MeditationSession {
  _id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  duration: number; // in minutes
  type: 'guided' | 'timer';
  technique: 'breathwork' | 'body-scan' | 'mantra' | 'visualization' | 'walking' | 'loving-kindness' | 'mindfulness';
  category: 'relaxation' | 'sleep' | 'stress-relief' | 'focus' | 'healing' | 'energy' | 'anxiety' | 'confidence';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor?: string;
  imageUrl: string;
  audioUrl?: string;
  videoUrl?: string;
  isPremium: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  benefits: string[];
  instructions: string[];
  tags: string[];
  rating: number; // 1-5 stars
  totalRatings: number;
  backgroundColor?: string; // for card theming
}

export interface BackgroundSound {
  _id: string;
  name: string;
  description: string;
  audioUrl: string;
  icon: string;
  isPremium: boolean;
  category: 'nature' | 'ambient' | 'instrumental' | 'white-noise';
}

export interface MeditationTimer {
  _id: string;
  duration: number; // in minutes
  remainingTime: number; // in seconds
  isRunning: boolean;
  backgroundSound?: string; // sound ID
  intervalBells: boolean;
  bellInterval?: number; // in minutes
  startDate: Date;
  endDate?: Date;
  pausedAt?: Date;
}

export interface UserMeditationProgress {
  sessionId?: string; // for guided sessions
  timerDuration?: number; // for timer sessions
  completedAt: Date;
  duration: number; // actual time meditated in minutes
  type: 'guided' | 'timer';
  rating?: number; // 1-5 stars
  notes?: string;
}

export interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  favoriteTechnique: string;
  averageRating: number;
  lastSessionDate?: string | null;
  averageSessionLength: number;
  favoriteCategory: string;
  totalDays: number;
}

export interface DailyMeditationChallenge {
  _id: string;
  name: string;
  description: string;
  duration: number; // in days
  dailyMinutes: number;
  sessions: string[]; // session IDs for each day
  imageUrl: string;
  isPremium: boolean;
  benefits: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MeditationService {
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  private progressSubject = new BehaviorSubject<UserMeditationProgress[]>([]);
  public progress$ = this.progressSubject.asObservable();

  private currentTimerSubject = new BehaviorSubject<MeditationTimer | null>(null);
  public currentTimer$ = this.currentTimerSubject.asObservable();

  private statsSubject = new BehaviorSubject<MeditationStats>({
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyMinutes: 0,
    monthlyMinutes: 0,
    favoriteTechnique: '',
    averageRating: 0,
    lastSessionDate: null,
    averageSessionLength: 0,
    favoriteCategory: '',
    totalDays: 0
  });
  public stats$ = this.statsSubject.asObservable();

  // Mock meditation sessions
  private mockSessions: MeditationSession[] = [
    // Featured Sessions
    {
      _id: 'med001',
      title: '5-Min Morning Calm',
      shortDescription: 'Start your day with peaceful breathing and gentle awareness.',
      fullDescription: 'Begin each morning with this gentle 5-minute meditation focusing on breath awareness and setting positive intentions for the day ahead.',
      duration: 5,
      type: 'guided',
      technique: 'breathwork',
      category: 'energy',
      difficulty: 'Beginner',
      instructor: 'Sarah Chen',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067234/morning-calm-meditation_x8w9vz.jpg',
      audioUrl: 'https://example.com/morning-calm.mp3',
      isPremium: false,
      isFeatured: true,
      isPopular: true,
      benefits: [
        'Reduces morning anxiety',
        'Increases focus for the day',
        'Promotes positive mindset',
        'Energizes naturally'
      ],
      instructions: [
        'Find a comfortable seated position',
        'Close your eyes gently',
        'Begin with three deep breaths',
        'Follow the guided instructions',
        'Set an intention for your day'
      ],
      tags: ['morning', 'energy', 'beginner', 'quick'],
      rating: 4.8,
      totalRatings: 1247,
      backgroundColor: '#FFE4B5'
    },
    {
      _id: 'med002',
      title: 'Sleep Deep Tonight',
      shortDescription: 'Drift into peaceful sleep with this calming body scan meditation.',
      fullDescription: 'A soothing 15-minute body scan meditation designed to release tension and guide you into deep, restorative sleep.',
      duration: 15,
      type: 'guided',
      technique: 'body-scan',
      category: 'sleep',
      difficulty: 'Beginner',
      instructor: 'Michael Rivers',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067235/sleep-meditation_q4r7tw.jpg',
      audioUrl: 'https://example.com/sleep-deep.mp3',
      isPremium: false,
      isFeatured: true,
      isPopular: true,
      benefits: [
        'Improves sleep quality',
        'Reduces bedtime anxiety',
        'Releases physical tension',
        'Calms racing thoughts'
      ],
      instructions: [
        'Lie down comfortably in bed',
        'Close your eyes',
        'Focus on relaxing each body part',
        'Let go of the day\'s worries',
        'Allow sleep to come naturally'
      ],
      tags: ['sleep', 'bedtime', 'relaxation', 'body-scan'],
      rating: 4.9,
      totalRatings: 892,
      backgroundColor: '#E6E6FA'
    },
    {
      _id: 'med003',
      title: 'Boost Your Focus in 3 Min',
      shortDescription: 'Quick concentration booster for busy minds.',
      fullDescription: 'A powerful 3-minute meditation to sharpen focus and clear mental fog, perfect for before important tasks.',
      duration: 3,
      type: 'guided',
      technique: 'mindfulness',
      category: 'focus',
      difficulty: 'Beginner',
      instructor: 'Dr. Lisa Park',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067236/focus-meditation_n2m8kp.jpg',
      audioUrl: 'https://example.com/focus-boost.mp3',
      isPremium: false,
      isFeatured: true,
      benefits: [
        'Enhances concentration',
        'Clears mental fog',
        'Reduces distractions',
        'Improves productivity'
      ],
      instructions: [
        'Sit upright with good posture',
        'Focus on a single point or breath',
        'Notice when mind wanders',
        'Gently return attention to focus',
        'End feeling alert and clear'
      ],
      tags: ['focus', 'concentration', 'quick', 'productivity'],
      rating: 4.7,
      totalRatings: 634,
      backgroundColor: '#87CEEB'
    },
    {
      _id: 'med004',
      title: 'Stress Relief Breathing',
      shortDescription: 'Powerful breathing techniques to melt away stress and tension.',
      fullDescription: 'Learn effective pranayama techniques to activate your relaxation response and release accumulated stress.',
      duration: 8,
      type: 'guided',
      technique: 'breathwork',
      category: 'stress-relief',
      difficulty: 'Beginner',
      instructor: 'Priya Sharma',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067237/stress-relief-breathing_k5t9vx.jpg',
      audioUrl: 'https://example.com/stress-relief.mp3',
      isPremium: false,
      isFeatured: true,
      isPopular: true,
      benefits: [
        'Activates relaxation response',
        'Lowers cortisol levels',
        'Reduces anxiety',
        'Improves emotional regulation'
      ],
      instructions: [
        'Sit comfortably with straight spine',
        'Place one hand on chest, one on belly',
        'Breathe slowly and deeply',
        'Follow the guided breathing pattern',
        'Notice the calming effects'
      ],
      tags: ['stress-relief', 'breathing', 'anxiety', 'relaxation'],
      rating: 4.8,
      totalRatings: 1156,
      backgroundColor: '#98FB98'
    },

    // Relaxation Category
    {
      _id: 'med005',
      title: 'Progressive Muscle Relaxation',
      shortDescription: 'Systematic tension release for deep physical relaxation.',
      fullDescription: 'A comprehensive 20-minute progressive muscle relaxation session to release tension throughout your entire body.',
      duration: 20,
      type: 'guided',
      technique: 'body-scan',
      category: 'relaxation',
      difficulty: 'Beginner',
      instructor: 'James Wilson',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067238/muscle-relaxation_h7k2nx.jpg',
      audioUrl: 'https://example.com/muscle-relaxation.mp3',
      isPremium: true,
      benefits: [
        'Reduces muscle tension',
        'Improves body awareness',
        'Promotes deep relaxation',
        'Helps with chronic pain'
      ],
      instructions: [
        'Lie down in a quiet space',
        'Focus on each muscle group',
        'Tense then relax systematically',
        'Notice the contrast',
        'End in complete relaxation'
      ],
      tags: ['relaxation', 'muscle-tension', 'body-awareness', 'pain-relief'],
      rating: 4.6,
      totalRatings: 423,
      backgroundColor: '#F0F8FF'
    },

    // Sleep Category
    {
      _id: 'med006',
      title: 'Sleep Story: Forest Dreams',
      shortDescription: 'Drift off to sleep with a peaceful forest journey.',
      fullDescription: 'A calming 30-minute sleep story that takes you on a gentle walk through an enchanted forest.',
      duration: 30,
      type: 'guided',
      technique: 'visualization',
      category: 'sleep',
      difficulty: 'Beginner',
      instructor: 'Emma Stone',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067239/forest-dreams_p8q4rx.jpg',
      audioUrl: 'https://example.com/forest-dreams.mp3',
      isPremium: true,
      benefits: [
        'Promotes deep sleep',
        'Reduces bedtime anxiety',
        'Engages imagination peacefully',
        'Creates sleep associations'
      ],
      instructions: [
        'Get comfortable in bed',
        'Close your eyes',
        'Let the story guide your imagination',
        'Don\'t worry about staying awake',
        'Allow sleep to come naturally'
      ],
      tags: ['sleep-story', 'visualization', 'bedtime', 'nature'],
      rating: 4.9,
      totalRatings: 728,
      backgroundColor: '#2F4F4F'
    },

    // Focus Category
    {
      _id: 'med007',
      title: 'Laser Focus Meditation',
      shortDescription: 'Advanced concentration training for peak mental performance.',
      fullDescription: 'A challenging 25-minute meditation designed to develop unwavering concentration and mental clarity.',
      duration: 25,
      type: 'guided',
      technique: 'mindfulness',
      category: 'focus',
      difficulty: 'Advanced',
      instructor: 'Dr. Alan Martinez',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067240/laser-focus_w9e5hn.jpg',
      audioUrl: 'https://example.com/laser-focus.mp3',
      isPremium: true,
      benefits: [
        'Develops sustained attention',
        'Improves cognitive performance',
        'Reduces mind wandering',
        'Enhances mental discipline'
      ],
      instructions: [
        'Sit in stable meditation posture',
        'Choose a single focus object',
        'Maintain unwavering attention',
        'Notice subtle distractions',
        'Develop mental stamina'
      ],
      tags: ['focus', 'concentration', 'advanced', 'performance'],
      rating: 4.5,
      totalRatings: 289,
      backgroundColor: '#4169E1'
    },

    // Stress Relief Category
    {
      _id: 'med008',
      title: 'Anxiety Release Meditation',
      shortDescription: 'Gentle techniques to calm anxiety and racing thoughts.',
      fullDescription: 'A compassionate 12-minute meditation specifically designed to ease anxiety and create inner peace.',
      duration: 12,
      type: 'guided',
      technique: 'breathwork',
      category: 'anxiety',
      difficulty: 'Beginner',
      instructor: 'Dr. Rachel Green',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067241/anxiety-release_m3l7kv.jpg',
      audioUrl: 'https://example.com/anxiety-release.mp3',
      isPremium: false,
      isPopular: true,
      benefits: [
        'Reduces anxiety symptoms',
        'Calms nervous system',
        'Provides coping strategies',
        'Builds emotional resilience'
      ],
      instructions: [
        'Find a safe, comfortable space',
        'Focus on calming breath',
        'Use grounding techniques',
        'Practice self-compassion',
        'End feeling more peaceful'
      ],
      tags: ['anxiety', 'stress-relief', 'calming', 'emotional-health'],
      rating: 4.8,
      totalRatings: 956,
      backgroundColor: '#F5DEB3'
    },

    // Healing Category
    {
      _id: 'med009',
      title: 'Loving-Kindness Meditation',
      shortDescription: 'Cultivate compassion and emotional healing.',
      fullDescription: 'A heart-opening 18-minute loving-kindness meditation to develop compassion for yourself and others.',
      duration: 18,
      type: 'guided',
      technique: 'loving-kindness',
      category: 'healing',
      difficulty: 'Intermediate',
      instructor: 'Lama Tenzin',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067242/loving-kindness_n6v8zx.jpg',
      audioUrl: 'https://example.com/loving-kindness.mp3',
      isPremium: false,
      benefits: [
        'Increases self-compassion',
        'Improves relationships',
        'Reduces negative emotions',
        'Promotes emotional healing'
      ],
      instructions: [
        'Sit with an open heart',
        'Start with self-directed kindness',
        'Extend love to loved ones',
        'Include difficult people',
        'Embrace all beings with love'
      ],
      tags: ['loving-kindness', 'compassion', 'emotional-healing', 'heart-opening'],
      rating: 4.7,
      totalRatings: 512,
      backgroundColor: '#FFB6C1'
    },

    // Walking Meditation
    {
      _id: 'med010',
      title: 'Mindful Walking Practice',
      shortDescription: 'Meditation in motion for active mindfulness.',
      fullDescription: 'A 10-minute guided walking meditation to practice mindfulness while moving through space.',
      duration: 10,
      type: 'guided',
      technique: 'walking',
      category: 'energy',
      difficulty: 'Beginner',
      instructor: 'David Kim',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067243/walking-meditation_z9w4tn.jpg',
      audioUrl: 'https://example.com/walking-meditation.mp3',
      isPremium: false,
      benefits: [
        'Combines mindfulness with movement',
        'Grounds you in present moment',
        'Improves body awareness',
        'Perfect for active people'
      ],
      instructions: [
        'Find a quiet walking path',
        'Walk slower than usual',
        'Focus on each step',
        'Notice your surroundings',
        'Stay present with each movement'
      ],
      tags: ['walking', 'movement', 'grounding', 'active-meditation'],
      rating: 4.4,
      totalRatings: 387,
      backgroundColor: '#90EE90'
    }
  ];

  // Background sounds
  private mockBackgroundSounds: BackgroundSound[] = [
    {
      _id: 'sound001',
      name: 'Ocean Waves',
      description: 'Gentle waves lapping against the shore',
      audioUrl: 'https://example.com/ocean-waves.mp3',
      icon: 'water-outline',
      isPremium: false,
      category: 'nature'
    },
    {
      _id: 'sound002',
      name: 'Rainfall',
      description: 'Soft rain on leaves and earth',
      audioUrl: 'https://example.com/rainfall.mp3',
      icon: 'rainy-outline',
      isPremium: false,
      category: 'nature'
    },
    {
      _id: 'sound003',
      name: 'Forest Sounds',
      description: 'Birds chirping in a peaceful forest',
      audioUrl: 'https://example.com/forest.mp3',
      icon: 'leaf-outline',
      isPremium: false,
      category: 'nature'
    },
    {
      _id: 'sound004',
      name: 'Tibetan Bowls',
      description: 'Sacred singing bowls and chimes',
      audioUrl: 'https://example.com/tibetan-bowls.mp3',
      icon: 'radio-outline',
      isPremium: true,
      category: 'instrumental'
    },
    {
      _id: 'sound005',
      name: 'White Noise',
      description: 'Consistent background white noise',
      audioUrl: 'https://example.com/white-noise.mp3',
      icon: 'volume-medium-outline',
      isPremium: false,
      category: 'white-noise'
    },
    {
      _id: 'sound006',
      name: 'Crackling Fire',
      description: 'Warm fireplace crackling sounds',
      audioUrl: 'https://example.com/fire.mp3',
      icon: 'flame-outline',
      isPremium: true,
      category: 'ambient'
    }
  ];

  // Daily challenges
  private mockChallenges: DailyMeditationChallenge[] = [
    {
      _id: 'challenge001',
      name: '7-Day Mindfulness Journey',
      description: 'Build a daily meditation habit with guided mindfulness practices',
      duration: 7,
      dailyMinutes: 5,
      sessions: ['med001', 'med003', 'med008', 'med004', 'med009', 'med010', 'med002'],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067244/mindfulness-challenge_k8x2wv.jpg',
      isPremium: false,
      benefits: [
        'Establishes daily routine',
        'Reduces stress significantly',
        'Improves emotional regulation',
        'Builds mindfulness skills'
      ]
    },
    {
      _id: 'challenge002',
      name: '21-Day Stress Relief Program',
      description: 'Comprehensive stress management through daily meditation',
      duration: 21,
      dailyMinutes: 10,
      sessions: ['med004', 'med008', 'med005', 'med002'], // Repeating pattern
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067245/stress-relief-challenge_t4q9nx.jpg',
      isPremium: true,
      benefits: [
        'Significantly reduces stress',
        'Improves sleep quality',
        'Enhances emotional well-being',
        'Builds long-term resilience'
      ]
    }
  ];

  constructor() {
    // Load data from localStorage
    const savedFavorites = localStorage.getItem('meditation-favorites');
    if (savedFavorites) {
      this.favoritesSubject.next(JSON.parse(savedFavorites));
    }

    const savedProgress = localStorage.getItem('meditation-progress');
    if (savedProgress) {
      this.progressSubject.next(JSON.parse(savedProgress));
    }
  }

  // Get all meditation sessions
  getAllSessions(): Observable<MeditationSession[]> {
    return of(this.mockSessions).pipe(delay(300));
  }

  // Get featured meditations
  getFeaturedSessions(): Observable<MeditationSession[]> {
    const featured = this.mockSessions.filter(session => session.isFeatured);
    return of(featured).pipe(delay(200));
  }

  // Get popular meditations
  getPopularSessions(): Observable<MeditationSession[]> {
    const popular = this.mockSessions.filter(session => session.isPopular);
    return of(popular).pipe(delay(200));
  }

  // Get sessions by category
  getSessionsByCategory(category: string): Observable<MeditationSession[]> {
    const filtered = this.mockSessions.filter(session => session.category === category);
    return of(filtered).pipe(delay(200));
  }

  // Get sessions by technique
  getSessionsByTechnique(technique: string): Observable<MeditationSession[]> {
    const filtered = this.mockSessions.filter(session => session.technique === technique);
    return of(filtered).pipe(delay(200));
  }

  // Get sessions by duration range
  getSessionsByDuration(minDuration: number, maxDuration: number): Observable<MeditationSession[]> {
    const filtered = this.mockSessions.filter(session => 
      session.duration >= minDuration && session.duration <= maxDuration
    );
    return of(filtered).pipe(delay(200));
  }

  // Get session by ID
  getSessionById(id: string): Observable<MeditationSession | undefined> {
    const session = this.mockSessions.find(s => s._id === id);
    return of(session).pipe(delay(200));
  }

  // Search sessions
  searchSessions(query: string): Observable<MeditationSession[]> {
    const filtered = this.mockSessions.filter(session =>
      session.title.toLowerCase().includes(query.toLowerCase()) ||
      session.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
      session.category.toLowerCase().includes(query.toLowerCase()) ||
      session.technique.toLowerCase().includes(query.toLowerCase()) ||
      session.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    return of(filtered).pipe(delay(200));
  }

  // Background sounds
  getBackgroundSounds(): Observable<BackgroundSound[]> {
    return of(this.mockBackgroundSounds).pipe(delay(200));
  }

  getBackgroundSoundById(id: string): Observable<BackgroundSound | undefined> {
    const sound = this.mockBackgroundSounds.find(s => s._id === id);
    return of(sound).pipe(delay(200));
  }

  // Timer management
  getRelatedSessions(sessionId: string, category: string): Observable<MeditationSession[]> {
    return this.getAllSessions().pipe(
      map((sessions: MeditationSession[]) => 
        sessions
          .filter(s => s._id !== sessionId && s.category === category)
          .slice(0, 4)
      )
    );
  }

  startSession(sessionId: string, backgroundSoundId?: string): void {
    const sessionData = {
      sessionId,
      backgroundSoundId,
      startTime: new Date(),
      completed: false
    };
    
    // Store current session
    localStorage.setItem('currentMeditationSession', JSON.stringify(sessionData));
    
    // Update session count
    this.updateSessionStats();
  }

  private getCurrentStats(): MeditationStats {
    const stored = localStorage.getItem('meditationStats');
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      weeklyMinutes: 0,
      monthlyMinutes: 0,
      favoriteTechnique: '',
      averageRating: 0,
      lastSessionDate: null,
      averageSessionLength: 0,
      favoriteCategory: '',
      totalDays: 0
    };
  }

  private updateSessionStats(): void {
    const stats = this.getCurrentStats();
    stats.totalSessions += 1;
    
    // Check if today's session
    const today = new Date().toDateString();
    const lastSession = new Date(stats.lastSessionDate || 0).toDateString();
    
    if (today !== lastSession) {
      if (this.isConsecutiveDay(stats.lastSessionDate || null)) {
        stats.currentStreak += 1;
      } else {
        stats.currentStreak = 1;
      }
      stats.lastSessionDate = new Date().toISOString();
    }
    
    localStorage.setItem('meditationStats', JSON.stringify(stats));
    this.statsSubject.next(stats);
  }

  private isConsecutiveDay(lastSessionDate: string | null): boolean {
    if (!lastSessionDate) return false;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastDate = new Date(lastSessionDate);
    return lastDate.toDateString() === yesterday.toDateString();
  }

  // End of new methods
  startTimer(timerConfig: {
    duration: number;
    backgroundSound?: string;
    intervalBells?: boolean;
    startDate: Date;
  }): void {
    const timer: MeditationTimer = {
      _id: Date.now().toString(),
      duration: timerConfig.duration,
      remainingTime: timerConfig.duration * 60, // Convert to seconds
      isRunning: true,
      backgroundSound: timerConfig.backgroundSound,
      intervalBells: timerConfig.intervalBells || false,
      startDate: timerConfig.startDate,
      pausedAt: undefined
    };
    
    this.currentTimerSubject.next(timer);
    localStorage.setItem('current-meditation-timer', JSON.stringify(timer));
  }

  stopTimer(): void {
    const currentTimer = this.currentTimerSubject.value;
    if (currentTimer) {
      // Record progress
      const actualDuration = currentTimer.endDate 
        ? Math.floor((currentTimer.endDate.getTime() - currentTimer.startDate.getTime()) / (1000 * 60))
        : currentTimer.duration;
      
      this.recordProgress({
        timerDuration: currentTimer.duration,
        completedAt: new Date(),
        duration: actualDuration,
        type: 'timer'
      });
    }
    
    this.currentTimerSubject.next(null);
    localStorage.removeItem('current-meditation-timer');
  }

  getCurrentTimer(): Observable<MeditationTimer | null> {
    return this.currentTimer$;
  }

  // Favorites management
  toggleFavorite(sessionId: string): void {
    const currentFavorites = this.favoritesSubject.value;
    let updatedFavorites: string[];

    if (currentFavorites.includes(sessionId)) {
      updatedFavorites = currentFavorites.filter(id => id !== sessionId);
    } else {
      updatedFavorites = [...currentFavorites, sessionId];
    }

    this.favoritesSubject.next(updatedFavorites);
    localStorage.setItem('meditation-favorites', JSON.stringify(updatedFavorites));
  }

  isFavorite(sessionId: string): Observable<boolean> {
    return this.favorites$.pipe(
      map(favorites => favorites.includes(sessionId))
    );
  }

  getFavoriteSessions(): Observable<MeditationSession[]> {
    return this.favorites$.pipe(
      map(favoriteIds => 
        this.mockSessions.filter(session => favoriteIds.includes(session._id))
      )
    );
  }

  // Progress tracking
  recordProgress(progress: UserMeditationProgress): void {
    const currentProgress = this.progressSubject.value;
    const updatedProgress = [...currentProgress, progress];
    this.progressSubject.next(updatedProgress);
    localStorage.setItem('meditation-progress', JSON.stringify(updatedProgress));
  }

  getUserProgress(): Observable<UserMeditationProgress[]> {
    return this.progress$;
  }

  // Calculate meditation statistics
  getMeditationStats(): Observable<MeditationStats> {
    return this.stats$;
  }
  // Daily challenges
  getChallenges(): Observable<DailyMeditationChallenge[]> {
    return of(this.mockChallenges).pipe(delay(200));
  }

  getChallengeById(id: string): Observable<DailyMeditationChallenge | undefined> {
    const challenge = this.mockChallenges.find(c => c._id === id);
    return of(challenge).pipe(delay(200));
  }

  // Get filter options for UI
  getFilterOptions() {
    return {
      categories: [
        { value: 'relaxation', label: 'Relaxation', icon: 'leaf-outline' },
        { value: 'sleep', label: 'Sleep', icon: 'moon-outline' },
        { value: 'stress-relief', label: 'Stress Relief', icon: 'heart-outline' },
        { value: 'focus', label: 'Focus', icon: 'eye-outline' },
        { value: 'healing', label: 'Healing', icon: 'medical-outline' },
        { value: 'energy', label: 'Energy', icon: 'flash-outline' },
        { value: 'anxiety', label: 'Anxiety', icon: 'shield-outline' },
        { value: 'confidence', label: 'Confidence', icon: 'trophy-outline' }
      ],
      techniques: [
        { value: 'breathwork', label: 'Breathwork', icon: 'wind-outline' },
        { value: 'body-scan', label: 'Body Scan', icon: 'body-outline' },
        { value: 'mantra', label: 'Mantra', icon: 'chatbubble-outline' },
        { value: 'visualization', label: 'Visualization', icon: 'eye-outline' },
        { value: 'walking', label: 'Walking', icon: 'walk-outline' },
        { value: 'loving-kindness', label: 'Loving-Kindness', icon: 'heart-outline' },
        { value: 'mindfulness', label: 'Mindfulness', icon: 'flower-outline' }
      ],
      durations: [
        { value: 'short', label: 'Short (1-5 min)', min: 1, max: 5 },
        { value: 'medium', label: 'Medium (6-15 min)', min: 6, max: 15 },
        { value: 'long', label: 'Long (15+ min)', min: 15, max: 60 }
      ],
      difficulties: [
        { value: 'Beginner', label: 'Beginner' },
        { value: 'Intermediate', label: 'Intermediate' },
        { value: 'Advanced', label: 'Advanced' }
      ]
    };
  }
}
