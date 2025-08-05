import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TarefaService } from './services/tarefas.service';
import { ITask } from './models/tarefas.interface';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let tarefaService: TarefaService;

  const mockTasks: ITask[] = [
    { id: 1, title: 'Tarefa 1', completed: false },
    { id: 2, title: 'Tarefa 2', completed: true },
    { id: 3, title: 'Tarefa 3', completed: false },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule, FormsModule],
      providers: [TarefaService],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    tarefaService = TestBed.inject(TarefaService);
  });

  it('deve ser criado com sucesso', () => {
    expect(component).toBeTruthy();
  });

  describe('getTarefas', () => {
    it('Deve carregar as tarefas com sucesso na inicialização', fakeAsync(() => {
      spyOn(tarefaService, 'getTarefas').and.returnValue(of(mockTasks));
      fixture.detectChanges();
      tick();
      expect(component.isLoading).toBe(false);
      expect(component.todos.length).toBe(3);
      expect(component.errorMessage).toBeNull();
    }));

    it('Deve definir uma mensagem de erro se o serviço falhar', fakeAsync(() => {
      const errorResponse = new HttpErrorResponse({ status: 500 });
      spyOn(tarefaService, 'getTarefas').and.returnValue(
        throwError(() => errorResponse)
      );
      fixture.detectChanges();
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.todos.length).toBe(0);
      expect(component.errorMessage).toBe(
        'Falha ao carregar as tarefas. O backend está rodando?'
      );
    }));
    it('Deve exibir a mensagem "Nenhuma tarefa encontrada" quando a lista retorna vazia', fakeAsync(() => {
      spyOn(tarefaService, 'getTarefas').and.returnValue(of([]));
      fixture.detectChanges();
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.todos.length).toBe(0);
      expect(component.errorMessage).toBeNull();

      const compiled = fixture.nativeElement as HTMLElement;
      const feedbackElement = compiled.querySelector('.feedback-message');

      expect(feedbackElement).toBeTruthy();
      expect(feedbackElement?.textContent).toContain(
        'Nenhuma tarefa encontrada'
      );
    }));
  });

  describe('addTodo', () => {
    it('Deve adicionar uma nova tarefa e limpar o input', fakeAsync(() => {
      component.todos = [...mockTasks];
      const newTask: ITask = { id: 4, title: 'Nova Tarefa', completed: false };
      spyOn(tarefaService, 'addTarefa').and.returnValue(of(newTask));
      component.newTodoTitle = newTask.title;

      component.addTodo();
      tick();

      expect(tarefaService.addTarefa).toHaveBeenCalledWith(newTask.title);
      expect(component.todos.length).toBe(4);
      expect(component.newTodoTitle).toBe('');
      expect(component.isLoading).toBe(false);
    }));

    it('Não deve adicionar a tarefa se o título estiver vazio', () => {
      const addSpy = spyOn(tarefaService, 'addTarefa');
      component.newTodoTitle = '   ';
      component.addTodo();
      expect(addSpy).not.toHaveBeenCalled();
    });

    it('Deve exibir uma mensagem de erro se o serviço falhar', fakeAsync(() => {
      const errorResponse = new HttpErrorResponse({ status: 500 });
      spyOn(tarefaService, 'addTarefa').and.returnValue(
        throwError(() => errorResponse)
      );
      component.newTodoTitle = 'Tarefa que vai falhar';

      component.addTodo();
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Falha ao adicionar a tarefa.');
      expect(component.todos.length).toBe(0);
    }));
  });

  describe('removeTodo', () => {
    it('Deve remover a tarefa da lista com sucesso', fakeAsync(() => {
      component.todos = [...mockTasks];
      const mockDeletedTask: ITask = component.todos[0];
      spyOn(tarefaService, 'deleteTarefa').and.returnValue(of(mockDeletedTask));

      component.removeTodo(1);
      tick();

      expect(tarefaService.deleteTarefa).toHaveBeenCalledWith(1);
      expect(component.todos.length).toBe(2);
      expect(component.isLoading).toBe(false);
    }));

    it('Deve exibir uma mensagem de erro se o serviço falhar', fakeAsync(() => {
      component.todos = [...mockTasks];
      const errorResponse = new HttpErrorResponse({ status: 404 });
      spyOn(tarefaService, 'deleteTarefa').and.returnValue(
        throwError(() => errorResponse)
      );

      component.removeTodo(1);
      tick();

      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Falha ao remover a tarefa.');
      expect(component.todos.length).toBe(3);
    }));
  });
});
