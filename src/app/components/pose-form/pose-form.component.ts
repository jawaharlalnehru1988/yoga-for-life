import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonChip,
  IonCard,
  IonCardContent,
  IonNote,
  IonSpinner,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  closeOutline,
  saveOutline,
  addOutline,
  removeOutline,
  cameraOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

export interface YogaPose {
  _id?: string;
  name: string;
  sanskritName?: string;
  description: string;
  benefits: string[];
  instructions: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  category: string;
  tags: string[];
  precautions?: string[];
  modifications?: string[];
  imageUrl?: string;
  quickBenefit: string;
  bodyParts: string[];
  breathingTechnique?: string;
  chakras?: string[];
}

@Component({
  selector: 'app-pose-form',
  templateUrl: './pose-form.component.html',
  styleUrls: ['./pose-form.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonCheckbox,
    IonChip,
    IonCard,
    IonNote,
    IonCardContent,
    IonSpinner,
    CommonModule,
    ReactiveFormsModule
  ]
})
export class PoseFormComponent implements OnInit {
  @Input() pose?: YogaPose;
  @Input() isEdit: boolean = false;
  @Output() poseSubmitted = new EventEmitter<YogaPose>();
  @Output() cancelled = new EventEmitter<void>();

  poseForm: FormGroup;
  isSubmitting = false;
  
  // Form option data
  difficultyOptions = ['Beginner', 'Intermediate', 'Advanced'];
  categoryOptions = [
    'Standing Poses',
    'Seated Poses',
    'Backbends',
    'Forward Folds',
    'Twists',
    'Arm Balances',
    'Inversions',
    'Hip Openers',
    'Core',
    'Relaxation',
    'Sun Salutations',
    'Pranayama'
  ];
  
  bodyPartOptions = [
    'Arms', 'Legs', 'Core', 'Back', 'Shoulders', 'Hips', 
    'Spine', 'Chest', 'Neck', 'Ankles', 'Wrists', 'Hamstrings',
    'Quadriceps', 'Glutes', 'Calves'
  ];

  chakraOptions = [
    'Root Chakra', 'Sacral Chakra', 'Solar Plexus Chakra',
    'Heart Chakra', 'Throat Chakra', 'Third Eye Chakra', 'Crown Chakra'
  ];

