import { environment } from './../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ITask } from '../models/tarefas.interface';

@Injectable({ providedIn: 'root' })
export class TarefaService {
  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTarefas(): Observable<ITask[]> {
    return this.http.get<ITask[]>(this.apiUrl);
  }

  addTarefa(title: string): Observable<ITask> {
    return this.http.post<ITask>(`${this.apiUrl}`, { title: title });
  }

  deleteTarefa(idTarefa: number): Observable<ITask> {
    return this.http.delete<ITask>(`${this.apiUrl}/${idTarefa}`);
  }
}
