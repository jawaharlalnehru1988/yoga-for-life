import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

/**
 * Enhanced data structures based on VedaYoga Premium Design
 */

export interface YogaStep {
  title: string;
  stage?: string;
  description: string;
  breath?: string;
}

export interface YogaBenefit {
  title: string;
  description: string;
  icon: string;
}

export interface YogaQuote {
  text: string;
  author: string;
}

export interface YogaPose {
  _id: string;
  name: string;
  englishName: string;
  sanskritName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl: string;
  imageContext?: string;
  videoUrl?: string;
  description: string;
  quickBenefit: string;
  benefits: YogaBenefit[];
  detailedSteps: YogaStep[];
  contraindications: string[];
  mistakes: string[];
  duration: string;
  tags: string[];
  category: string;
  spiritualQuote?: YogaQuote;
  isFavorite?: boolean;
  popularity?: number;
}

export interface FilterOptions {
  difficulty?: string;
  focus?: string;
  duration?: string;
  category?: string;
}

export interface SortOptions {
  sortBy: 'alphabetical' | 'difficulty' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class YogaPosesService {
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  // Mock data for yoga poses - Refactored for Premium VedaYoga Structure
  private mockPoses: YogaPose[] = [
    {
      _id: 'pose006',
      name: 'Bhujangasana',
      englishName: 'Cobra Pose',
      sanskritName: 'Bhujangasana',
      difficulty: 'Intermediate',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNuxlRmSp30ikPRfetViGK1YsWhUgtbxdea3tvlD4kVkNjIUuAt36Vgml67DNLSLzlxY4nERBn6sDo-eNmGawNzfb1615zlQ-O7j9hhJxBHKDQ2SFh-zHQIX0yVIx_m0i_yiIj7h8imoyWEgvHlTAs7vGyTANXySZ3Cew7vOLMVYkgPG63EExDHinv_vG521n-N7osGf0gTujEfoZ0pQmm-jt0XfFn9amxIKL5ZAUkYq9-_nu0ULGWKMWgO76A1Dgk0_pzdW-XbvQ',
      imageContext: 'Vedic Wisdom',
      description: "A powerful backbend that awakens the serpent power (Kundalini) and opens the heart center. Derived from the Sanskrit words 'Bhujanga' meaning cobra and 'Asana' meaning posture.",
      quickBenefit: 'Strengthens back & opens chest',
      benefits: [
        {
          title: 'Strengthens Spine',
          description: 'Increases flexibility and tones the spinal nerves.',
          icon: 'accessibility_new'
        },
        {
          title: 'Stretches Chest',
          description: 'Expands the lungs and improves respiratory capacity.',
          icon: 'favorite'
        },
        {
          title: 'Invigorates Body',
          description: 'Reduces fatigue and stress while boosting energy.',
          icon: 'bolt'
        }
      ],
      detailedSteps: [
        {
          title: 'Foundation',
          stage: 'Preparation',
          description: 'Lie prone on the mat with your legs extended behind you, tops of the feet resting on the floor. Keep your feet together or hip-distance apart.',
          breath: 'Natural Awareness'
        },
        {
          title: 'Hand Placement',
          description: 'Spread your hands on the floor under your shoulders. Hug your elbows into your body. Press the tops of the feet and thighs firmly into the floor.',
          breath: 'Deep Exhale'
        },
        {
          title: 'The Ascension',
          stage: 'Critical Step',
          description: 'On an inhalation, begin to straighten the arms to lift the chest off the floor, going only to the height at which you can maintain a connection through your pubis to the floor.',
          breath: 'Slow Inhale'
        },
        {
          title: 'The Hold',
          description: 'Distribute the backbend evenly through the entire spine. Gaze forward or slightly upward without crunching the back of the neck.',
          breath: 'Kumbhaka (Hold)'
        }
      ],
      contraindications: [
        'Recent abdominal surgery',
        'Carpal tunnel syndrome',
        '3rd Trimester Pregnancy',
        'Severe back injury'
      ],
      mistakes: [
        "Don't over-straighten elbows or 'lock' joints.",
        'Avoid shrugging shoulders up toward ears.',
        "Don't force the lift using only arm strength.",
        'Never hold your breath during the transition.'
      ],
      duration: '15-30 seconds',
      tags: ['Strengthening', 'Heart Opening', 'Intermediate'],
      category: 'Hatha Yoga',
      spiritualQuote: {
        text: "As the cobra raises its hood, the practitioner raises their consciousness, shedding the old skin of ego to reveal the light within.",
        author: 'Gheranda Samhita'
      },
      popularity: 85
    },
    {
      _id: 'pose001',
      name: 'Adho Mukha Svanasana',
      englishName: 'Downward Facing Dog',
      sanskritName: 'Adho Mukha Svanasana',
      difficulty: 'Beginner',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754926619/downward-dog-img-3-1024x683_jocvnv.jpg',
      description: 'An essential resting pose that stretches the entire body while calming the nervous system.',
      quickBenefit: 'Stretches hamstrings & calves',
      benefits: [
        { title: 'Full Body Stretch', description: 'Lengthens the spine and stretches hamstrings.', icon: 'straighten' },
        { title: 'Mental Clarity', description: 'Calms the mind and relieves stress.', icon: 'psychology' }
      ],
      detailedSteps: [
        { title: 'Tabletop', description: 'Start on hands and knees.', breath: 'Natural' },
        { title: 'The Lift', description: 'Lift hips up and back.', breath: 'Exhale' }
      ],
      contraindications: ['Wrist injury', 'High blood pressure'],
      mistakes: ['Rounding the back', 'Locking knees'],
      duration: '30-60 seconds',
      tags: ['Flexibility', 'Beginner'],
      category: 'Hatha Yoga',
      popularity: 95
    }
    // ... Additional poses would be expanded here in actual implementation
  ];

  constructor() {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('yoga-favorites');
    if (savedFavorites) {
      this.favoritesSubject.next(JSON.parse(savedFavorites));
    }
  }

  // Get all poses
  getAllPoses(): Observable<YogaPose[]> {
    return of(this.mockPoses).pipe(delay(300));
  }

  // Get pose by ID
  getPoseById(id: string): Observable<YogaPose | undefined> {
    const pose = this.mockPoses.find(p => p._id === id);
    return of(pose).pipe(delay(200));
  }

  // Search poses
  searchPoses(query: string): Observable<YogaPose[]> {
    const filtered = this.mockPoses.filter(pose =>
      pose.name.toLowerCase().includes(query.toLowerCase()) ||
      pose.englishName.toLowerCase().includes(query.toLowerCase()) ||
      pose.sanskritName.toLowerCase().includes(query.toLowerCase()) ||
      pose.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    return of(filtered).pipe(delay(200));
  }

  // Filter poses
  filterPoses(filters: FilterOptions): Observable<YogaPose[]> {
    let filtered = [...this.mockPoses];

    if (filters.difficulty) {
      filtered = filtered.filter(pose => pose.difficulty === filters.difficulty);
    }

    if (filters.category) {
      filtered = filtered.filter(pose => pose.category === filters.category);
    }

    return of(filtered).pipe(delay(200));
  }

  // Sort poses
  sortPoses(poses: YogaPose[], sortOptions: SortOptions): YogaPose[] {
    const sorted = [...poses];

    switch (sortOptions.sortBy) {
      case 'alphabetical':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'difficulty':
        const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        sorted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case 'popularity':
        sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
    }

    if (sortOptions.sortOrder === 'desc') {
      sorted.reverse();
    }

    return sorted;
  }

  // Get featured poses
  getFeaturedPoses(): Observable<YogaPose[]> {
    const featured = this.mockPoses
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 3);
    return of(featured).pipe(delay(200));
  }

  // Get pose of the day
  getPoseOfTheDay(): Observable<YogaPose> {
    const randomIndex = Math.floor(Math.random() * this.mockPoses.length);
    return of(this.mockPoses[randomIndex]).pipe(delay(200));
  }

  // Toggle favorite
  toggleFavorite(poseId: string): void {
    const currentFavorites = this.favoritesSubject.value;
    let updatedFavorites: string[];

    if (currentFavorites.includes(poseId)) {
      updatedFavorites = currentFavorites.filter(id => id !== poseId);
    } else {
      updatedFavorites = [...currentFavorites, poseId];
    }

    this.favoritesSubject.next(updatedFavorites);
    localStorage.setItem('yoga-favorites', JSON.stringify(updatedFavorites));
  }

  // Check if pose is favorite
  isFavorite(poseId: string): Observable<boolean> {
    return this.favorites$.pipe(
      map(favorites => favorites.includes(poseId))
    );
  }

  // Get favorite poses
  getFavoritePoses(): Observable<YogaPose[]> {
    return this.favorites$.pipe(
      map(favoriteIds =>
        this.mockPoses.filter(pose => favoriteIds.includes(pose._id))
      )
    );
  }

  // Get filter options for dropdowns
  getFilterOptions() {
    return {
      difficulties: ['Beginner', 'Intermediate', 'Advanced'],
      categories: [...new Set(this.mockPoses.map(pose => pose.category))],
      focuses: ['Flexibility', 'Strength', 'Balance', 'Relaxation', 'Stress Relief'],
      durations: [
        { value: 'short', label: 'Short (<5 mins)' },
        { value: 'medium', label: 'Medium (5-15 mins)' },
        { value: 'long', label: 'Long (>15 mins)' }
      ]
    };
  }
}
