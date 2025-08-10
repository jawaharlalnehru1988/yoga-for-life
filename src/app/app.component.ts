
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterOutlet, IonRouterLink } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { homeOutline, homeSharp, libraryOutline, librarySharp, listOutline, listSharp, leafOutline, leafSharp, airplaneOutline, airplaneSharp, ribbonOutline, ribbonSharp, statsChartOutline, statsChartSharp, heartOutline, heartSharp, bulbOutline, bulbSharp, settingsOutline, settingsSharp } from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [RouterLink, RouterLinkActive, IonApp, IonSplitPane, IonMenu, IonContent, IonList, IonListHeader, IonNote, IonMenuToggle, IonItem, IonIcon, IonLabel, IonRouterLink, IonRouterOutlet],
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'Yogasana Library', url: '/yogasana-library', icon: 'library' },
    { title: 'Sequences / Routines', url: '/sequences-routines', icon: 'list' },
    { title: 'Meditation', url: '/meditation', icon: 'leaf' },
    { title: 'Breathing Exercises', url: '/breathing', icon: 'airplane' },
    { title: 'Challenges', url: '/challenges', icon: 'ribbon' },
    { title: 'My Progress', url: '/my-progress', icon: 'stats-chart' },
    { title: 'Favorites', url: '/favorites', icon: 'heart' },
    { title: 'Daily Tips', url: '/daily-tips', icon: 'bulb' },
    { title: 'Settings', url: '/settings', icon: 'settings' },
  ];
  public labels = ['Beginner', 'Intermediate', 'Advanced', 'Flexibility', 'Strength', 'Relaxation'];
  constructor() {
    addIcons({ homeOutline, homeSharp, libraryOutline, librarySharp, listOutline, listSharp, leafOutline, leafSharp, airplaneOutline, airplaneSharp, ribbonOutline, ribbonSharp, statsChartOutline, statsChartSharp, heartOutline, heartSharp, bulbOutline, bulbSharp, settingsOutline, settingsSharp });
  }
}
