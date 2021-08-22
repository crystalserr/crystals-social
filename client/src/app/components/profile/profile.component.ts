import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { User } from 'src/app/models/user';
import { Follow } from 'src/app/models/follow';

import { GLOBAL } from 'src/app/services/global';
import { UserService } from 'src/app/services/user.service';
import { FollowService } from 'src/app/services/follow.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public url: string;

  public user: User; // usuario del que vamos a mostrar el perfil
  public identity: any; // usuario loggeado
  public token: string;
  public stats: any; // estadisticas del usuario del perfil

  public status: string;
  public mensajeError: string;

  public following: boolean; // si seguimos a ese usuario
  public followed: boolean; // si ese usuario nos sigue

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _followService: FollowService
  ) {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;

    this.following = false;
    this.followed = false;

    // para que recarge el ngOnInit cuando se trate de la misma ruta pero con distintos parámetros
    this._router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    }
  }

  ngOnInit(): void {
    console.log("componente de perfil cargado correctamente");
    this.loadPage();
  }

  // Método para cargar el perfil del usuario que queremos ver

  // poder buscar por nickname, que busque el usuario cuyo nick es ese
  // luego que obtenga el id de ese usuario
  // y se lo pase a los demas metodos
  loadPage() {
    this._route.params.subscribe(params => {
      let id = params['id'];
      this.getUser(id);
      this.getCounters(id);
    });
  }

  // Método para obtener el usuario del que vamos a ver el perfil
  getUser(id: string) {
    this._userService.getUser(id).subscribe(
      response => {
        if (response.user) {
          console.log(response);
          this.user = response.user;

          if (response.following && response.following._id) {
            this.following = true; // estamos siguiendo a ese usuario;
          } else {
            this.following = false; // no seguimos a ese usuario
          }

          if (response.followed && response.followed._id) {
            this.followed = true; // ese usuario nos sigue;
          } else {
            this.followed = false; // ese usuario no nos sigue
          }

        } else {
          this.status = 'error';
        }
      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
        this._router.navigate(['/perfil', this.identity._id]);
        // si el usuario que buscamos no existe nos lleva a nuestro perfil
      }
    );
  }

  // Método para obtener las estadísticas del perfil del usuario
  getCounters(id: string) {
    this._userService.getCounters(id).subscribe(
      response => {
        console.log(response);
        this.stats = response;
      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );
  }

  // Método para seguir al usuario del que estamos viendo el perfil
  followUser(followed) {
    let follow = new Follow('', this.identity._id, followed);

    this._followService.addFollow(this.token, follow).subscribe(
      response => {
        this.following = true; // ya seguimos al usuario
        this.getUserCounters(); // para actualizar las stats del usuario loggeado en el localstorage
        this.getCounters(this.user._id); // para actualizar las stats del user del que estamos viendo el perfil
      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );
  }

  // Metodo para dejar se seguir a usuarios
  unfollowUser(followed) {
    this._followService.deleteFollow(this.token, followed).subscribe(
      response => {
        this.following = false;
        this.getUserCounters(); // para actualizar las stats del usuario loggeado en el localstorage
        this.getCounters(this.user._id); // para actualizar las stats del user del que estamos viendo el perfil
      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );
  }

  // obtiene las estadisticas del usuario loggeado y las guarda / actualiza en el localstorage
  getUserCounters() {
    this._userService.getCounters().subscribe(
      response => {
        localStorage.setItem('stats', JSON.stringify(response));
        this.status = 'success';
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  public followUserOver: any;

  mouseEnter(user_id: string) {
    this.followUserOver = user_id;
  }

  mouseLeave() {
    this.followUserOver = 0;
  }

}
