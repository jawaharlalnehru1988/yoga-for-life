import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonMenuButton, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle, 
  IonCardContent, 
  IonIcon, 
  IonCheckbox,
  IonList, 
  IonItem, 
  IonLabel, 
  IonToggle, 
  IonSelect, 
  IonSelectOption 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  colorPaletteOutline, 
  settingsOutline, 
  moonOutline, 
  notificationsOutline, 
  languageOutline, 
  fitnessOutline, 
  timerOutline, 
  speedometerOutline, 
  informationCircleOutline, 
  helpCircleOutline, 
  documentTextOutline, 
  starOutline, 
  codeOutline 
} from 'ionicons/icons';
import { ThemeService, Theme } from '../services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar, 
    IonButtons, 
    IonMenuButton, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardSubtitle, 
    IonCardContent, 
    IonIcon, 
    IonCheckbox, 
    IonList, 
    IonItem, 
    IonLabel, 
    IonToggle, 
    IonSelect, 
    IonSelectOption,
    CommonModule, 
    FormsModule
  ]
})
export class SettingsPage implements OnInit, OnDestroy {
  themes: Theme[] = [];
  currentTheme: string = '';
  isDarkMode: boolean = false;
  notificationsEnabled: boolean = true;
  selectedLanguage: string = 'en';
  defaultDuration: number = 15;
  practiceLevel: string = 'beginner';

  private themeSubscription?: Subscription;

  constructor(private themeService: ThemeService) {
    addIcons({ 
      colorPaletteOutline, 
      settingsOutline, 
      moonOutline, 
      notificationsOutline, 
      languageOutline, 
      fitnessOutline, 
      timerOutline, 
      speedometerOutline, 
      informationCircleOutline, 
      helpCircleOutline, 
      documentTextOutline, 
      starOutline, 
      codeOutline 
    });
  }

  ngOnInit() {
    this.loadSettings();
    this.themes = this.themeService.getThemes();
    
    // Subscribe to theme changes
    this.themeSubscription = this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
    
    this.isDarkMode = this.themeService.isDarkMode();
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  selectTheme(themeName: string) {
    this.themeService.setTheme(themeName);
    this.saveSettings();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.themeService.toggleDarkMode();
    this.saveSettings();
  }

  toggleNotifications() {
    this.notificationsEnabled = !this.notificationsEnabled;
    this.saveSettings();
    
    // Here you would implement actual notification registration/unregistration
    if (this.notificationsEnabled) {
      this.requestNotificationPermission();
    }
  }

  changeLanguage(event: any) {
    this.selectedLanguage = event.detail.value;
    this.saveSettings();
    
    // Here you would implement language change logic
    console.log('Language changed to:', this.selectedLanguage);
  }

  private loadSettings() {
    // Load settings from localStorage or preferences service
    const settings = localStorage.getItem('yoga-app-settings');
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      this.notificationsEnabled = parsedSettings.notificationsEnabled ?? true;
      this.selectedLanguage = parsedSettings.selectedLanguage ?? 'en';
      this.defaultDuration = parsedSettings.defaultDuration ?? 15;
      this.practiceLevel = parsedSettings.practiceLevel ?? 'beginner';
    }
  }

  private saveSettings() {
    const settings = {
      notificationsEnabled: this.notificationsEnabled,
      selectedLanguage: this.selectedLanguage,
      defaultDuration: this.defaultDuration,
      practiceLevel: this.practiceLevel,
      isDarkMode: this.isDarkMode
    };
    
    localStorage.setItem('yoga-app-settings', JSON.stringify(settings));
  }

  private async requestNotificationPermission() {
    // Implementation for requesting notification permissions
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  }
}
