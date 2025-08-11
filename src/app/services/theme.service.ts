import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Theme {
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<string>('zen-garden');
  public currentTheme$ = this.currentThemeSubject.asObservable();

  private readonly THEME_KEY = 'yoga-app-theme';

  public themes: Theme[] = [
    {
      name: 'zen-garden',
      displayName: 'Zen Garden',
      description: 'Peaceful greens and earth tones for tranquility',
      colors: {
        primary: '#4a7c59',
        secondary: '#a4c3a2',
        accent: '#f7f3e9'
      }
    },
    {
      name: 'sunset-bliss',
      displayName: 'Sunset Bliss',
      description: 'Warm oranges and pinks for energy and warmth',
      colors: {
        primary: '#e67e22',
        secondary: '#f39c12',
        accent: '#fdf2e9'
      }
    },
    {
      name: 'ocean-waves',
      displayName: 'Ocean Waves',
      description: 'Calming blues and teals for deep relaxation',
      colors: {
        primary: '#2980b9',
        secondary: '#3498db',
        accent: '#ebf3fd'
      }
    },
    {
      name: 'lotus-bloom',
      displayName: 'Lotus Bloom',
      description: 'Soft purples and lavenders for spiritual harmony',
      colors: {
        primary: '#8e44ad',
        secondary: '#c39bd3',
        accent: '#f4f1f8'
      }
    }
  ];

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme && this.isValidTheme(savedTheme)) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('zen-garden');
    }
  }

  private isValidTheme(theme: string): boolean {
    return this.themes.some(t => t.name === theme);
  }

  public setTheme(themeName: string): void {
    if (!this.isValidTheme(themeName)) {
      console.warn(`Invalid theme: ${themeName}. Falling back to default.`);
      themeName = 'zen-garden';
    }

    // Remove existing theme classes
    document.body.classList.remove(...this.themes.map(t => t.name));
    
    // Add new theme class
    document.body.classList.add(themeName);
    
    // Save to localStorage
    localStorage.setItem(this.THEME_KEY, themeName);
    
    // Update current theme
    this.currentThemeSubject.next(themeName);
  }

  public getCurrentTheme(): string {
    return this.currentThemeSubject.value;
  }

  public getCurrentThemeInfo(): Theme | undefined {
    return this.themes.find(theme => theme.name === this.getCurrentTheme());
  }

  public getThemes(): Theme[] {
    return this.themes;
  }

  public nextTheme(): void {
    const currentIndex = this.themes.findIndex(theme => theme.name === this.getCurrentTheme());
    const nextIndex = (currentIndex + 1) % this.themes.length;
    this.setTheme(this.themes[nextIndex].name);
  }

  public toggleDarkMode(): void {
    document.body.classList.toggle('dark');
  }

  public isDarkMode(): boolean {
    return document.body.classList.contains('dark');
  }
}
