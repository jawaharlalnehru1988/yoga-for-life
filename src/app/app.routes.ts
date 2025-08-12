import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then( m => m.HomePage)
  },
  {
    path: 'yogasana-library',
    loadComponent: () => import('./yogasana-library/yogasana-library.page').then( m => m.YogasanaLibraryPage)
  },
  {
    path: 'sequences-routines',
    loadComponent: () => import('./sequences-routines/sequences-routines.page').then( m => m.SequencesRoutinesPage)
  },
  {
    path: 'meditation',
    loadComponent: () => import('./meditation/meditation.page').then( m => m.MeditationPage)
  },
  {
    path: 'breathing',
    loadComponent: () => import('./breathing/breathing.page').then( m => m.BreathingPage)
  },
  {
    path: 'challenges',
    loadComponent: () => import('./challenges/challenges.page').then( m => m.ChallengesPage)
  },
  {
    path: 'my-progress',
    loadComponent: () => import('./my-progress/my-progress.page').then( m => m.MyProgressPage)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./favorites/favorites.page').then( m => m.FavoritesPage)
  },
  {
    path: 'daily-tips',
    loadComponent: () => import('./daily-tips/daily-tips.page').then( m => m.DailyTipsPage)
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings.page').then( m => m.SettingsPage)
  },
  {
    path: 'pose-detail/:id',
    loadComponent: () => import('./pose-detail/pose-detail.page').then( m => m.PoseDetailPage)
  },
];
