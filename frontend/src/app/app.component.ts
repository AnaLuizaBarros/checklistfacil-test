import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TarefaService } from './services/tarefas.service';
import { ITask } from './models/tarefas.interface';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public title: string = 'Todo List';
  public todos: ITask[] = [];
  public newTodoTitle: string = '';
  public isLoading: boolean = true;
  public errorMessage: string | null = null;

  constructor(private tarefaService: TarefaService) {}

  ngOnInit() {
    this.getTarefas();
  }

  private getTarefas(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.tarefaService
      .getTarefas()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data: ITask[]) => {
          this.todos = data;
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage =
            'Falha ao carregar as tarefas. O backend está rodando?';
          console.error('Erro ao carregar tarefas:', err);
        },
      });
  }

  public addTodo(): void {
    if (this.newTodoTitle.trim() === '') return;

    this.isLoading = true;
    this.errorMessage = null;
    this.tarefaService
      .addTarefa(this.newTodoTitle)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response: ITask) => {
          this.todos.push(response);
          this.newTodoTitle = '';
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Falha ao adicionar a tarefa.';
          console.error(err);
        },
      });
  }

  public removeTodo(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.tarefaService
      .deleteTarefa(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: () => {
          this.todos = this.todos.filter((todo) => todo.id !== id);
        },
        error: (err) => {
          this.errorMessage = 'Falha ao remover a tarefa.';
          console.error(err);
        },
      });
  }
}
