import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export interface BreathingPattern {
  inhale: number; // seconds
  hold1: number; // seconds (after inhale)
  exhale: number; // seconds
  hold2: number; // seconds (after exhale)
}

export interface SessionSettings {
  techniqueId: string;
  duration: number;
  voiceGuidance: boolean;
  backgroundSound: string;
}

export interface BreathingTechnique {
  _id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  pattern: BreathingPattern;
  durationOptions: number[]; // in minutes
  animationType: 'circle' | 'waves' | 'square';
  category: 'relaxation' | 'energizing' | 'sleep' | 'focus' | 'cleansing';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  benefits: string[];
  instructions: string[];
  imageUrl: string;
  audioUrl?: string;
  voiceGuidanceUrl?: string;
  isPremium: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  tags: string[];
  rating: number; // 1-5 stars
  totalRatings: number;
  backgroundColor?: string;
  iconName?: string;
}

export interface BreathingSession {
  _id: string;
  techniqueId: string;
  duration: number; // in minutes
  remainingTime: number; // in seconds
  isRunning: boolean;
  isPaused: boolean;
  currentRound: number;
  totalRounds: number;
  currentPhase: 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'preparation' | 'completed';
  phaseRemainingTime: number; // seconds remaining in current phase
  startDate: Date;
  endDate?: Date;
  pausedAt?: Date;
  hasVoiceGuidance: boolean;
  backgroundSoundId?: string;
}

export interface UserBreathingProgress {
  techniqueId: string;
  completedAt: Date;
  duration: number; // actual time practiced in minutes
  rounds: number;
  rating?: number; // 1-5 stars
  notes?: string;
  benefits?: string[]; // benefits experienced
}

