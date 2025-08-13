import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

interface DailyTip {
  id: string;
  title: string;
  content: string;
  category: 'yoga' | 'meditation' | 'breathing' | 'nutrition' | 'lifestyle' | 'mindfulness';
  icon: string;
  date: Date;
  readTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  isFavorite: boolean;
  isRead: boolean;
}

interface TipCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

@Component({
  selector: 'app-daily-tips',
  templateUrl: './daily-tips.page.html',
  styleUrls: ['./daily-tips.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DailyTipsPage implements OnInit {

  selectedCategory: string = 'all';
  selectedFilter: string = 'all';
  searchQuery: string = '';
  
  dailyTip: DailyTip | null = null;
  allTips: DailyTip[] = [];
  filteredTips: DailyTip[] = [];
  favoriteTips: DailyTip[] = [];
  
  categories: TipCategory[] = [
    {
      id: 'all',
      name: 'All Tips',
      icon: 'grid-outline',
      color: 'primary',
      description: 'Browse all wellness tips'
    },
    {
      id: 'yoga',
      name: 'Yoga',
      icon: 'body-outline',
      color: 'success',
      description: 'Yoga poses and techniques'
    },
    {
      id: 'meditation',
      name: 'Meditation',
      icon: 'leaf-outline',
      color: 'tertiary',
      description: 'Mindfulness and meditation practices'
    },
    {
      id: 'breathing',
      name: 'Breathing',
      icon: 'infinite-outline',
      color: 'secondary',
      description: 'Breathing exercises and pranayama'
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      icon: 'nutrition-outline',
      color: 'warning',
      description: 'Healthy eating and nutrition'
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle',
      icon: 'sunny-outline',
      color: 'medium',
      description: 'Wellness lifestyle tips'
    },
    {
      id: 'mindfulness',
      name: 'Mindfulness',
      icon: 'heart-outline',
      color: 'danger',
      description: 'Mindful living practices'
    }
  ];

  constructor() { }

  ngOnInit() {
    this.initializeTips();
    this.setDailyTip();
    this.filterTips();
  }

  initializeTips() {
    this.allTips = [
      {
        id: 'tip1',
        title: 'Morning Sun Salutation',
        content: 'Start your day with 5 rounds of Sun Salutation (Surya Namaskara) to energize your body and mind. This flowing sequence of 12 poses helps improve flexibility, strength, and circulation while connecting you with your breath.',
        category: 'yoga',
        icon: 'sunny',
        date: new Date(),
        readTime: 3,
        difficulty: 'beginner',
        tags: ['morning', 'energy', 'flow'],
        isFavorite: false,
        isRead: false
      },
      {
        id: 'tip2',
        title: '4-7-8 Breathing Technique',
        content: 'Practice the 4-7-8 breathing technique before bed. Inhale for 4 counts, hold for 7, exhale for 8. This powerful technique activates your parasympathetic nervous system and promotes deep relaxation.',
        category: 'breathing',
        icon: 'infinite',
        date: new Date(Date.now() - 86400000),
        readTime: 2,
        difficulty: 'beginner',
        tags: ['sleep', 'relaxation', 'stress-relief'],
        isFavorite: true,
        isRead: true
      },
      {
        id: 'tip3',
        title: 'Mindful Water Drinking',
        content: 'Transform a simple daily action into a mindfulness practice. When drinking water, focus completely on the sensation of coolness, the act of swallowing, and the feeling of hydration. This builds present-moment awareness.',
        category: 'mindfulness',
        icon: 'water',
        date: new Date(Date.now() - 172800000),
        readTime: 2,
        difficulty: 'beginner',
        tags: ['mindfulness', 'hydration', 'daily-practice'],
        isFavorite: false,
        isRead: true
      },
      {
        id: 'tip4',
        title: 'Golden Milk for Better Sleep',
        content: 'Prepare golden milk (turmeric latte) 1-2 hours before bed. Mix warm milk with turmeric, ginger, cinnamon, and a pinch of black pepper. This Ayurvedic drink reduces inflammation and promotes restful sleep.',
        category: 'nutrition',
        icon: 'cafe',
        date: new Date(Date.now() - 259200000),
        readTime: 3,
        difficulty: 'beginner',
        tags: ['sleep', 'ayurveda', 'anti-inflammatory'],
        isFavorite: true,
        isRead: false
      },
      {
        id: 'tip5',
        title: 'Tree Pose for Balance',
        content: 'Practice Vrikshasana (Tree Pose) daily to improve physical and mental balance. Start with your foot on your ankle or calf (never on the knee). Focus on a fixed point and breathe steadily. Hold for 30 seconds to 1 minute on each side.',
        category: 'yoga',
        icon: 'leaf',
        date: new Date(Date.now() - 345600000),
        readTime: 4,
        difficulty: 'intermediate',
        tags: ['balance', 'focus', 'standing-poses'],
        isFavorite: false,
        isRead: true
      },
      {
        id: 'tip6',
        title: '5-Minute Meditation',
        content: 'Set aside 5 minutes each morning for meditation. Sit comfortably, close your eyes, and focus on your natural breath. When thoughts arise, gently return attention to your breathing. Start small and build consistency.',
        category: 'meditation',
        icon: 'flower',
        date: new Date(Date.now() - 432000000),
        readTime: 2,
        difficulty: 'beginner',
        tags: ['morning', 'focus', 'stress-relief'],
        isFavorite: true,
        isRead: false
      },
      {
        id: 'tip7',
        title: 'Digital Sunset Routine',
        content: 'Create a "digital sunset" by turning off all screens 1 hour before bed. Replace screen time with gentle stretching, reading, or journaling. This helps regulate your circadian rhythm and improves sleep quality.',
        category: 'lifestyle',
        icon: 'moon',
        date: new Date(Date.now() - 518400000),
        readTime: 3,
        difficulty: 'beginner',
        tags: ['sleep', 'digital-detox', 'routine'],
        isFavorite: false,
        isRead: true
      },
      {
        id: 'tip8',
        title: 'Alternate Nostril Breathing',
        content: 'Practice Nadi Shodhana (Alternate Nostril Breathing) to balance your nervous system. Use your thumb to close right nostril, inhale through left. Close left with ring finger, release thumb, exhale right. Continue for 5-10 rounds.',
        category: 'breathing',
        icon: 'infinite',
        date: new Date(Date.now() - 604800000),
        readTime: 4,
        difficulty: 'intermediate',
        tags: ['pranayama', 'balance', 'nervous-system'],
        isFavorite: true,
        isRead: false
      },
      {
        id: 'tip9',
        title: 'Gratitude Journaling',
        content: 'Write down 3 things you\'re grateful for each evening. This simple practice rewires your brain for positivity, reduces stress, and improves overall well-being. Be specific and feel the emotion of gratitude.',
        category: 'mindfulness',
        icon: 'heart',
        date: new Date(Date.now() - 691200000),
        readTime: 3,
        difficulty: 'beginner',
        tags: ['gratitude', 'journaling', 'evening'],
        isFavorite: false,
        isRead: true
      },
      {
        id: 'tip10',
        title: 'Warm Lemon Water',
        content: 'Start your day with warm lemon water. Squeeze half a lemon into warm water and drink on an empty stomach. This aids digestion, boosts vitamin C, supports liver detox, and kickstarts your metabolism.',
        category: 'nutrition',
        icon: 'water',
        date: new Date(Date.now() - 777600000),
        readTime: 2,
        difficulty: 'beginner',
        tags: ['morning', 'detox', 'digestion'],
        isFavorite: true,
        isRead: false
      }
    ];
  }

  setDailyTip() {
    // Set today's featured tip (can be randomized or date-based)
    const today = new Date().getDate();
    const tipIndex = today % this.allTips.length;
    this.dailyTip = this.allTips[tipIndex];
  }

  filterTips() {
    this.filteredTips = this.allTips.filter(tip => {
      const categoryMatch = this.selectedCategory === 'all' || tip.category === this.selectedCategory;
      const searchMatch = this.searchQuery === '' || 
        tip.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        tip.content.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        tip.tags.some(tag => tag.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      let filterMatch = true;
      if (this.selectedFilter === 'favorites') {
        filterMatch = tip.isFavorite;
      } else if (this.selectedFilter === 'unread') {
        filterMatch = !tip.isRead;
      }
      
      return categoryMatch && searchMatch && filterMatch;
    });
    
    this.favoriteTips = this.allTips.filter(tip => tip.isFavorite);
  }

  onCategoryChange() {
    this.filterTips();
  }

  onFilterChange() {
    this.filterTips();
  }

  onSearchChange() {
    this.filterTips();
  }

  toggleFavorite(tip: DailyTip) {
    tip.isFavorite = !tip.isFavorite;
    this.filterTips();
  }

  markAsRead(tip: DailyTip) {
    tip.isRead = true;
    this.filterTips();
  }

  getCategoryInfo(categoryId: string): TipCategory {
    return this.categories.find(cat => cat.id === categoryId) || this.categories[0];
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'medium';
    }
  }

  getReadTimeText(minutes: number): string {
    return `${minutes} min read`;
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  }

  getCategoryTipCount(categoryId: string): number {
    if (categoryId === 'all') {
      return this.allTips.length;
    }
    return this.allTips.filter(tip => tip.category === categoryId).length;
  }
}
