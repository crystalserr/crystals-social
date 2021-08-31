import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GLOBAL } from 'src/app/services/global';
import { Like } from 'src/app/models/like';

@Injectable({
  providedIn: 'root'
})
export class LikeService {

  public url: string;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  // método gustar una publicacion
  addLike(token: string, publication: any): Observable<any> {
    let params = JSON.stringify(publication);

    //console.log(params);

    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);

    return this._http.post(this.url + 'like', params, {headers: headers});
  }

  // método para dejar de gustar una publicacion
  // id - id de la publicacion que te deja de gustar
  deleteLike(token: string, id: string): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);
    return this._http.delete(this.url + 'like/' + id, {headers: headers});
  }
}
