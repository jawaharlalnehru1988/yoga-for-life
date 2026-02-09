import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { ThemeService } from '../services/theme.service';

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
  activeSlideIndex = 0;

  heroSlides: HeroSlide[] = [
    {
      label: 'Vedic Wisdom',
      title: 'Embrace the Path of Patanjali',
      description: 'A traditional approach to modern wellness. Unlock the secrets of the ancient Yoga Sutras through guided practice and meditation.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-rnTZsNK_1Tr3X6KJDqW3jubkVviYBsHWdhEhaJSNMNyR7QbbShkr-3ikRwgBOo3AT1NPDoQKjtS7oFkwQOA5lvhy6Ys0f9eudbFICNo55xVdUZ133PULqBacdIF0jd05tXXxn23YCZCROXXQE7LX6pOK-RHJC_ue5FhsNofIhSktEuuHdwfbkE8EJsLj4m-vGWWJ3A7_uyrItAx0BDW4p94zJZy1COdP3Iw3eyqk-dK-XlJ8DoIcCkwapHBfQylOrhdl9R2BTSY'
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
    if (savedUserName) {
      this.userName = savedUserName;
    }
  }

  openProfile() {
    this.router.navigate(['/settings']);
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
