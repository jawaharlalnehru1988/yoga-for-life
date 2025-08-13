import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ChallengesService, Challenge, UserChallengeProgress } from '../shared/challenges.service';

@Component({
  selector: 'app-challenges',
  templateUrl: './challenges.page.html',
  styleUrls: ['./challenges.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ChallengesPage implements OnInit {

  selectedTab = 'discover';
  allChallenges: Challenge[] = [];
  featuredChallenges: Challenge[] = [];
  userProgress: { [challengeId: string]: UserChallengeProgress } = {};

  constructor(
    private router: Router,
    private challengesService: ChallengesService
  ) {}

  ngOnInit() {
    this.loadChallenges();
    this.loadUserProgress();
  }

  private loadChallenges() {
    this.challengesService.getAllChallenges().subscribe(challenges => {
      this.allChallenges = challenges;
      this.featuredChallenges = challenges.filter(c => c.isFeatured);
    });
  }

  private loadUserProgress() {
    this.challengesService.userProgress$.subscribe(progress => {
      this.userProgress = progress;
    });
  }

  openChallenge(challenge: Challenge) {
    this.router.navigate(['/challenge-detail', challenge._id]);
  }

  openChallengeById(challengeId: string) {
    this.router.navigate(['/challenge-detail', challengeId]);
  }

  joinChallenge(challenge: Challenge) {
    this.challengesService.joinChallenge(challenge._id);
  }

  getUserProgress(challengeId: string): UserChallengeProgress | undefined {
    return this.userProgress[challengeId];
  }

  getCompletedGoalValue(challengeId: string, goalId: string): number {
    const progress = this.userProgress[challengeId];
    return progress?.goalProgress?.[goalId] || 0;
  }

  getDiscoverChallenges(): Challenge[] {
    return this.allChallenges.filter(challenge => !this.userProgress[challenge._id]?.isJoined);
  }

  getActiveChallenges(): Challenge[] {
    return this.allChallenges.filter(challenge => 
      this.userProgress[challenge._id]?.isJoined && !this.userProgress[challenge._id]?.isCompleted
    );
  }

  getCompletedChallenges(): Challenge[] {
    return this.allChallenges.filter(challenge => this.userProgress[challenge._id]?.isCompleted);
  }
}
