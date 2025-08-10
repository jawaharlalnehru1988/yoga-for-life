import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-sequences-routines',
  templateUrl: './sequences-routines.page.html',
  styleUrls: ['./sequences-routines.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SequencesRoutinesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
