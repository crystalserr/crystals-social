import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GLOBAL } from 'src/app/services/global';
import { Follow } from 'src/app/models/follow';

@Injectable({
  providedIn: 'root'
})
export class FollowService {

  public url: string;

  constructor(private _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  // método para seguir a un usuario
  addFollow(token: string, follow: any): Observable<any> {
    let params = JSON.stringify(follow);
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);

    return this._http.post(this.url + 'follow', params, {headers: headers});
  }

  // método para dejar de seguir a un usuario
  deleteFollow(token: string, id: string): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);
    return this._http.delete(this.url + 'follow/' + id, {headers: headers});
  }

  // listar usuarios que estamos siguiendo
  getFollowing(token: string, userId = null, page = 1 ): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);

    var url = this.url + 'following';

    if (userId != null) {
      url = this.url + 'following/' + userId + '/' + page
    }

    return this._http.get(url, {headers: headers});
  }

  // listar usuarios que nos siguen (seguidores)
  getFollowed(token: string, userId = null, page = 1 ): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);

    var url = this.url + 'followed';

    if (userId != null) {
      url = this.url + 'followed/' + userId + '/' + page
    }

    return this._http.get(url, {headers: headers});
  }

  // listado de usuarios que está siguiendo el user loggeado
  getMyFollowing(token): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
									   .set('Authorization', token);

		return this._http.get(this.url+'get-my-follows', {headers: headers});
  }
}
