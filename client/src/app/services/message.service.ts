import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { GLOBAL } from 'src/app/services/global';
import { Message } from 'src/app/models/message';

@Injectable()
export class MessageService {

  public url: string; // la url de nuestro backend

  constructor(public _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  // Enviar / añadir un nuevo mensaje
  addMessage(token: string, message: any): Observable<any> {
    let params = JSON.stringify(message);
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);

    return this._http.post(this.url + 'message', params, {headers: headers});
  }

  // Lista los mensajes recibidos
  getMyMessages(token: string, page = 1): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);
    return this._http.get(this.url + 'my-messages/' + page, {headers: headers});
  }

  // Lista los mensajes enviados
  getEmitMessages(token: string, page = 1): Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);
    return this._http.get(this.url + 'messages/' + page, {headers: headers});
  }

}
