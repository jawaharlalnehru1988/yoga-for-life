import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay, tap } from 'rxjs/operators';

export interface SequencePose {
  poseId: number | string;
  duration: number; // in seconds
  transitionTime?: number; // time to transition to next pose
}

export interface YogaSequence {
  id: number;
  sequenceName: string;
  category: string;
  blogContent: string;
  videoURL: string;
  audioURL: string | null;
  imageURL: string | null;
  
  // Fields for backward compatibility or UI state
  _id?: string;
  name?: string;
  description?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  totalTime?: number;
  goal?: string;
  type?: 'predefined' | 'custom' | 'challenge';
  tags?: string[];
  isPremium?: boolean;
  createdBy?: string;
  poses?: SequencePose[];
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
  private apiUrl = 'https://api.asknehru.com/api/yoga/sequences';

  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  private progressSubject = new BehaviorSubject<UserProgress[]>([]);
  public progress$ = this.progressSubject.asObservable();

  private mockChallenges: Challenge[] = []; // Placeholder for now
  private mockSequences: YogaSequence[] = []; // Placeholder for now

  constructor(private http: HttpClient) {
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
    return this.http.get<YogaSequence[]>(this.apiUrl).pipe(
      map(sequences => sequences.map(s => this.mapSequence(s)))
    );
  }

  // Get sequence by ID
  getSequenceById(id: string | number): Observable<YogaSequence> {
    return this.http.get<YogaSequence>(`${this.apiUrl}/${id}`).pipe(
      map(s => this.mapSequence(s))
    );
  }

  private mapSequence(s: YogaSequence): YogaSequence {
    return {
      ...s,
      _id: s.id.toString(),
      name: s.sequenceName,
      description: s.blogContent.substring(0, 150) + '...',
      difficulty: 'Beginner', // Default
      totalTime: 15, // Default
      goal: s.category,
      type: 'predefined',
      tags: s.category.split(',').map(t => t.trim()),
      isPremium: false
    };
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
        const totalTime = seq.totalTime || 0;
        switch (filters.duration) {
          case 'short': return totalTime <= 10;
          case 'medium': return totalTime > 10 && totalTime <= 25;
          case 'long': return totalTime > 25;
          default: return true;
        }
      });
    }

    if (filters.goal) {
      const goalLower = filters.goal.toLowerCase();
      filtered = filtered.filter(seq =>
        (seq.goal?.toLowerCase().includes(goalLower) || false) ||
        (seq.tags?.some(tag => tag.toLowerCase().includes(goalLower)) || false)
      );
    }

    return of(filtered).pipe(delay(200));
  }

  // Search sequences
  searchSequences(query: string): Observable<YogaSequence[]> {
    const q = query.toLowerCase();
    const filtered = this.mockSequences.filter(seq =>
      (seq.name?.toLowerCase().includes(q) || false) ||
      (seq.description?.toLowerCase().includes(q) || false) ||
      (seq.goal?.toLowerCase().includes(q) || false) ||
      (seq.tags?.some(tag => tag.toLowerCase().includes(q)) || false)
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
        this.mockSequences.filter(seq => seq._id && favoriteIds.includes(seq._id))
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
