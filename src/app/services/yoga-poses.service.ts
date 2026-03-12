import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Updated data structures based on the new API response
 */
export interface YogaPose {
  id: number;
  yogaName: string;
  blogContent: string;
  category: string;
  videoURL?: string | null;
  videoUrl?: string | null;
  imageURL?: string | null;
  imageUrl?: string | null;
  audioURL?: string | null;
  audioUrl?: string | null;
  isFavorite?: boolean;
}

export interface FilterOptions {
  category?: string;
}

export interface SortOptions {
  sortBy: 'alphabetical' | 'category';
  sortOrder: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class YogaPosesService {
  private apiUrl = 'https://api.asknehru.com/api/yoga/poses';
  private favoritesSubject = new BehaviorSubject<number[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('yoga-favorites');
    if (savedFavorites) {
      try {
        this.favoritesSubject.next(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error parsing favorites', e);
      }
    }
  }

  // Map API response to handle both naming conventions
  private mapPose(pose: any): YogaPose {
    return {
      ...pose,
      imageURL: pose.imageURL || pose.imageUrl,
      videoURL: pose.videoURL || pose.videoUrl,
      audioURL: pose.audioURL || pose.audioUrl
    };
  }

  // Get all poses
  getAllPoses(): Observable<YogaPose[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(poses => (poses || []).map(p => this.mapPose(p))),
      catchError(error => {
        console.error('Error fetching poses:', error);
        return of([]);
      })
    );
  }

  // Get pose by ID
  getPoseById(id: string | number): Observable<YogaPose | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(pose => pose ? this.mapPose(pose) : undefined),
      catchError(error => {
        console.error('Error fetching pose by id:', error);
        return of(undefined);
      })
    );
  }

  // Search poses
  searchPoses(query: string): Observable<YogaPose[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search`, {
      params: { yogaName: query }
    }).pipe(
      map(poses => (poses || []).map(p => this.mapPose(p))),
      catchError(error => {
        console.error('Error searching poses:', error);
        return of([]);
      })
    );
  }

  // Toggle favorite
  toggleFavorite(poseId: number): void {
    const currentFavorites = this.favoritesSubject.value;
    let updatedFavorites: number[];

    if (currentFavorites.includes(poseId)) {
      updatedFavorites = currentFavorites.filter(id => id !== poseId);
    } else {
      updatedFavorites = [...currentFavorites, poseId];
    }

    this.favoritesSubject.next(updatedFavorites);
    localStorage.setItem('yoga-favorites', JSON.stringify(updatedFavorites));
  }

  // Check if pose is favorite
  isFavorite(poseId: number): Observable<boolean> {
    return this.favorites$.pipe(
      map(favorites => favorites.includes(poseId))
    );
  }

  // Filter poses (Logic moved to client side for now as API might not support it)
  filterPoses(filters: FilterOptions, poses: YogaPose[]): YogaPose[] {
    if (!filters.category) return poses;
    return poses.filter(pose => pose.category.includes(filters.category!));
  }

  // Sort poses
  sortPoses(poses: YogaPose[], sortOptions: SortOptions): YogaPose[] {
    const sorted = [...poses];

    switch (sortOptions.sortBy) {
      case 'alphabetical':
        sorted.sort((a, b) => a.yogaName.localeCompare(b.yogaName));
        break;
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category));
        break;
    }

    if (sortOptions.sortOrder === 'desc') {
      sorted.reverse();
    }

    return sorted;
  }

  // Helper for compatibility
  getFilterOptions(allPoses: YogaPose[]) {
    const categories = new Set<string>();
    allPoses.forEach(pose => {
      if (pose.category) {
        pose.category.split(',').forEach(c => categories.add(c.trim()));
      }
    });
    return {
      categories: Array.from(categories)
    };
  }
}
