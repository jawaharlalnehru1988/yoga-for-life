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
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonChip,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonList,
  IonThumbnail,
  IonNote,
  IonSearchbar,
  IonFab,
  IonFabButton,
  IonCheckbox,
  IonActionSheet
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  heartOutline,
  heart,
  playOutline,
  timeOutline,
  starOutline,
  star,
  bookmarkOutline,
  bookmark,
  shareOutline,
  downloadOutline,
  filterOutline,
  searchOutline,
  gridOutline,
  listOutline,
  addOutline,
  checkmarkCircle,
  ellipsisVertical,
  bodyOutline,
  leafOutline,
  waterOutline,
  moonOutline,
  flameOutline,
  fitnessOutline
} from 'ionicons/icons';

export interface FavoriteItem {
  id: string;
  title: string;
  description: string;
  type: 'pose' | 'sequence' | 'meditation' | 'breathing' | 'challenge' | 'tip';
  category: string;
  duration?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  image?: string;
  rating: number;
  dateAdded: Date;
  lastAccessed?: Date;
  tags: string[];
  isFavorite: boolean;
  isDownloaded?: boolean;
  benefits?: string[];
}

export interface FavoriteCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.page.html',
  styleUrls: ['./favorites.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonCard,
    IonCardContent,
    IonIcon,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonChip,
    IonBadge,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonList,
    IonThumbnail,
    IonNote,
    IonSearchbar,
    IonFab,
    IonFabButton,
    IonCheckbox,
    IonActionSheet,
    CommonModule, 
    FormsModule
  ]
})
export class FavoritesPage implements OnInit {
  searchQuery: string = '';
  selectedCategory: string = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  isSelectionMode: boolean = false;
  selectedItems: Set<string> = new Set();
  
  favoriteItems: FavoriteItem[] = [];
  filteredItems: FavoriteItem[] = [];
  categories: FavoriteCategory[] = [];

  constructor() {
    addIcons({
      heartOutline,
      heart,
      playOutline,
      timeOutline,
      starOutline,
      star,
      bookmarkOutline,
      bookmark,
      shareOutline,
      downloadOutline,
      filterOutline,
      searchOutline,
      gridOutline,
      listOutline,
      addOutline,
      checkmarkCircle,
      ellipsisVertical,
      bodyOutline,
      leafOutline,
      waterOutline,
      moonOutline,
      flameOutline,
      fitnessOutline
    });
  }

  ngOnInit() {
    this.initializeData();
    this.filterItems();
  }

  initializeData() {
    this.initializeFavoriteItems();
    this.initializeCategories();
  }