export interface BreathingStats {
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
  mostUsedTechniques: { techniqueId: string; count: number; name: string }[];
  weeklyProgress: { date: string; minutes: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class BreathingService {
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  private progressSubject = new BehaviorSubject<UserBreathingProgress[]>([]);
  public progress$ = this.progressSubject.asObservable();

  private currentSessionSubject = new BehaviorSubject<BreathingSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();

  private statsSubject = new BehaviorSubject<BreathingStats>({
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
    totalDays: 0,
    mostUsedTechniques: [],
    weeklyProgress: []
  });
  public stats$ = this.statsSubject.asObservable();

  // Mock breathing techniques data
  private mockTechniques: BreathingTechnique[] = [
    // Featured Techniques
    {
      _id: 'breath001',
      name: 'Box Breathing',
      shortDescription: 'Calm nerves in 2 minutes with 4-4-4-4 breathing.',
      fullDescription: 'Box breathing, also known as square breathing, is a powerful stress-relief technique used by Navy SEALs and athletes. The equal timing of inhale, hold, exhale, and hold creates a calming rhythm that activates your parasympathetic nervous system.',
      pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
      durationOptions: [2, 5, 10],
      animationType: 'square',
      category: 'relaxation',
      difficulty: 'Beginner',
      benefits: [
        'Calms the nervous system',
        'Reduces stress and anxiety',
        'Improves focus and concentration',
        'Lowers blood pressure',
        'Promotes mental clarity'
      ],
      instructions: [
        'Sit comfortably with your spine straight',
        'Exhale completely through your mouth',
        'Inhale through your nose for 4 seconds',
        'Hold your breath for 4 seconds',
        'Exhale through your mouth for 4 seconds',
        'Hold empty for 4 seconds',
        'Repeat the cycle'
      ],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067250/box-breathing_k9x2vz.jpg',
      audioUrl: 'https://example.com/box-breathing-sound.mp3',
      voiceGuidanceUrl: 'https://example.com/box-breathing-guidance.mp3',
      isPremium: false,
      isFeatured: true,
      isPopular: true,
      tags: ['stress-relief', 'focus', 'beginner', 'quick'],
      rating: 4.8,
      totalRatings: 2156,
      backgroundColor: '#E6F3FF',
      iconName: 'square-outline'
    },
    {
      _id: 'breath002',
      name: 'Alternate Nostril Breathing',
      shortDescription: 'Balances mind & body with ancient pranayama technique.',
      fullDescription: 'Nadi Shodhana, or alternate nostril breathing, is a traditional yoga pranayama that balances the left and right hemispheres of the brain, promoting harmony between body and mind.',
      pattern: { inhale: 4, hold1: 2, exhale: 4, hold2: 2 },
      durationOptions: [5, 10, 15],
      animationType: 'waves',
      category: 'focus',
      difficulty: 'Intermediate',
      benefits: [
        'Balances left and right brain hemispheres',
        'Improves concentration',
        'Reduces stress and anxiety',
        'Enhances respiratory function',
        'Promotes mental balance'
      ],
      instructions: [
        'Sit comfortably with spine erect',
        'Use your right thumb to close right nostril',
        'Inhale through left nostril for 4 counts',
        'Close left nostril with ring finger',
        'Release thumb and exhale through right nostril',
        'Inhale through right nostril',
        'Close right nostril and exhale through left',
        'This completes one round'
      ],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067251/alternate-nostril_h7k4nx.jpg',
      audioUrl: 'https://example.com/alternate-nostril-sound.mp3',
      voiceGuidanceUrl: 'https://example.com/alternate-nostril-guidance.mp3',
      isPremium: false,
      isFeatured: true,
      isPopular: true,
      tags: ['pranayama', 'balance', 'focus', 'traditional'],
      rating: 4.7,
      totalRatings: 1834,
      backgroundColor: '#F0F8E6',
      iconName: 'swap-horizontal-outline'
    },
    {
      _id: 'breath003',
      name: 'Bhramari (Humming Bee)',
      shortDescription: 'Soothes the mind with gentle humming vibrations.',
      fullDescription: 'Bhramari pranayama creates a humming sound like a bee, which creates vibrations that calm the mind and nervous system. This technique is excellent for meditation preparation.',
      pattern: { inhale: 4, hold1: 0, exhale: 8, hold2: 0 },
      durationOptions: [3, 5, 10],
      animationType: 'circle',
      category: 'relaxation',
      difficulty: 'Beginner',
      benefits: [
        'Calms the mind instantly',
        'Reduces stress and tension',
        'Improves concentration',
        'Prepares for meditation',
        'Soothes the nervous system'
      ],
      instructions: [
        'Sit comfortably with eyes closed',
        'Place thumbs in ears gently',
        'Place index fingers above eyebrows',
        'Place remaining fingers over closed eyes',
        'Inhale normally through nose',
        'Exhale while making a humming sound',
        'Feel the vibrations in your head',
        'Continue for several rounds'
      ],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067252/bhramari-breathing_p8q4rx.jpg',
      audioUrl: 'https://example.com/bhramari-sound.mp3',
      voiceGuidanceUrl: 'https://example.com/bhramari-guidance.mp3',
      isPremium: false,
      isFeatured: true,
      tags: ['humming', 'meditation', 'calming', 'pranayama'],
      rating: 4.6,
      totalRatings: 1456,
      backgroundColor: '#FFF8E1',
      iconName: 'musical-note-outline'
    },
    {
      _id: 'breath004',
      name: 'Kapalabhati (Skull Shining)',
      shortDescription: 'Energizing morning breath that awakens your vitality.',
      fullDescription: 'Kapalabhati is a powerful cleansing breath that energizes the body and clears the mind. The rapid, forceful exhalations followed by passive inhalations create heat and energy.',
      pattern: { inhale: 1, hold1: 0, exhale: 1, hold2: 0 }, // Rapid breathing
      durationOptions: [2, 5, 8],
      animationType: 'circle',
      category: 'energizing',
      difficulty: 'Advanced',
      benefits: [
        'Increases energy and vitality',
        'Cleanses respiratory system',
        'Improves concentration',
        'Strengthens abdominal muscles',
        'Awakens the mind'
      ],
      instructions: [
        'Sit with spine straight and shoulders relaxed',
        'Take a deep breath in through nose',
        'Exhale forcefully through nose by contracting abs',
        'Allow natural passive inhalation',
        'Continue rapid exhalations for 30 seconds',
        'Take three normal breaths between rounds',
        'Build up practice gradually'
      ],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067253/kapalabhati-breathing_w9e5hn.jpg',
      audioUrl: 'https://example.com/kapalabhati-sound.mp3',
      voiceGuidanceUrl: 'https://example.com/kapalabhati-guidance.mp3',
      isPremium: true,
      isFeatured: true,
      tags: ['energizing', 'cleansing', 'advanced', 'morning'],
      rating: 4.5,
      totalRatings: 892,
      backgroundColor: '#FFE8E8',
      iconName: 'flash-outline'
    },
    {
      _id: 'breath005',
      name: '4-7-8 Breathing',
      shortDescription: 'Improves sleep and calms anxiety in minutes.',
      fullDescription: 'The 4-7-8 breathing technique acts as a natural tranquilizer for the nervous system. Developed by Dr. Andrew Weil, this technique helps you fall asleep faster and reduces anxiety.',
      pattern: { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
      durationOptions: [2, 5, 10],
      animationType: 'circle',
      category: 'sleep',
      difficulty: 'Beginner',
      benefits: [
        'Promotes better sleep',
        'Reduces anxiety quickly',
        'Calms the nervous system',
        'Lowers heart rate',
        'Induces relaxation response'
      ],
      instructions: [
        'Sit comfortably or lie down',
        'Exhale completely through your mouth',
        'Close mouth and inhale through nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through mouth for 8 counts',
        'This is one cycle, repeat 3-4 times',
        'Practice regularly for best results'
      ],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067254/4-7-8-breathing_m3l7kv.jpg',
      audioUrl: 'https://example.com/4-7-8-sound.mp3',
      voiceGuidanceUrl: 'https://example.com/4-7-8-guidance.mp3',
      isPremium: false,
      isFeatured: true,
      isPopular: true,
      tags: ['sleep', 'anxiety', 'relaxation', 'bedtime'],
      rating: 4.9,
      totalRatings: 3247,
      backgroundColor: '#E8E5FF',
      iconName: 'moon-outline'
    },
    {
      _id: 'breath006',
      name: 'Deep Diaphragmatic Breathing',
      shortDescription: 'Foundation breath for stress relief and better health.',
      fullDescription: 'Deep diaphragmatic breathing, also called belly breathing, is the foundation of all breathwork. It activates the vagus nerve and promotes the relaxation response.',
      pattern: { inhale: 6, hold1: 2, exhale: 6, hold2: 2 },
      durationOptions: [3, 5, 10, 15],
      animationType: 'circle',
      category: 'relaxation',
      difficulty: 'Beginner',
      benefits: [
        'Reduces stress and anxiety',
        'Lowers blood pressure',
        'Improves oxygen efficiency',
        'Strengthens diaphragm',
        'Promotes relaxation'
      ],
      instructions: [
        'Lie down or sit comfortably',
        'Place one hand on chest, one on belly',
        'Breathe slowly through your nose',
        'Feel your belly rise while chest stays still',
        'Exhale slowly through mouth or nose',
        'Focus on belly falling',
        'Practice daily for best results'
      ],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067255/diaphragmatic-breathing_n6v8zx.jpg',
      audioUrl: 'https://example.com/diaphragmatic-sound.mp3',
      voiceGuidanceUrl: 'https://example.com/diaphragmatic-guidance.mp3',
      isPremium: false,
      isFeatured: true,
      isPopular: true,
      tags: ['foundation', 'stress-relief', 'health', 'basic'],
      rating: 4.7,
      totalRatings: 2845,
      backgroundColor: '#E8F5E8',
      iconName: 'heart-outline'
    },

    // Additional Techniques by Category
    {
      _id: 'breath007',
      name: 'Coherent Breathing',
      shortDescription: '5-5 breathing rhythm for heart-brain coherence.',
      fullDescription: 'Coherent breathing at 5 breaths per minute (5 seconds in, 5 seconds out) promotes heart rate variability and creates coherence between heart and brain.',
      pattern: { inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
      durationOptions: [5, 10, 15, 20],
      animationType: 'waves',
      category: 'focus',
      difficulty: 'Beginner',
      benefits: [
        'Improves heart rate variability',
        'Enhances emotional regulation',
        'Increases focus and clarity',
        'Balances autonomic nervous system'
      ],
      instructions: [
        'Sit comfortably with good posture',
        'Breathe in slowly for 5 seconds',
        'Breathe out slowly for 5 seconds',
        'Maintain smooth, even rhythm',
        'Focus on the heart area',
        'Continue for chosen duration'
      ],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067256/coherent-breathing_z9w4tn.jpg',
      isPremium: false,
      tags: ['coherence', 'heart', 'focus', 'rhythm'],
      rating: 4.6,
      totalRatings: 1234,
      backgroundColor: '#FFE4E1',
      iconName: 'pulse-outline'
    },
    {
      _id: 'breath008',
      name: 'Wim Hof Breathing',
      shortDescription: 'Powerful energizing breath for cold tolerance and vitality.',
      fullDescription: 'The Wim Hof breathing method combines deep breathing with breath retention to increase energy, reduce stress, and improve cold tolerance.',
      pattern: { inhale: 2, hold1: 0, exhale: 1, hold2: 0 }, // Rapid breathing followed by retention
      durationOptions: [5, 10, 15],
      animationType: 'circle',
      category: 'energizing',
      difficulty: 'Advanced',
      benefits: [
        'Increases energy levels',
        'Improves immune function',
        'Enhances cold tolerance',
        'Reduces inflammation',
        'Boosts mental resilience'
      ],
      instructions: [
        'Sit or lie down comfortably',
        'Take 30 deep breaths rapidly',
        'Exhale and hold breath as long as comfortable',
        'Take a deep breath and hold for 15 seconds',
        'This is one round, repeat 2-3 times',
        'Always practice safely'
      ],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067257/wim-hof-breathing_k8x2wv.jpg',
      isPremium: true,
      tags: ['energizing', 'advanced', 'immune', 'cold-therapy'],
      rating: 4.4,
      totalRatings: 756,
      backgroundColor: '#E0F2F1',
      iconName: 'snow-outline'
    },
    {
      _id: 'breath009',
      name: 'Triangle Breathing',
      shortDescription: 'Simple 3-part breathing for beginners.',
      fullDescription: 'Triangle breathing is a gentle introduction to breathwork with equal counts for inhale, hold, and exhale, creating a steady, calming rhythm.',
      pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 0 },
      durationOptions: [3, 5, 10],
      animationType: 'circle',
      category: 'relaxation',
      difficulty: 'Beginner',
      benefits: [
        'Simple to learn',
        'Promotes relaxation',
        'Improves breath awareness',
        'Good for beginners'
      ],
      instructions: [
        'Sit comfortably',
        'Inhale for 4 counts',
        'Hold for 4 counts',
        'Exhale for 4 counts',
        'Repeat the triangle pattern'
      ],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067258/triangle-breathing_t4q9nx.jpg',
      isPremium: false,
      tags: ['beginner', 'simple', 'relaxation', 'learning'],
      rating: 4.3,
      totalRatings: 945,
      backgroundColor: '#F3E5F5',
      iconName: 'triangle-outline'
    },
    {
      _id: 'breath010',
      name: 'Extended Exhale',
      shortDescription: 'Longer exhales activate the relaxation response.',
      fullDescription: 'Extended exhale breathing with a 1:2 ratio (inhale:exhale) activates the parasympathetic nervous system for deep relaxation.',
      pattern: { inhale: 4, hold1: 0, exhale: 8, hold2: 0 },
      durationOptions: [3, 5, 10],
      animationType: 'waves',
      category: 'sleep',
      difficulty: 'Beginner',
      benefits: [
        'Activates relaxation response',
        'Reduces anxiety',
        'Prepares for sleep',
        'Calms nervous system'
      ],
      instructions: [
        'Breathe in for 4 counts',
        'Breathe out slowly for 8 counts',
        'Keep exhale smooth and controlled',
        'Focus on releasing tension'
      ],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1755067259/extended-exhale_h4r6nx.jpg',
      isPremium: false,
      tags: ['relaxation', 'sleep', 'anxiety', 'simple'],
      rating: 4.5,
      totalRatings: 1567,
      backgroundColor: '#F0F4FF',
      iconName: 'arrow-down-circle-outline'
    }
  ];

  constructor() {
    // Load data from localStorage
    const savedFavorites = localStorage.getItem('breathing-favorites');
    if (savedFavorites) {
      this.favoritesSubject.next(JSON.parse(savedFavorites));
    }

    const savedProgress = localStorage.getItem('breathing-progress');
    if (savedProgress) {
      this.progressSubject.next(JSON.parse(savedProgress));
    }

    // Initialize stats
    this.updateStats();
  }

  // Get all breathing techniques
  getAllTechniques(): Observable<BreathingTechnique[]> {
    return of(this.mockTechniques).pipe(delay(300));
  }

  // Get featured techniques
  getFeaturedTechniques(): Observable<BreathingTechnique[]> {
    const featured = this.mockTechniques.filter(technique => technique.isFeatured);
    return of(featured).pipe(delay(200));
  }

  // Get popular techniques
  getPopularTechniques(): Observable<BreathingTechnique[]> {
    const popular = this.mockTechniques.filter(technique => technique.isPopular);
    return of(popular).pipe(delay(200));
  }

  // Get techniques by category
  getTechniquesByCategory(category: string): Observable<BreathingTechnique[]> {
    const filtered = this.mockTechniques.filter(technique => technique.category === category);
    return of(filtered).pipe(delay(200));
  }

  // Get technique by ID
  getTechniqueById(id: string): Observable<BreathingTechnique | undefined> {
    const technique = this.mockTechniques.find(t => t._id === id);
    return of(technique).pipe(delay(200));
  }

  // Search techniques
  searchTechniques(query: string): Observable<BreathingTechnique[]> {
    const filtered = this.mockTechniques.filter(technique =>
      technique.name.toLowerCase().includes(query.toLowerCase()) ||
      technique.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
      technique.category.toLowerCase().includes(query.toLowerCase()) ||
      technique.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    return of(filtered).pipe(delay(200));
  }

  // Get related techniques
  getRelatedTechniques(techniqueId: string, category: string): Observable<BreathingTechnique[]> {
    return this.getAllTechniques().pipe(
      map((techniques: BreathingTechnique[]) => 
        techniques
          .filter(t => t._id !== techniqueId && t.category === category)
          .slice(0, 4)
      )
    );
  }

  // Session management
  startSession(techniqueId: string, duration: number, hasVoiceGuidance: boolean = false): Observable<BreathingSession> {
    const technique = this.mockTechniques.find(t => t._id === techniqueId);
    if (!technique) {
      throw new Error('Technique not found');
    }

    // Calculate total rounds based on pattern and duration
    const cycleTime = technique.pattern.inhale + technique.pattern.hold1 + 
                     technique.pattern.exhale + technique.pattern.hold2;
    const totalRounds = Math.floor((duration * 60) / cycleTime);

    const session: BreathingSession = {
      _id: Date.now().toString(),
      techniqueId,
      duration,
      remainingTime: duration * 60,
      isRunning: false,
      isPaused: false,
      currentRound: 0,
      totalRounds,
      currentPhase: 'preparation',
      phaseRemainingTime: 5, // 5 second preparation
      startDate: new Date(),
      hasVoiceGuidance,
    };

    this.currentSessionSubject.next(session);
    localStorage.setItem('current-breathing-session', JSON.stringify(session));
    
    return of(session);
  }
saveSessionData(session: { techniqueId: string; duration: number; completedAt: Date; cyclesCompleted: number; totalCycles: number; }): void {
  localStorage.setItem('current-breathing-session', JSON.stringify(session));
}
  updateSession(session: BreathingSession): void {
    this.currentSessionSubject.next(session);
    
  }

  endSession(): void {
    const currentSession = this.currentSessionSubject.value;
    if (currentSession) {
      // Record progress
      const actualDuration = currentSession.endDate 
        ? Math.floor((currentSession.endDate.getTime() - currentSession.startDate.getTime()) / (1000 * 60))
        : currentSession.duration;
      
      this.recordProgress({
        techniqueId: currentSession.techniqueId,
        completedAt: new Date(),
        duration: actualDuration,
        rounds: currentSession.currentRound
      });
    }
    
    this.currentSessionSubject.next(null);
    localStorage.removeItem('current-breathing-session');
  }

  getCurrentSession(): Observable<BreathingSession | null> {
    return this.currentSession$;
  }

  // Favorites management
  toggleFavorite(techniqueId: string): void {
    const currentFavorites = this.favoritesSubject.value;
    let updatedFavorites: string[];

    if (currentFavorites.includes(techniqueId)) {
      updatedFavorites = currentFavorites.filter(id => id !== techniqueId);
    } else {
      updatedFavorites = [...currentFavorites, techniqueId];
    }

    this.favoritesSubject.next(updatedFavorites);
    localStorage.setItem('breathing-favorites', JSON.stringify(updatedFavorites));
  }

  isFavorite(techniqueId: string): Observable<boolean> {
    return this.favorites$.pipe(
      map(favorites => favorites.includes(techniqueId))
    );
  }

  getFavoriteTechniques(): Observable<BreathingTechnique[]> {
    return this.favorites$.pipe(
      map(favoriteIds => 
        this.mockTechniques.filter(technique => favoriteIds.includes(technique._id))
      )
    );
  }

  // Progress tracking
  recordProgress(progress: UserBreathingProgress): void {
    const currentProgress = this.progressSubject.value;
    const updatedProgress = [...currentProgress, progress];
    this.progressSubject.next(updatedProgress);
    localStorage.setItem('breathing-progress', JSON.stringify(updatedProgress));
    this.updateStats();
  }

  getUserProgress(): Observable<UserBreathingProgress[]> {
    return this.progress$;
  }

  // Statistics
  getBreathingStats(): Observable<BreathingStats> {
    return this.stats$;
  }

  private updateStats(): void {
    const progress = this.progressSubject.value;
    const stats = this.calculateStats(progress);
    this.statsSubject.next(stats);
    localStorage.setItem('breathing-stats', JSON.stringify(stats));
  }

  private calculateStats(progress: UserBreathingProgress[]): BreathingStats {
    if (progress.length === 0) {
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
        totalDays: 0,
        mostUsedTechniques: [],
        weeklyProgress: []
      };
    }

    const totalSessions = progress.length;
    const totalMinutes = progress.reduce((sum, p) => sum + p.duration, 0);
    const lastSessionDate = progress[progress.length - 1]?.completedAt.toISOString() || null;
    const averageSessionLength = totalMinutes / totalSessions;

    // Calculate streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(progress);

    // Calculate weekly and monthly minutes
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const weeklyMinutes = progress
      .filter(p => new Date(p.completedAt) >= oneWeekAgo)
      .reduce((sum, p) => sum + p.duration, 0);

    const monthlyMinutes = progress
      .filter(p => new Date(p.completedAt) >= oneMonthAgo)
      .reduce((sum, p) => sum + p.duration, 0);

    // Find favorite technique
    const techniqueCount = progress.reduce((acc, p) => {
      acc[p.techniqueId] = (acc[p.techniqueId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteTechniqueId = Object.keys(techniqueCount).reduce((a, b) => 
      techniqueCount[a] > techniqueCount[b] ? a : b, '');
    
    const favoriteTechnique = this.mockTechniques.find(t => t._id === favoriteTechniqueId)?.name || '';

    // Most used techniques
    const mostUsedTechniques = Object.entries(techniqueCount)
      .map(([techniqueId, count]) => ({
        techniqueId,
        count,
        name: this.mockTechniques.find(t => t._id === techniqueId)?.name || ''
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Average rating
    const ratingsProgress = progress.filter(p => p.rating);
    const averageRating = ratingsProgress.length > 0 
      ? ratingsProgress.reduce((sum, p) => sum + (p.rating || 0), 0) / ratingsProgress.length
      : 0;

    // Favorite category
    const categoryCount = progress.reduce((acc, p) => {
      const technique = this.mockTechniques.find(t => t._id === p.techniqueId);
      if (technique) {
        acc[technique.category] = (acc[technique.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const favoriteCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b, '');

    // Unique days practiced
    const uniqueDays = new Set(progress.map(p => 
      new Date(p.completedAt).toDateString()
    )).size;

    // Weekly progress for chart
    const weeklyProgress = this.calculateWeeklyProgress(progress);

    return {
      totalSessions,
      totalMinutes,
      currentStreak,
      longestStreak,
      weeklyMinutes,
      monthlyMinutes,
      favoriteTechnique,
      averageRating,
      lastSessionDate,
      averageSessionLength,
      favoriteCategory,
      totalDays: uniqueDays,
      mostUsedTechniques,
      weeklyProgress
    };
  }

  private calculateStreaks(progress: UserBreathingProgress[]): { currentStreak: number; longestStreak: number } {
    if (progress.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Group sessions by date
    const sessionsByDate = progress.reduce((acc, session) => {
      const date = new Date(session.completedAt).toDateString();
      acc[date] = true;
      return acc;
    }, {} as Record<string, boolean>);

    const dates = Object.keys(sessionsByDate).sort();
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Check if today or yesterday has a session for current streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    
    if (sessionsByDate[today] || sessionsByDate[yesterday]) {
      currentStreak = 1;
      
      // Count backwards from latest date
      for (let i = dates.length - 2; i >= 0; i--) {
        const currentDate = new Date(dates[i + 1]);
        const previousDate = new Date(dates[i]);
        const dayDifference = Math.floor((currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000));
        
        if (dayDifference === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const previousDate = new Date(dates[i - 1]);
      const dayDifference = Math.floor((currentDate.getTime() - previousDate.getTime()) / (24 * 60 * 60 * 1000));
      
      if (dayDifference === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  private calculateWeeklyProgress(progress: UserBreathingProgress[]): { date: string; minutes: number }[] {
    const weeklyData: { date: string; minutes: number }[] = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toDateString();
      
      const dayMinutes = progress
        .filter(p => new Date(p.completedAt).toDateString() === dateString)
        .reduce((sum, p) => sum + p.duration, 0);
      
      weeklyData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: dayMinutes
      });
    }
    
    return weeklyData;
  }

  // Get filter options for UI
  getFilterOptions() {
    return {
      categories: [
        { value: 'relaxation', label: 'Relaxation', icon: 'leaf-outline', emoji: '🧘' },
        { value: 'energizing', label: 'Energizing', icon: 'flash-outline', emoji: '⚡' },
        { value: 'sleep', label: 'Sleep Support', icon: 'moon-outline', emoji: '🌙' },
        { value: 'focus', label: 'Focus', icon: 'eye-outline', emoji: '🎯' },
        { value: 'cleansing', label: 'Cleansing', icon: 'refresh-outline', emoji: '🌬' }
      ],
      difficulties: [
        { value: 'Beginner', label: 'Beginner' },
        { value: 'Intermediate', label: 'Intermediate' },
        { value: 'Advanced', label: 'Advanced' }
      ],
      durations: [
        { value: 'short', label: 'Quick (1-3 min)', min: 1, max: 3 },
        { value: 'medium', label: 'Medium (4-10 min)', min: 4, max: 10 },
        { value: 'long', label: 'Long (10+ min)', min: 10, max: 20 }
      ]
    };
  }

  // Quick start technique (for widget)
  getQuickStartTechnique(): Observable<BreathingTechnique> {
    // Return Box Breathing as the default quick start
    const quickStart = this.mockTechniques.find(t => t._id === 'breath001')!;
    return of(quickStart).pipe(delay(100));
  }
}
