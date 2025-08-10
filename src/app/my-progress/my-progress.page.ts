import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-my-progress',
  templateUrl: './my-progress.page.html',
  styleUrls: ['./my-progress.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MyProgressPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
