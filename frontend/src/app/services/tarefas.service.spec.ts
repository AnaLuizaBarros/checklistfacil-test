import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ITask } from '../models/tarefas.interface';
import { TarefaService } from './tarefas.service';
import { environment } from '../environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

describe('TarefaService', () => {
  let service: TarefaService;
  let httpTestingController: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockTarefas: ITask[] = [
    { id: 1, title: 'Tarefa 1', completed: false },
    { id: 2, title: 'Tarefa 2', completed: true },
    { id: 3, title: 'Tarefa 3', completed: false },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TarefaService],
    });

    service = TestBed.inject(TarefaService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('Deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('getTarefas', () => {
    it('Deve retornar a lista de tarefas com sucesso', (done: DoneFn) => {
      service.getTarefas().subscribe((tarefas) => {
        expect(tarefas).toEqual(mockTarefas);
        done();
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTarefas);
    });

    it('Deve tratar os erros da requisição HTTP', (done: DoneFn) => {
      service.getTarefas().subscribe({
        next: () => fail('Deve ter um erro 500'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Erro Interno do Servidor');
          done();
        },
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush('Mensagem de erro do servidor', {
        status: 500,
        statusText: 'Erro Interno do Servidor',
      });
    });
  });

  describe('addTarefa', () => {
    it('Deve adicionar uma nova tarefa com sucesso', (done: DoneFn) => {
      const newTask: ITask = {
        id: 3,
        title: 'Tarefa Teste',
        completed: false,
      };

      service.addTarefa(newTask.title).subscribe((addedTask) => {
        expect(addedTask).toEqual(newTask);
        done();
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ title: newTask.title });
      req.flush(newTask);
    });
    it('Deve lidar com um erro HTTP ao tentar adicionar uma tarefa', (done: DoneFn) => {
      const taskTitle = 'Tarefa que vai falhar';

      service.addTarefa(taskTitle).subscribe({
        next: () => fail('A chamada deveria ter falhado com um erro HTTP'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(error.statusText).toBe('Erro Interno do Servidor');
          done();
        },
      });

      const req = httpTestingController.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush('Mensagem de erro do servidor', {
        status: 500,
        statusText: 'Erro Interno do Servidor',
      });
    });
  });

  describe('deleteTarefa', () => {
    it('Deve excluir a tarefa com sucesso', (done: DoneFn) => {
      const idToDelete = 1;

      service.deleteTarefa(idToDelete).subscribe({
        next: () => {
          expect().nothing();
          done();
        },
        error: () =>
          fail('A deleção deveria ter sido bem-sucedida, mas falhou.'),
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${idToDelete}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('Deve tratar o erro 404 ao tentar deletar uma tarefa não existente', (done: DoneFn) => {
      const nonExistentId = 999;

      service.deleteTarefa(nonExistentId).subscribe({
        next: () => fail('Deve ter um erro 404'),
        error: (error) => {
          expect(error.status).toBe(404);
          done();
        },
      });

      const req = httpTestingController.expectOne(`${apiUrl}/${nonExistentId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush('Não encontrado', {
        status: 404,
        statusText: 'Não encontrado',
      });
    });
  });
});
