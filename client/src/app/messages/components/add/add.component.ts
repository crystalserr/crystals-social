import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Message } from 'src/app/models/message';
import { Follow } from 'src/app/models/follow';
import { User } from 'src/app/models/user';

import { MessageService } from 'src/app/services/message.service';
import { FollowService } from 'src/app/services/follow.service';
import { UserService } from 'src/app/services/user.service';
import { GLOBAL } from 'src/app/services/global';

import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
  providers: [
    FollowService,
    MessageService,
    UserService
  ]
})
export class AddComponent implements OnInit {

  public title: string;
  public url: string;

  public message: Message;
  public receiverUser: User; // usuario al que se envia el mensaje
  //public follows; // usuarios que nosotros seguimos a los que podemos enviar el mensaje
  public users: any;
  public identity: any;
  public token: string;

  public replyUser: any;
  //public user_receiver: User;

  public status: string;
  public mensajeError: string;

  messageForm = new FormGroup({
    receiver: new FormControl('', [Validators.required]),
    text: new FormControl('', [Validators.required])
  });

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _followService: FollowService,
    private _messageService: MessageService,
    private _userService: UserService
  ) {
    this.title = 'Nuevo mensaje';
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
    // si al final this.identity es unicamente el id del usuario no seria necesario poner _id
    // salvo que this.identity llame a el metodo getuser del user service con el id del localstorage
    this.message = new Message("", "", "", "", this.identity._id, "");
  }

  ngOnInit(): void {

    console.log('add.component se ha cargado correctamente');
    this._route.params.subscribe(params => {
      this.replyUser = params['nick'];
    });
    console.log(this.replyUser);

    if (this.replyUser != undefined && this.replyUser != this.identity.nick) {

      this._userService.getUserNick(this.replyUser).subscribe(
        response => {

          //console.log();
          this.messageForm.controls.receiver.setValue(response.user._id);

        }, error => {
          this.mensajeError = error.error.message;
          console.log(<any>error);

          if (this.mensajeError != null) {
            this.status = 'error';
          }
        }
      );
    } else {
      this.replyUser = undefined; // para que no pueda mandarse mensajes a si mismo
    }

    // Con esto detecto el cambio de usuario
    this.messageForm.get('receiver').valueChanges.subscribe((value) => {
      if (value) {
        this._userService.getUser(value).subscribe(
          response => {
            //console.log(response.user);
            this.replyUser = response.user;
          }, error => {
            this.mensajeError = error.error.message;
            console.log(<any>error);

            if (this.mensajeError != null) {
              this.status = 'error';
            }
          }
        );
      }
      //console.log(value);
    });

    this.getUsers();
  }

  get text() {
    return this.messageForm.get('text');
  }

  get receiver() {
    return this.messageForm.get('receiver');
  }

  onSubmit() {
    this.message.receiver = this.messageForm.get('receiver').value;
    this.message.text = this.messageForm.get('text').value;

    this._messageService.addMessage(this.token, this.message).subscribe(
      response => {
        if (response.message) {
          this.status = 'success';
          this.messageForm.reset();
          this.replyUser = undefined;
        }
      },
      error => {
        this.mensajeError = error.error.message;
        console.log(<any>error);

        if (this.mensajeError != null) {
          this.status = 'error';
        }
      }
    );

    console.log(this.message);
  }

  // listado de los usuarios que está siguiendo el usuario loggeado
  getUsers() {
    // todos los usuarios de la web
    this._userService.getAllUsers().subscribe(
      response => {
        console.log(response.users);
        this.users = response.users;

        this.users.forEach((user, index) => {
          if (user._id == this.identity._id) {
            this.users.splice(index, 1); // eliminamos al propio usuario del array de usuarios
            // para que no se envie mensajes a si mismo
          }
        });
      },
      error => {
        this.mensajeError = error.error.message;
        console.log(<any>error);

        if (this.mensajeError != null) {
          this.status = 'error';
        }
      }
    );

    // solo los usuarios que esta siguiendo el usuario loggeado
    /*this._followService.getMyFollowing(this.token).subscribe(
			response => {
				this.users = response.follows;
        console.log(response.follows)
			},
			error => {
				console.log(<any>error);
			}
		);*/
  }

}