  // Dynamic arrays for form management
  benefits: string[] = [];
  instructions: string[] = [];
  tags: string[] = [];
  precautions: string[] = [];
  modifications: string[] = [];
  selectedBodyParts: string[] = [];
  selectedChakras: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController
  ) {
    addIcons({
      closeOutline,
      saveOutline,
      addOutline,
      removeOutline,
      cameraOutline,
      checkmarkCircleOutline
    });

    this.poseForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      sanskritName: [''],
      description: ['', [Validators.required, Validators.minLength(10)]],
      quickBenefit: ['', [Validators.required, Validators.minLength(5)]],
      difficulty: ['Beginner', Validators.required],
      duration: ['', Validators.required],
      category: ['', Validators.required],
      imageUrl: [''],
      breathingTechnique: [''],
      newBenefit: [''],
      newInstruction: [''],
      newTag: [''],
      newPrecaution: [''],
      newModification: ['']
    });
  }

  ngOnInit() {
    if (this.pose && this.isEdit) {
      this.loadPoseData();
    }
  }

  loadPoseData() {
    if (!this.pose) return;

    this.poseForm.patchValue({
      name: this.pose.name,
      sanskritName: this.pose.sanskritName || '',
      description: this.pose.description,
      quickBenefit: this.pose.quickBenefit,
      difficulty: this.pose.difficulty,
      duration: this.pose.duration,
      category: this.pose.category,
      imageUrl: this.pose.imageUrl || '',
      breathingTechnique: this.pose.breathingTechnique || ''
    });

    this.benefits = [...(this.pose.benefits || [])];
    this.instructions = [...(this.pose.instructions || [])];
    this.tags = [...(this.pose.tags || [])];
    this.precautions = [...(this.pose.precautions || [])];
    this.modifications = [...(this.pose.modifications || [])];
    this.selectedBodyParts = [...(this.pose.bodyParts || [])];
    this.selectedChakras = [...(this.pose.chakras || [])];
  }

  // Dynamic array management methods
  addBenefit() {
    const benefit = this.poseForm.get('newBenefit')?.value?.trim();
    if (benefit && !this.benefits.includes(benefit)) {
      this.benefits.push(benefit);
      this.poseForm.get('newBenefit')?.setValue('');
    }
  }

  removeBenefit(index: number) {
    this.benefits.splice(index, 1);
  }

  addInstruction() {
    const instruction = this.poseForm.get('newInstruction')?.value?.trim();
    if (instruction && !this.instructions.includes(instruction)) {
      this.instructions.push(instruction);
      this.poseForm.get('newInstruction')?.setValue('');
    }
  }

  removeInstruction(index: number) {
    this.instructions.splice(index, 1);
  }

  addTag() {
    const tag = this.poseForm.get('newTag')?.value?.trim();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.poseForm.get('newTag')?.setValue('');
    }
  }

  removeTag(index: number) {
    this.tags.splice(index, 1);
  }

  addPrecaution() {
    const precaution = this.poseForm.get('newPrecaution')?.value?.trim();
    if (precaution && !this.precautions.includes(precaution)) {
      this.precautions.push(precaution);
      this.poseForm.get('newPrecaution')?.setValue('');
    }
  }

  removePrecaution(index: number) {
    this.precautions.splice(index, 1);
  }

  addModification() {
    const modification = this.poseForm.get('newModification')?.value?.trim();
    if (modification && !this.modifications.includes(modification)) {
      this.modifications.push(modification);
      this.poseForm.get('newModification')?.setValue('');
    }
  }

  removeModification(index: number) {
    this.modifications.splice(index, 1);
  }

  toggleBodyPart(bodyPart: string) {
    const index = this.selectedBodyParts.indexOf(bodyPart);
    if (index > -1) {
      this.selectedBodyParts.splice(index, 1);
    } else {
      this.selectedBodyParts.push(bodyPart);
    }
  }

  isBodyPartSelected(bodyPart: string): boolean {
    return this.selectedBodyParts.includes(bodyPart);
  }

  toggleChakra(chakra: string) {
    const index = this.selectedChakras.indexOf(chakra);
    if (index > -1) {
      this.selectedChakras.splice(index, 1);
    } else {
      this.selectedChakras.push(chakra);
    }
  }

  isChakraSelected(chakra: string): boolean {
    return this.selectedChakras.includes(chakra);
  }

  async onSubmit() {
    if (this.poseForm.valid) {
      this.isSubmitting = true;

      const formValue = this.poseForm.value;
      const poseData: YogaPose = {
        name: formValue.name,
        sanskritName: formValue.sanskritName,
        description: formValue.description,
        quickBenefit: formValue.quickBenefit,
        difficulty: formValue.difficulty,
        duration: formValue.duration,
        category: formValue.category,
        imageUrl: formValue.imageUrl,
        breathingTechnique: formValue.breathingTechnique,
        benefits: [...this.benefits],
        instructions: [...this.instructions],
        tags: [...this.tags],
        precautions: [...this.precautions],
        modifications: [...this.modifications],
        bodyParts: [...this.selectedBodyParts],
        chakras: [...this.selectedChakras]
      };

      if (this.isEdit && this.pose?._id) {
        poseData._id = this.pose._id;
      }

      try {
        this.poseSubmitted.emit(poseData);
        await this.modalController.dismiss(poseData);
      } catch (error) {
        console.error('Error submitting pose:', error);
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.poseForm.controls).forEach(key => {
      const control = this.poseForm.get(key);
      control?.markAsTouched();
    });
  }

  async onCancel() {
    this.cancelled.emit();
    await this.modalController.dismiss();
  }

  getFieldError(fieldName: string): string {
    const field = this.poseForm.get(fieldName);
    if (field?.errors && field?.touched) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.poseForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