  initializeFavoriteItems() {
    this.favoriteItems = [
      {
        id: 'pose1',
        title: 'Warrior III Pose',
        description: 'A challenging standing balance pose that strengthens the core and improves stability.',
        type: 'pose',
        category: 'standing',
        duration: 5,
        difficulty: 'intermediate',
        image: 'assets/poses/warrior3.jpg',
        rating: 5,
        dateAdded: new Date(Date.now() - 86400000 * 3),
        lastAccessed: new Date(Date.now() - 86400000),
        tags: ['balance', 'strength', 'core', 'standing'],
        isFavorite: true,
        benefits: ['Improves balance', 'Strengthens legs', 'Enhances focus']
      },
      {
        id: 'sequence1',
        title: 'Morning Sun Salutation',
        description: 'Energizing sequence to start your day with vitality and mindfulness.',
        type: 'sequence',
        category: 'flow',
        duration: 15,
        difficulty: 'beginner',
        image: 'assets/sequences/sun-salutation.jpg',
        rating: 5,
        dateAdded: new Date(Date.now() - 86400000 * 7),
        lastAccessed: new Date(Date.now() - 86400000 * 2),
        tags: ['morning', 'energy', 'flow', 'beginner-friendly'],
        isFavorite: true,
        isDownloaded: true,
        benefits: ['Increases energy', 'Improves flexibility', 'Boosts mood']
      },
      {
        id: 'meditation1',
        title: 'Body Scan Relaxation',
        description: 'Deep relaxation meditation focusing on releasing tension throughout the body.',
        type: 'meditation',
        category: 'relaxation',
        duration: 20,
        difficulty: 'beginner',
        image: 'assets/meditations/body-scan.jpg',
        rating: 4,
        dateAdded: new Date(Date.now() - 86400000 * 5),
        lastAccessed: new Date(Date.now() - 86400000 * 3),
        tags: ['relaxation', 'stress-relief', 'bedtime', 'mindfulness'],
        isFavorite: true,
        benefits: ['Reduces stress', 'Improves sleep', 'Increases awareness']
      },
      {
        id: 'breathing1',
        title: 'Alternate Nostril Breathing',
        description: 'Balancing pranayama technique to calm the mind and energize the body.',
        type: 'breathing',
        category: 'pranayama',
        duration: 10,
        difficulty: 'intermediate',
        image: 'assets/breathing/alternate-nostril.jpg',
        rating: 5,
        dateAdded: new Date(Date.now() - 86400000 * 10),
        lastAccessed: new Date(Date.now() - 86400000),
        tags: ['pranayama', 'balance', 'focus', 'energy'],
        isFavorite: true,
        benefits: ['Balances nervous system', 'Improves concentration', 'Reduces anxiety']
      },
      {
        id: 'challenge1',
        title: '30-Day Flexibility Challenge',
        description: 'Progressive challenge to improve overall flexibility and range of motion.',
        type: 'challenge',
        category: 'flexibility',
        duration: 30,
        difficulty: 'intermediate',
        image: 'assets/challenges/flexibility.jpg',
        rating: 4,
        dateAdded: new Date(Date.now() - 86400000 * 2),
        tags: ['flexibility', 'progressive', 'daily-practice', 'improvement'],
        isFavorite: true,
        isDownloaded: true,
        benefits: ['Increases flexibility', 'Prevents injury', 'Improves posture']
      },
      {
        id: 'tip1',
        title: 'Perfect Your Alignment',
        description: 'Essential tips for maintaining proper alignment in standing poses.',
        type: 'tip',
        category: 'technique',
        duration: 3,
        difficulty: 'beginner',
        rating: 5,
        dateAdded: new Date(Date.now() - 86400000 * 8),
        lastAccessed: new Date(Date.now() - 86400000 * 4),
        tags: ['alignment', 'technique', 'foundation', 'safety'],
        isFavorite: true,
        benefits: ['Prevents injury', 'Improves effectiveness', 'Builds foundation']
      },
      {
        id: 'pose2',
        title: 'Pigeon Pose',
        description: 'Deep hip opener that releases tension and improves flexibility.',
        type: 'pose',
        category: 'hip-opener',
        duration: 8,
        difficulty: 'intermediate',
        image: 'assets/poses/pigeon.jpg',
        rating: 4,
        dateAdded: new Date(Date.now() - 86400000 * 6),
        lastAccessed: new Date(Date.now() - 86400000 * 2),
        tags: ['hip-opener', 'flexibility', 'seated', 'restorative'],
        isFavorite: true,
        benefits: ['Opens hips', 'Releases tension', 'Improves posture']
      },
      {
        id: 'meditation2',
        title: 'Loving Kindness Meditation',
        description: 'Heart-opening practice to cultivate compassion and positive emotions.',
        type: 'meditation',
        category: 'heart-opening',
        duration: 15,
        difficulty: 'beginner',
        image: 'assets/meditations/loving-kindness.jpg',
        rating: 5,
        dateAdded: new Date(Date.now() - 86400000 * 4),
        tags: ['compassion', 'heart-opening', 'positivity', 'emotional'],
        isFavorite: true,
        benefits: ['Increases compassion', 'Improves relationships', 'Reduces negativity']
      }
    ];
  }

