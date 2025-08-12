import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export interface YogaPose {
  _id: string;
  name: string;
  sanskritName?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl: string;
  videoUrl?: string;
  quickBenefit: string;
  benefits: string[];
  steps: string[];
  mistakes: string[];
  duration: string;
  tags: string[];
  category: string;
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

  // Mock data for yoga poses
  private mockPoses: YogaPose[] = [
    {
      _id: 'pose001',
      name: 'Downward Facing Dog',
      sanskritName: 'Adho Mukha Svanasana',
      difficulty: 'Beginner',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754926619/downward-dog-img-3-1024x683_jocvnv.jpg',
      videoUrl: 'https://youtu.be/Y0GDgQqt-bA',
      quickBenefit: 'Stretches hamstrings & calves',
      benefits: [
        'Strengthens arms and legs',
        'Relieves stress and fatigue',
        'Improves blood circulation',
        'Stretches spine and hamstrings'
      ],
      steps: [
        'Start on your hands and knees in table pose',
        'Tuck your toes under and lift your hips up and back',
        'Straighten your legs and press your heels toward the floor',
        'Keep your arms straight and hands shoulder-width apart',
        'Hold for 30-60 seconds'
      ],
      mistakes: [
        'Rounding the back',
        'Lifting heels too high',
        'Placing hands too close together',
        'Looking up instead of keeping neck neutral'
      ],
      duration: '30-60 seconds',
      tags: ['flexibility', 'stress relief', 'full body'],
      category: 'Flexibility',
      popularity: 95
    },
    {
      _id: 'pose002',
      name: 'Mountain Pose',
      sanskritName: 'Tadasana',
      difficulty: 'Beginner',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754957147/mountain_dwq5mn.jpg',
      quickBenefit: 'Improves posture & balance',
      benefits: [
        'Improves posture',
        'Strengthens thighs and core',
        'Reduces flat feet',
        'Relieves sciatica'
      ],
      steps: [
        'Stand with feet hip-width apart',
        'Ground down through all four corners of your feet',
        'Engage your leg muscles',
        'Lengthen your spine',
        'Relax your shoulders away from your ears',
        'Breathe deeply'
      ],
      mistakes: [
        'Locking the knees',
        'Tensing shoulders',
        'Shifting weight to one foot',
        'Holding breath'
      ],
      duration: '30-120 seconds',
      tags: ['balance', 'posture', 'grounding'],
      category: 'Balance',
      popularity: 80
    },
    {
      _id: 'pose003',
      name: 'Child\'s Pose',
      sanskritName: 'Balasana',
      difficulty: 'Beginner',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754884086/Yoga-Pose-Diagrams-1_k2dwxm.jpg',
      quickBenefit: 'Deeply relaxing & restorative',
      benefits: [
        'Calms the mind and relieves stress',
        'Stretches hips, thighs, and ankles',
        'Relieves back and neck pain',
        'Helps with fatigue and insomnia'
      ],
      steps: [
        'Kneel on the floor with your big toes touching',
        'Sit back on your heels',
        'Open your knees hip-width apart',
        'Exhale and lay your torso down between your thighs',
        'Extend your arms forward or alongside your body'
      ],
      mistakes: [
        'Forcing the stretch',
        'Lifting the hips too high',
        'Tensing the shoulders',
        'Holding the breath'
      ],
      duration: '1-5 minutes',
      tags: ['relaxation', 'stress relief', 'restorative'],
      category: 'Relaxation',
      popularity: 90
    },
    {
      _id: 'pose004',
      name: 'Warrior I',
      sanskritName: 'Virabhadrasana I',
      difficulty: 'Intermediate',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754957354/Yoga-Pose-How-To-Diagrams-22_kazymn.jpg',
      quickBenefit: 'Builds strength & confidence',
      benefits: [
        'Strengthens legs and core',
        'Opens hips and chest',
        'Improves balance and concentration',
        'Builds confidence and focus'
      ],
      steps: [
        'Step your left foot back 3-4 feet',
        'Turn your left foot out 45-60 degrees',
        'Bend your right knee over your ankle',
        'Square your hips toward the front',
        'Raise your arms overhead',
        'Hold and repeat on the other side'
      ],
      mistakes: [
        'Knee extending over the ankle',
        'Hips not squared forward',
        'Leaning forward',
        'Collapsing the back leg'
      ],
      duration: '30-60 seconds each side',
      tags: ['strength', 'balance', 'confidence'],
      category: 'Strength',
      popularity: 85
    },
    {
      _id: 'pose005',
      name: 'Tree Pose',
      sanskritName: 'Vrikshasana',
      difficulty: 'Intermediate',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754926770/EY5hbzkT5TOuur83xC40VITSGQbgh3jED7N_8DpfG_Tt2k48R-rePqkAshnFzMAe1hZCl8l3uaKlK5AFxVf-n_V5ysK6_j6gmne.jpg',
      quickBenefit: 'Improves balance & focus',
      benefits: [
        'Improves balance and stability',
        'Strengthens legs and core',
        'Improves concentration',
        'Calms the mind'
      ],
      steps: [
        'Stand in Mountain Pose',
        'Shift weight to your left foot',
        'Bend your right knee and place right foot on inner left thigh',
        'Press foot into leg and leg into foot',
        'Bring hands to prayer position at heart',
        'Hold and repeat on other side'
      ],
      mistakes: [
        'Placing foot on the side of the knee',
        'Leaning into the standing leg',
        'Holding the breath',
        'Looking around instead of finding a focal point'
      ],
      duration: '30-60 seconds each side',
      tags: ['balance', 'focus', 'stability'],
      category: 'Balance',
      popularity: 88
    },
    {
      _id: 'pose006',
      name: 'Cobra Pose',
      sanskritName: 'Bhujangasana',
      difficulty: 'Intermediate',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754927340/OIP_xksj3t.webp',
      quickBenefit: 'Strengthens back & opens chest',
      benefits: [
        'Strengthens the spine',
        'Opens chest and lungs',
        'Improves posture',
        'Stimulates abdominal organs'
      ],
      steps: [
        'Lie face down with legs extended',
        'Place palms under your shoulders',
        'Press pubic bone down and engage legs',
        'Press palms down and lift chest',
        'Keep shoulders away from ears',
        'Hold the pose breathing deeply'
      ],
      mistakes: [
        'Using arms to push up too forcefully',
        'Lifting too high too quickly',
        'Tensing shoulders',
        'Neglecting leg engagement'
      ],
      duration: '15-30 seconds',
      tags: ['backbend', 'strength', 'heart opening'],
      category: 'Strength',
      popularity: 75
    },
    {
      _id: 'pose007',
      name: 'Pigeon Pose',
      sanskritName: 'Eka Pada Rajakapotasana',
      difficulty: 'Advanced',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754927116/Mayurasana_zexslq.jpg',
      quickBenefit: 'Deep hip opening & flexibility',
      benefits: [
        'Deep hip flexor stretch',
        'Opens the chest and shoulders',
        'Stimulates internal organs',
        'Releases stored emotions'
      ],
      steps: [
        'Start in Downward Facing Dog',
        'Bring right knee forward behind right wrist',
        'Extend left leg straight back',
        'Square your hips and fold forward',
        'Use props if needed for support',
        'Hold and repeat on other side'
      ],
      mistakes: [
        'Forcing the hip to the ground',
        'Collapsing over the front leg',
        'Not supporting with props when needed',
        'Tensing the jaw and breath'
      ],
      duration: '1-3 minutes each side',
      tags: ['hip opening', 'flexibility', 'emotional release'],
      category: 'Flexibility',
      popularity: 70
    },
    {
      _id: 'pose008',
      name: 'Seated Forward Fold',
      sanskritName: 'Paschimottanasana',
      difficulty: 'Beginner',
      imageUrl: 'https://res.cloudinary.com/dbmkctsda/image/upload/v1754957234/seated-forward-fold-pose_euiqkn.jpg',
      quickBenefit: 'Calms mind & stretches spine',
      benefits: [
        'Stretches spine and hamstrings',
        'Calms the nervous system',
        'Improves digestion',
        'Relieves stress and anxiety'
      ],
      steps: [
        'Sit with legs extended straight',
        'Inhale and lengthen your spine',
        'Exhale and hinge forward from hips',
        'Reach for your feet or shins',
        'Keep the spine long',
        'Breathe deeply and relax'
      ],
      mistakes: [
        'Rounding the back',
        'Forcing the stretch',
        'Holding tension in shoulders',
        'Bouncing to go deeper'
      ],
      duration: '1-3 minutes',
      tags: ['forward fold', 'calming', 'hamstring stretch'],
      category: 'Flexibility',
      popularity: 82
    }
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
    return of(this.mockPoses).pipe(delay(300)); // Simulate API delay
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
      pose.sanskritName?.toLowerCase().includes(query.toLowerCase()) ||
      pose.benefits.some(benefit => benefit.toLowerCase().includes(query.toLowerCase())) ||
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

    if (filters.focus) {
      filtered = filtered.filter(pose => 
        pose.tags.some(tag => tag.toLowerCase().includes(filters.focus!.toLowerCase()))
      );
    }

    if (filters.duration) {
      // Simple duration filtering logic
      filtered = filtered.filter(pose => {
        const duration = pose.duration.toLowerCase();
        switch (filters.duration) {
          case 'short':
            return duration.includes('30') || duration.includes('15');
          case 'medium':
            return duration.includes('60') || duration.includes('1-3');
          case 'long':
            return duration.includes('3-5') || duration.includes('5');
          default:
            return true;
        }
      });
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

  // Get featured poses (top 3 most popular)
  getFeaturedPoses(): Observable<YogaPose[]> {
    const featured = this.mockPoses
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 3);
    return of(featured).pipe(delay(200));
  }

  // Get pose of the day (random pose)
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
