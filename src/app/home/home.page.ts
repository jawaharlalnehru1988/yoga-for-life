import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ThemeService } from '../services/theme.service';

declare const google: any;

interface LearningPathCard {
  icon: string;
  title: string;
  description: string;
  route?: string;
}

interface HeroSlide {
  label: string;
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule
  ]
})
export class HomePage implements OnInit {

  userName = 'Yogi';
  userPicture: string | null = null;
  isLoggedIn = false;
  activeSlideIndex = 0;
  googleClientId = '977135259177-1tpp90bmrnr7dokqjuu1bh08h7p84neh.apps.googleusercontent.com';

  heroSlides: HeroSlide[] = [
    {
      label: 'Vedic Wisdom',
      title: 'Embrace the Path of Patanjali',
      description: 'A traditional approach to modern wellness. Unlock the secrets of the ancient Yoga Sutras through guided practice and meditation.',
      image: 'https://images.unsplash.com/photo-1545208393-2160291bd04e?q=80&w=1200&auto=format&fit=crop'
    },
    {
      label: 'Prana Flow',
      title: 'Master Your Vital Breath',
      description: 'Discover the transformative power of Pranayama. Learn techniques to balance your energy and sharpen your focus.',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop'
    },
    {
      label: 'Dhyana State',
      title: 'Find Your Inner Silence',
      description: 'Journey into deeper states of consciousness with meditation practices rooted in Himalayan tradition.',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  learningPaths: LearningPathCard[] = [
    {
      icon: 'self_improvement',
      title: 'Yogasana Libraries',
      description: 'A detailed database of traditional hatha and ashtanga postures with alignment cues and benefits.',
      route: '/yogasana-library'
    },
    {
      icon: 'air',
      title: 'Pranayam Library',
      description: 'Master the science of breath control with ancient techniques to balance your vital energy and calm the mind.',
      route: '/breathing'
    },
    {
      icon: 'directions_run',
      title: 'Warmup Exercises',
      description: 'Prepare your body for practice with subtle movements (Sukshma Vyayama) to loosen joints and improve flow.'
    },
    {
      icon: 'psychology_alt',
      title: 'Meditation Techniques',
      description: 'Explore various Dhyana methods including mantra, visualization, and mindfulness based on Vedic scriptures.'
    },
    {
      icon: 'grid_view',
      title: 'Various Yoga Sequences',
      description: 'Curated flows for different levels, times of day, and specific goals like flexibility or strength.',
      route: '/sequences-routines'
    },
    {
      icon: 'health_and_safety',
      title: 'Health Based Yoga',
      description: 'Therapeutic yoga sequences targeting specific ailments like back pain, stress, and digestive issues.'
    }
  ];

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.loadUserData();
    this.initGoogleAuth();
    this.themeService.setTheme('yogasanam-dark');
    this.startSlideTimer();
  }

  private startSlideTimer() {
    setInterval(() => {
      this.activeSlideIndex = (this.activeSlideIndex + 1) % this.heroSlides.length;
    }, 6000);
  }

  private loadUserData() {
    const savedUserName = localStorage.getItem('yoga-user-name');
    const savedPicture = localStorage.getItem('yoga-user-picture');
    if (savedUserName) {
      this.userName = savedUserName;
      this.isLoggedIn = true;
    }
    if (savedPicture) {
      this.userPicture = savedPicture;
    }
  }

  initGoogleAuth() {
    if (typeof window === 'undefined') return;

    const checkGsi = () => {
      if (typeof google !== 'undefined' && google.accounts?.id) {
        try {
          google.accounts.id.initialize({
            client_id: this.googleClientId,
            callback: (res: any) => this.handleGoogleResponse(res),
            auto_select: false,
            cancel_on_tap_outside: true
          });
        } catch (e) {
          console.warn('Google Identity initialization error', e);
        }
      } else {
        setTimeout(checkGsi, 300);
      }
    };
    checkGsi();
  }

  handleGoogleResponse(response: any) {
    if (!response?.credential) return;
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      this.userName = payload.name || payload.email.split('@')[0];
      this.userPicture = payload.picture || null;
      this.isLoggedIn = true;
      localStorage.setItem('yoga-user-name', this.userName);
      if (this.userPicture) {
        localStorage.setItem('yoga-user-picture', this.userPicture);
      }
      localStorage.setItem('yoga-user-token', response.credential);
    } catch (e) {
      console.error('Error handling Google response', e);
    }
  }

  signInWithGoogle() {
    if (typeof google !== 'undefined' && google.accounts?.id) {
      google.accounts.id.prompt();
    }
  }

  logout() {
    this.userName = 'Yogi';
    this.userPicture = null;
    this.isLoggedIn = false;
    localStorage.removeItem('yoga-user-name');
    localStorage.removeItem('yoga-user-picture');
    localStorage.removeItem('yoga-user-token');
    if (typeof google !== 'undefined' && google.accounts?.id) {
      try {
        google.accounts.id.disableAutoSelect();
      } catch (e) {}
    }
  }

  openProfile() {
    this.router.navigate(['/settings']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
