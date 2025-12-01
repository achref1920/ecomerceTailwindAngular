import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api.response';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private baseUrl = `${environment.apiUrl}/api/users`;

    constructor(private http: HttpClient) {}

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    getUser(): Observable<User> {
        return this.http.get<User>(`${this.baseUrl}/me`, { headers: this.getAuthHeaders() });
    }

    updateUser(user: User): Observable<ApiResponse<any>> {
        return this.http.put<ApiResponse<any>>(`${this.baseUrl}/${user.id}`, user, { headers: this.getAuthHeaders() });
    }

    getUsers(): Observable<ApiResponse<User[]>> {
        return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}`, { headers: this.getAuthHeaders() });
    }

    deleteUser(id: number): Observable<ApiResponse<any>> {
        return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
    }
}