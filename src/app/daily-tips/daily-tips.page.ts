import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-daily-tips',
  templateUrl: './daily-tips.page.html',
  styleUrls: ['./daily-tips.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DailyTipsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
