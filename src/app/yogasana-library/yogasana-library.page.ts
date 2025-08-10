import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-yogasana-library',
  templateUrl: './yogasana-library.page.html',
  styleUrls: ['./yogasana-library.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class YogasanaLibraryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
