import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-sequence-builder',
  templateUrl: './sequence-builder.page.html',
  styleUrls: ['./sequence-builder.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class SequenceBuilderPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
