import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export interface SequencePose {
  poseId: string;
  duration: number; // in seconds
  transitionTime?: number; // time to transition to next pose
}

export interface YogaSequence {
  _id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  totalTime: number; // in minutes
  poses: SequencePose[];
  goal: string;
  type: 'predefined' | 'custom' | 'challenge';
  category: 'goal-based' | 'time-based' | 'occasion-based' | 'challenge';
  createdBy: string; // 'system' or userId
  imageUrl: string;
  isPremium?: boolean;
  isCompleted?: boolean;
  completedCount?: number;
  tags: string[];
  benefits: string[];
  instructions?: string;
}

export interface Challenge {
  _id: string;
  name: string;
  description: string;
  duration: number; // in days
  sequences: string[]; // sequence IDs
  imageUrl: string;
  isPremium?: boolean;
  currentDay?: number;
  isCompleted?: boolean;
  startDate?: Date;
}

export interface UserProgress {
  sequenceId: string;
  completedAt: Date;
  duration: number; // actual time taken
  rating?: number; // 1-5 stars
}

export interface SequenceFilters {
  difficulty?: string;
  category?: string;
  type?: string;
  duration?: string; // 'short', 'medium', 'long'
  goal?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SequencesService {
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  private progressSubject = new BehaviorSubject<UserProgress[]>([]);
  public progress$ = this.progressSubject.asObservable();

  // Mock predefined sequences
  private mockSequences: YogaSequence[] = [
    // Goal-based sequences
    {
      _id: 'seq001',
      name: 'Weight Loss Power Flow',
      description: 'Dynamic sequence designed to boost metabolism and burn calories through flowing movements.',
      difficulty: 'Intermediate',
      totalTime: 25,
      poses: [
        { poseId: 'pose002', duration: 30 }, // Mountain Pose
        { poseId: 'pose004', duration: 60 }, // Warrior I
        { poseId: 'pose001', duration: 45 }, // Downward Dog
        { poseId: 'pose006', duration: 30 }, // Cobra
        { poseId: 'pose003', duration: 60 }, // Child's Pose
        { poseId: 'pose005', duration: 45 }, // Tree Pose
        { poseId: 'pose001', duration: 45 }, // Downward Dog
        { poseId: 'pose008', duration: 90 }, // Seated Forward Fold
      ],
      goal: 'Weight loss and metabolism boost',
      type: 'predefined',
      category: 'goal-based',
      createdBy: 'system',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754964414/weightLossPower_iwsccr.png',
      isPremium: false,
      tags: ['weight loss', 'cardio', 'strength', 'flow'],
      benefits: [
        'Burns calories effectively',
        'Builds lean muscle',
        'Improves cardiovascular health',
        'Boosts metabolism'
      ],
      instructions: 'Flow smoothly between poses, maintaining steady breath. Hold each pose for the specified duration.'
    },
    {
      _id: 'seq002',
      name: 'Stress Relief Evening Routine',
      description: 'Gentle, calming sequence perfect for unwinding after a stressful day.',
      difficulty: 'Beginner',
      totalTime: 15,
      poses: [
        { poseId: 'pose003', duration: 90 }, // Child's Pose
        { poseId: 'pose008', duration: 120 }, // Seated Forward Fold
        { poseId: 'pose001', duration: 60 }, // Downward Dog
        { poseId: 'pose007', duration: 180 }, // Pigeon Pose
        { poseId: 'pose003', duration: 120 }, // Child's Pose
      ],
      goal: 'Stress relief and relaxation',
      type: 'predefined',
      category: 'goal-based',
      createdBy: 'system',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754964551/stressReliefEveningRoutine_qc3h23.png',
      isPremium: false,
      tags: ['stress relief', 'relaxation', 'evening', 'gentle'],
      benefits: [
        'Reduces cortisol levels',
        'Calms nervous system',
        'Improves sleep quality',
        'Releases muscle tension'
      ],
      instructions: 'Move slowly and breathe deeply. Focus on releasing tension with each exhale.'
    },
    {
      _id: 'seq003',
      name: 'Flexibility Booster',
      description: 'Deep stretching sequence to improve overall flexibility and range of motion.',
      difficulty: 'Intermediate',
      totalTime: 30,
      poses: [
        { poseId: 'pose002', duration: 45 }, // Mountain Pose
        { poseId: 'pose008', duration: 120 }, // Seated Forward Fold
        { poseId: 'pose007', duration: 180 }, // Pigeon Pose (each side)
        { poseId: 'pose001', duration: 90 }, // Downward Dog
        { poseId: 'pose006', duration: 60 }, // Cobra
        { poseId: 'pose003', duration: 90 }, // Child's Pose
      ],
      goal: 'Improve flexibility and mobility',
      type: 'predefined',
      category: 'goal-based',
      createdBy: 'system',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754964873/flexibility_booster_ot23db.png',
      isPremium: false,
      tags: ['flexibility', 'stretching', 'mobility', 'deep stretch'],
      benefits: [
        'Increases range of motion',
        'Improves joint mobility',
        'Reduces muscle stiffness',
        'Prevents injury'
      ]
    },
    {
      _id: 'seq004',
      name: 'Core Strength Builder',
      description: 'Challenging sequence focused on building core strength and stability.',
      difficulty: 'Advanced',
      totalTime: 20,
      poses: [
        { poseId: 'pose002', duration: 30 }, // Mountain Pose
        { poseId: 'pose004', duration: 60 }, // Warrior I
        { poseId: 'pose005', duration: 45 }, // Tree Pose
        { poseId: 'pose001', duration: 60 }, // Downward Dog
        { poseId: 'pose006', duration: 45 }, // Cobra
        { poseId: 'pose003', duration: 60 }, // Child's Pose
      ],
      goal: 'Build core strength and stability',
      type: 'predefined',
      category: 'goal-based',
      createdBy: 'system',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754965322/coreStrength_builder_iwc7uk.png',
      isPremium: true,
      tags: ['core strength', 'stability', 'challenging', 'advanced'],
      benefits: [
        'Strengthens core muscles',
        'Improves posture',
        'Enhances balance',
        'Supports spine health'
      ]
    },

    // Time-based sequences
    {
      _id: 'seq005',
      name: '5-Minute Quick Energy',
      description: 'Quick energizing sequence perfect for busy mornings or midday breaks.',
      difficulty: 'Beginner',
      totalTime: 5,
      poses: [
        { poseId: 'pose002', duration: 30 }, // Mountain Pose
        { poseId: 'pose001', duration: 60 }, // Downward Dog
        { poseId: 'pose004', duration: 45 }, // Warrior I
        { poseId: 'pose003', duration: 45 }, // Child's Pose
      ],
      goal: 'Quick energy boost',
      type: 'predefined',
      category: 'time-based',
      createdBy: 'system',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754965596/fiveminutequickyoga_b1ldcf.png',
      isPremium: false,
      tags: ['quick', 'energy', 'morning', 'short'],
      benefits: [
        'Increases alertness',
        'Boosts circulation',
        'Energizes body and mind',
        'Perfect for busy schedules'
      ]
    },
    {
      _id: 'seq006',
      name: '15-Minute Daily Stretch',
      description: 'Perfect daily routine to maintain flexibility and prevent stiffness.',
      difficulty: 'Beginner',
      totalTime: 15,
      poses: [
        { poseId: 'pose002', duration: 30 }, // Mountain Pose
        { poseId: 'pose008', duration: 90 }, // Seated Forward Fold
        { poseId: 'pose001', duration: 60 }, // Downward Dog
        { poseId: 'pose006', duration: 45 }, // Cobra
        { poseId: 'pose005', duration: 60 }, // Tree Pose
        { poseId: 'pose003', duration: 75 }, // Child's Pose
      ],
      goal: 'Daily maintenance and flexibility',
      type: 'predefined',
      category: 'time-based',
      createdBy: 'system',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754969166/15MinutesDailyYoga_n0lbhi.png',
      isPremium: false,
      tags: ['daily', 'stretch', 'maintenance', 'routine'],
      benefits: [
        'Maintains flexibility',
        'Prevents stiffness',
        'Improves posture',
        'Easy to follow'
      ]
    },

    // Occasion-based sequences
    {
      _id: 'seq007',
      name: 'Morning Wake-up Flow',
      description: 'Energizing morning sequence to start your day with vitality and focus.',
      difficulty: 'Beginner',
      totalTime: 12,
      poses: [
        { poseId: 'pose002', duration: 45 }, // Mountain Pose
        { poseId: 'pose001', duration: 60 }, // Downward Dog
        { poseId: 'pose004', duration: 45 }, // Warrior I
        { poseId: 'pose006', duration: 30 }, // Cobra
        { poseId: 'pose003', duration: 60 }, // Child's Pose
      ],
      goal: 'Morning energy and focus',
      type: 'predefined',
      category: 'occasion-based',
      createdBy: 'system',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754969392/morningWakeUpflow_isk2ip.png',
      isPremium: false,
      tags: ['morning', 'energy', 'wake-up', 'focus'],
      benefits: [
        'Awakens the body',
        'Improves mental clarity',
        'Sets positive tone for day',
        'Increases energy levels'
      ]
    },
    {
      _id: 'seq008',
      name: 'Bedtime Relaxation',
      description: 'Gentle, calming sequence to prepare your body and mind for restful sleep.',
      difficulty: 'Beginner',
      totalTime: 10,
      poses: [
        { poseId: 'pose003', duration: 90 }, // Child's Pose
        { poseId: 'pose008', duration: 120 }, // Seated Forward Fold
        { poseId: 'pose007', duration: 90 }, // Pigeon Pose
        { poseId: 'pose003', duration: 120 }, // Child's Pose
      ],
      goal: 'Better sleep and relaxation',
      type: 'predefined',
      category: 'occasion-based',
      createdBy: 'system',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754969613/bedTimeRelaxation_cy9yxo.png',
      isPremium: false,
      tags: ['bedtime', 'sleep', 'relaxation', 'evening'],
      benefits: [
        'Promotes better sleep',
        'Calms the mind',
        'Releases daily tension',
        'Prepares for rest'
      ]
    }
  ];

  // Mock challenges
  private mockChallenges: Challenge[] = [
    {
      _id: 'challenge001',
      name: '21-Day Beginner Journey',
      description: 'Perfect introduction to yoga with progressive daily sequences building strength, flexibility, and confidence.',
      duration: 21,
      sequences: ['seq005', 'seq006', 'seq007', 'seq002'],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754926633/21-day-challenge_wvh8xp.jpg',
      isPremium: false
    },
    {
      _id: 'challenge002',
      name: '7-Day Stress Relief',
      description: 'Week-long journey to reduce stress and find inner peace through gentle yoga practices.',
      duration: 7,
      sequences: ['seq002', 'seq008', 'seq006'],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754926634/stress-relief-challenge_mxr2kv.jpg',
      isPremium: false
    },
    {
      _id: 'challenge003',
      name: '14-Day Flexibility Journey',
      description: 'Transform your flexibility with targeted stretching sequences designed to increase range of motion.',
      duration: 14,
      sequences: ['seq003', 'seq006', 'seq007'],
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754926635/flexibility-challenge_qw9erv.jpg',
      isPremium: true
    }
  ];

  constructor() {
    // Load favorites and progress from localStorage
    const savedFavorites = localStorage.getItem('sequence-favorites');
    if (savedFavorites) {
      this.favoritesSubject.next(JSON.parse(savedFavorites));
    }

    const savedProgress = localStorage.getItem('sequence-progress');
    if (savedProgress) {
      this.progressSubject.next(JSON.parse(savedProgress));
    }
  }

  // Get all sequences
  getAllSequences(): Observable<YogaSequence[]> {
    return of(this.mockSequences).pipe(delay(300));
  }

  // Get sequence by ID
  getSequenceById(id: string): Observable<YogaSequence | undefined> {
    const sequence = this.mockSequences.find(s => s._id === id);
    return of(sequence).pipe(delay(200));
  }

  // Get challenges
  getAllChallenges(): Observable<Challenge[]> {
    return of(this.mockChallenges).pipe(delay(200));
  }

  // Get challenge by ID
  getChallengeById(id: string): Observable<Challenge | undefined> {
    const challenge = this.mockChallenges.find(c => c._id === id);
    return of(challenge).pipe(delay(200));
  }

  // Filter sequences
  filterSequences(filters: SequenceFilters): Observable<YogaSequence[]> {
    let filtered = [...this.mockSequences];

    if (filters.difficulty) {
      filtered = filtered.filter(seq => seq.difficulty === filters.difficulty);
    }

    if (filters.category) {
      filtered = filtered.filter(seq => seq.category === filters.category);
    }

    if (filters.type) {
      filtered = filtered.filter(seq => seq.type === filters.type);
    }

    if (filters.duration) {
      filtered = filtered.filter(seq => {
        switch (filters.duration) {
          case 'short': return seq.totalTime <= 10;
          case 'medium': return seq.totalTime > 10 && seq.totalTime <= 25;
          case 'long': return seq.totalTime > 25;
          default: return true;
        }
      });
    }

    if (filters.goal) {
      filtered = filtered.filter(seq => 
        seq.goal.toLowerCase().includes(filters.goal!.toLowerCase()) ||
        seq.tags.some(tag => tag.toLowerCase().includes(filters.goal!.toLowerCase()))
      );
    }

    return of(filtered).pipe(delay(200));
  }

  // Search sequences
  searchSequences(query: string): Observable<YogaSequence[]> {
    const filtered = this.mockSequences.filter(seq =>
      seq.name.toLowerCase().includes(query.toLowerCase()) ||
      seq.description.toLowerCase().includes(query.toLowerCase()) ||
      seq.goal.toLowerCase().includes(query.toLowerCase()) ||
      seq.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    return of(filtered).pipe(delay(200));
  }

  // Get sequences by category
  getSequencesByCategory(category: string): Observable<YogaSequence[]> {
    const filtered = this.mockSequences.filter(seq => seq.category === category);
    return of(filtered).pipe(delay(200));
  }

  // Get favorite sequences
  getFavoriteSequences(): Observable<YogaSequence[]> {
    return this.favorites$.pipe(
      map(favoriteIds => 
        this.mockSequences.filter(seq => favoriteIds.includes(seq._id))
      )
    );
  }

  // Toggle favorite
  toggleFavorite(sequenceId: string): void {
    const currentFavorites = this.favoritesSubject.value;
    let updatedFavorites: string[];

    if (currentFavorites.includes(sequenceId)) {
      updatedFavorites = currentFavorites.filter(id => id !== sequenceId);
    } else {
      updatedFavorites = [...currentFavorites, sequenceId];
    }

    this.favoritesSubject.next(updatedFavorites);
    localStorage.setItem('sequence-favorites', JSON.stringify(updatedFavorites));
  }

  // Check if sequence is favorite
  isFavorite(sequenceId: string): Observable<boolean> {
    return this.favorites$.pipe(
      map(favorites => favorites.includes(sequenceId))
    );
  }

  // Complete sequence
  completeSequence(sequenceId: string, duration: number, rating?: number): void {
    const currentProgress = this.progressSubject.value;
    const newProgress: UserProgress = {
      sequenceId,
      completedAt: new Date(),
      duration,
      rating
    };

    const updatedProgress = [...currentProgress, newProgress];
    this.progressSubject.next(updatedProgress);
    localStorage.setItem('sequence-progress', JSON.stringify(updatedProgress));
  }

  // Get user progress
  getUserProgress(): Observable<UserProgress[]> {
    return this.progress$;
  }

  // Get completed sequences count
  getCompletedCount(sequenceId: string): Observable<number> {
    return this.progress$.pipe(
      map(progress => progress.filter(p => p.sequenceId === sequenceId).length)
    );
  }

  // Create custom sequence
  createCustomSequence(sequence: Omit<YogaSequence, '_id'>): Observable<YogaSequence> {
    const newSequence: YogaSequence = {
      ...sequence,
      _id: 'custom_' + Date.now(),
      type: 'custom',
      createdBy: 'user' // In real app, would be actual user ID
    };

    this.mockSequences.push(newSequence);
    
    // In real app, save to localStorage or backend
    const customSequences = JSON.parse(localStorage.getItem('custom-sequences') || '[]');
    customSequences.push(newSequence);
    localStorage.setItem('custom-sequences', JSON.stringify(customSequences));

    return of(newSequence).pipe(delay(300));
  }

  // Get custom sequences
  getCustomSequences(): Observable<YogaSequence[]> {
    const customSequences = JSON.parse(localStorage.getItem('custom-sequences') || '[]');
    return of(customSequences).pipe(delay(200));
  }

  // Delete custom sequence
  deleteCustomSequence(sequenceId: string): Observable<boolean> {
    const customSequences = JSON.parse(localStorage.getItem('custom-sequences') || '[]');
    const filteredSequences = customSequences.filter((s: YogaSequence) => s._id !== sequenceId);
    localStorage.setItem('custom-sequences', JSON.stringify(filteredSequences));
    
    // Also remove from main array
    const index = this.mockSequences.findIndex(s => s._id === sequenceId);
    if (index > -1) {
      this.mockSequences.splice(index, 1);
    }

    return of(true).pipe(delay(200));
  }

  // Get filter options
  getFilterOptions() {
    return {
      difficulties: ['Beginner', 'Intermediate', 'Advanced'],
      categories: [
        { value: 'goal-based', label: 'Goal-Based' },
        { value: 'time-based', label: 'Time-Based' },
        { value: 'occasion-based', label: 'Occasion-Based' },
        { value: 'challenge', label: 'Challenges' }
      ],
      types: [
        { value: 'predefined', label: 'Predefined' },
        { value: 'custom', label: 'My Routines' },
        { value: 'challenge', label: 'Challenges' }
      ],
      durations: [
        { value: 'short', label: 'Short (≤10 min)' },
        { value: 'medium', label: 'Medium (10-25 min)' },
        { value: 'long', label: 'Long (>25 min)' }
      ],
      goals: [
        'Weight Loss',
        'Stress Relief', 
        'Flexibility',
        'Core Strength',
        'Energy Boost',
        'Better Sleep',
        'Pain Relief'
      ]
    };
  }
}