  initializeCategories() {
    this.categories = [
      {
        id: 'all',
        name: 'All',
        icon: 'heart',
        color: 'danger',
        count: this.favoriteItems.length
      },
      {
        id: 'pose',
        name: 'Poses',
        icon: 'body-outline',
        color: 'primary',
        count: this.favoriteItems.filter(item => item.type === 'pose').length
      },
      {
        id: 'sequence',
        name: 'Sequences',
        icon: 'fitness-outline',
        color: 'secondary',
        count: this.favoriteItems.filter(item => item.type === 'sequence').length
      },
      {
        id: 'meditation',
        name: 'Meditations',
        icon: 'moon-outline',
        color: 'tertiary',
        count: this.favoriteItems.filter(item => item.type === 'meditation').length
      },
      {
        id: 'breathing',
        name: 'Breathing',
        icon: 'water-outline',
        color: 'success',
        count: this.favoriteItems.filter(item => item.type === 'breathing').length
      },
      {
        id: 'challenge',
        name: 'Challenges',
        icon: 'flame-outline',
        color: 'warning',
        count: this.favoriteItems.filter(item => item.type === 'challenge').length
      },
      {
        id: 'tip',
        name: 'Tips',
        icon: 'leaf-outline',
        color: 'medium',
        count: this.favoriteItems.filter(item => item.type === 'tip').length
      }
    ];
  }

  filterItems() {
    this.filteredItems = this.favoriteItems.filter(item => {
      const categoryMatch = this.selectedCategory === 'all' || item.type === this.selectedCategory;
      const searchMatch = this.searchQuery === '' || 
        item.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      return categoryMatch && searchMatch && item.isFavorite;
    });
  }

  onCategoryChange() {
    this.filterItems();
  }

  onSearchChange() {
    this.filterItems();
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleSelectionMode() {
    this.isSelectionMode = !this.isSelectionMode;
    if (!this.isSelectionMode) {
      this.selectedItems.clear();
    }
  }

  toggleItemSelection(itemId: string) {
    if (this.selectedItems.has(itemId)) {
      this.selectedItems.delete(itemId);
    } else {
      this.selectedItems.add(itemId);
    }
  }

  isItemSelected(itemId: string): boolean {
    return this.selectedItems.has(itemId);
  }

  removeFavorite(item: FavoriteItem) {
    item.isFavorite = false;
    this.filterItems();
    this.initializeCategories(); // Update counts
  }

  removeSelectedFavorites() {
    this.favoriteItems.forEach(item => {
      if (this.selectedItems.has(item.id)) {
        item.isFavorite = false;
      }
    });
    this.selectedItems.clear();
    this.isSelectionMode = false;
    this.filterItems();
    this.initializeCategories();
  }

  shareItem(item: FavoriteItem) {
    // Implementation for sharing
    console.log('Sharing item:', item.title);
  }

  downloadItem(item: FavoriteItem) {
    item.isDownloaded = true;
    console.log('Downloading item:', item.title);
  }

  playItem(item: FavoriteItem) {
    item.lastAccessed = new Date();
    console.log('Playing item:', item.title);
  }

  getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'medium';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'pose': return 'body-outline';
      case 'sequence': return 'fitness-outline';
      case 'meditation': return 'moon-outline';
      case 'breathing': return 'water-outline';
      case 'challenge': return 'flame-outline';
      case 'tip': return 'leaf-outline';
      default: return 'bookmark-outline';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'pose': return 'primary';
      case 'sequence': return 'secondary';
      case 'meditation': return 'tertiary';
      case 'breathing': return 'success';
      case 'challenge': return 'warning';
      case 'tip': return 'medium';
      default: return 'medium';
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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

  generateStars(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'star' : 'star-outline');
    }
    return stars;
  }

  getFavoritesCount(): number {
    return this.favoriteItems.filter(item => item.isFavorite).length;
  }

  getSelectedCount(): number {
    return this.selectedItems.size;
  }

  getDownloadedCount(): number {
    return this.favoriteItems.filter(item => item.isDownloaded).length;
  }

  getRecentlyAccessedCount(): number {
    const oneWeekAgo = Date.now() - 604800000; // 7 days in milliseconds
    return this.favoriteItems.filter(item => 
      item.lastAccessed && item.lastAccessed.getTime() > oneWeekAgo
    ).length;
  }
}
