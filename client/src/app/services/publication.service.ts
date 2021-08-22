import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GLOBAL } from 'src/app/services/global';
import { Publication } from 'src/app/models/publication';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {

  public url: string;

  constructor(
    private _http: HttpClient
  ) {
    this.url = GLOBAL.url;
  }

  // Método para guardar una publicación
  addPublication(token: string, publication: any): Observable<any> {
    let params = JSON.stringify(publication);
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);

    console.log(params);

    return this._http.post(this.url + 'publication', params, {headers: headers});
  }

  // Método para listar las publicaciones de los usuarios que seguimos - Timeline
  getPublications(token: string, page = 1): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
      .set('Authorization', token);
    return this._http.get(this.url + 'publications/' + page, { headers: headers });
  }

  // Método para listar las publicaciones de los usuarios que seguimos - Timeline
  getUserPublications(token: string, user_id: string, page = 1): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
      .set('Authorization', token);
    return this._http.get(this.url + 'publications-user/' + user_id + '/' + page, { headers: headers });
  }

  // Método para eliminar una publicación
  deletePublication(token: string, idPublication): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);
    return this._http.delete(this.url + 'publication/' + idPublication, {headers: headers});
  }

}
