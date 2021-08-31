import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GLOBAL } from 'src/app/services/global';
import { User } from 'src/app/models/user';

@Injectable()
export class UserService {

  public url: string; // la url de nuestro backend
  public identity: any; // objeto del usuario identificado
  public token: string; // token del usuario
  public stats: any; // estadisticas del usuario

  constructor(public _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  // Método de registro de usuarios
  register(user: User): Observable<any> {
    let params = JSON.stringify(user); // convierte el objeto de a un string de un json
    // los params que van por el body de una peticion por post
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http.post(this.url + 'register', params, {headers: headers});
  }

  //Método de login de usuarios
  login(user: any, gettoken = null): Observable<any> {
    if (gettoken != null) {
      user.gettoken = gettoken;
    }

    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http.post(this.url + 'login', params, {headers: headers});
  }

  // Método que genera el email de contraseña olvidada
  forgotPassword(user: User) {
    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http.put(this.url + 'forgot-password', params, {headers: headers});
  }

  // metodo que restablece la contraseña
  newPassword(user: User, token: string) {
    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);

    return this._http.put(this.url + 'new-password', params, {headers: headers});
  }

  // metodo que cambia la contraseña de un usuario cuando este tiene la sesión iniciada
  changePassword(user: User) {
    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', this.getToken());

    return this._http.put(this.url + 'change-password/' + user._id, params, {headers: headers});
  }

  // Método de logout - limpia el localStorage
  logout() {
    localStorage.clear(); // limpiamos todo lo que hay en el localstorage
    return null; // establecemos la identity a null
  }

  // Método que actualiza la información de usuario
  updateUser(user: User): Observable<any> {
    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', this.getToken());

    return this._http.put(this.url + 'update-user/' + user._id, params, {headers: headers});
  }


  // Recupera la propiedad identity del LocalStorage
  getIdentity() {
    let identity = JSON.parse(localStorage.getItem('identity'));

    if (identity != "undefined") {
      this.identity = identity;
    } else {
      this.identity = null;
    }

    return this.identity;
  }

  // Recupera la propiedad token del LocalStorage
  getToken() {
    let token = localStorage.getItem('token');

    if (token != "undefined") {
      this.token = token;
    } else {
      this.token = null;
    }

    return this.token;
  }

  // obtiene las estadisticas de los usuarios del localstorage
  // following, followed y publications
  getStats() {
    let stats = JSON.parse(localStorage.getItem('stats'));

    if (stats != "undefined") {
      this.stats = stats;
    } else {
      this.stats = null;
    }

    return this.stats;
  }

  // obtiene las estadisticas de los usuarios de la base de datos
  getCounters(userId = null): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                    .set('Authorization', this.getToken());

    if (userId != null) {
      return this._http.get(this.url + 'counters/' + userId, {headers: headers});
    } else {
      return this._http.get(this.url + 'counters', {headers: headers});
    }
  }

  // obtiene el listado de usuarios paginado de la api - db
  getUsers(page = null): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', this.getToken());

    return this._http.get(this.url + 'users/' + page, {headers: headers});
  }

  // obtiene el listado de usuarios sin paginar de la api - db
  getAllUsers(): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', this.getToken());

    return this._http.get(this.url + 'all-users', {headers: headers});
  }

  // obtiene un usuario de la api - db con el id
  getUser(id = null): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', this.getToken());

    return this._http.get(this.url + 'user/' + id, {headers: headers});
  }

  // obtiene un usuario de la api - db con el nick
  getUserNick(nick = null): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', this.getToken());

    return this._http.get(this.url + 'user-nick/' + nick, {headers: headers});
  }

}
