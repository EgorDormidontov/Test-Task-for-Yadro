import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NzButtonModule,
    NzCardModule,
    NzEmptyModule,
    NzInputModule,
    NzPopconfirmModule,
    NzSpaceModule,
    NzTableModule,
    NzTagModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchValue = '';
  loading = false;

  constructor(
    private readonly userService: UserService,
    private readonly message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message.error('Не удалось загрузить пользователей');
      }
    });
  }

  applyFilter(): void {
    const value = this.searchValue.trim().toLowerCase();

    if (!value) {
      this.filteredUsers = [...this.users];
      return;
    }

    this.filteredUsers = this.users.filter((user) => {
      const name = user.name.toLowerCase();
      const email = user.email.toLowerCase();

      return name.includes(value) || email.includes(value);
    });
  }

  resetFilter(): void {
    this.searchValue = '';
    this.applyFilter();
  }

  deleteUser(id?: number): void {
    if (!id) {
      return;
    }

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter((user) => user.id !== id);
        this.applyFilter();
        this.message.success('Пользователь удалён');
      },
      error: () => {
        this.message.error('Не удалось удалить пользователя');
      }
    });
  }
}
