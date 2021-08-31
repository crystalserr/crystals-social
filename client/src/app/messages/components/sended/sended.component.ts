import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Message } from 'src/app/models/message';
import { Follow } from 'src/app/models/follow';
import { User } from 'src/app/models/user';

import { MessageService } from 'src/app/services/message.service';
import { FollowService } from 'src/app/services/follow.service';
import { UserService } from 'src/app/services/user.service';
import { GLOBAL } from 'src/app/services/global';

@Component({
  selector: 'app-sended',
  templateUrl: './sended.component.html',
  styleUrls: ['./sended.component.css'],
  providers: [
    FollowService,
    MessageService,
    UserService
  ]
})
export class SendedComponent implements OnInit {

  public title: string;
  public url: string;

  public messages: Array<Message>; // Mensajes enviados
  public identity: any;
  public token: string;

  public status: string;
  public mensajeError: string;

  public pages: number;
  public total: number;
  public page: number;
  public next_page: number;
  public prev_page: number;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _followService: FollowService,
    private _messageService: MessageService,
    private _userService: UserService
  ) {
    this.title = 'Mensajes enviados';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
  }

  ngOnInit(): void {
    //console.log('sended.component se ha cargado correctamente');
    this.actualPage();
  }

  actualPage() {
    this._route.params.subscribe(params => {
      //let user_id = params['id'];
      //this.userPageId = user_id; // usuario del que vemos sus seguidores

      let page = +params['page']; // con esto paso la página a numero
      this.page = page;

      if (!params['page']) {
        page = 1;
      }

      if (!page) {
        page = 1;
        this._router.navigate(['/mensajes/enviados', page]); // si mete un texto como parametro va por aqui
      } else {
        this.next_page = page + 1;
        this.prev_page = page - 1;

        if (this.prev_page <= 0) {
          this.prev_page = 1;
        }
      }

      this.getMessages(this.token, this.page);
    });
  }

  getMessages(token: string, page: number) {
    this._messageService.getEmitMessages(token, page).subscribe(
      response => {
        if (response.messages) {
          this.total = response.total;
          this.messages = response.messages;
          this.pages = response.pages;

          if (page > this.pages) {
            //console.log(page)
            this._router.navigate(['/mensajes/enviados', 1]); //si pones una pagina que no existe te lleva a la primera
          }

        }

        //console.log(response);
      },
      error => {
        this.mensajeError = error.error.message;
        console.log(<any>error);
        this.status = 'error';
      }
    )
  }

}
