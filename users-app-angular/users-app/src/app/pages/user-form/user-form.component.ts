import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    NzButtonModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzSpinModule
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    username: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    website: ['']
  });

  userId?: number;
  isEditMode = false;
  loading = false;
  saving = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly message: NzMessageService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (id) {
      this.userId = id;
      this.isEditMode = true;
      this.loadUser(id);
    }
  }

  loadUser(id: number): void {
    this.loading = true;

    this.userService.getUserById(id).subscribe({
      next: user => {
        this.form.patchValue({
          name: user.name ?? '',
          username: user.username ?? '',
          email: user.email ?? '',
          phone: user.phone ?? '',
          website: user.website ?? ''
        });

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message.error('Не удалось загрузить пользователя');
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user: User = {
      name: this.form.controls.name.value,
      username: this.form.controls.username.value,
      email: this.form.controls.email.value,
      phone: this.form.controls.phone.value,
      website: this.form.controls.website.value
    };

    this.saving = true;

    if (this.isEditMode && this.userId) {
      this.userService.updateUser(this.userId, user).subscribe({
        next: () => {
          this.saving = false;
          this.message.success('Пользователь обновлён');
          this.router.navigate(['/users']);
        },
        error: () => {
          this.saving = false;
          this.message.error('Ошибка при обновлении пользователя');
        }
      });

      return;
    }

    this.userService.createUser(user).subscribe({
      next: () => {
        this.saving = false;
        this.message.success('Пользователь создан');
        this.router.navigate(['/users']);
      },
      error: () => {
        this.saving = false;
        this.message.error('Ошибка при создании пользователя');
      }
    });
  }
}