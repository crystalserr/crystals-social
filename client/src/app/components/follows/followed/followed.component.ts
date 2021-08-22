import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { User } from 'src/app/models/user';
import { Follow } from 'src/app/models/follow';

import { GLOBAL } from 'src/app/services/global';
import { UserService } from 'src/app/services/user.service';
import { FollowService } from 'src/app/services/follow.service';

@Component({
  selector: 'app-followed',
  templateUrl: './followed.component.html',
  styleUrls: ['./followed.component.css', '../following/following.component.css']
})
export class FollowedComponent implements OnInit {

  public url: string;

  public title: string;
  public identity: any;
  public token: string;
  public page: number;
  public next_page: number;
  public prev_page: number;

  public status: string;
  public mensajeError: string;

  public total: any; // number
  public pages: any; // number
  //public users: User[];

  public followed: Follow[]; // usuarios que nos siguen / siguen a otro user
  public follows: any; // ids de los usuarios que seguimos (el user loggeado)

  public userPageId: string;
  public user: User;

  //public stats: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _followService: FollowService
  ) {
    this.title = "Seguidores";
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
    //this.stats = this._userService.getStats();
   }

  ngOnInit(): void {
    console.log("users.component se ha cargado");
    this.actualPage();
  }

  actualPage() {
    this._route.params.subscribe(params => {
      let user_id = params['id'];
      this.userPageId = user_id; // usuario del que vemos sus seguidores

      let page = +params['page']; // con esto paso la página a numero
      this.page = page;

      if (!params['page']) {
        page = 1;
      }

      if (!page) {
        page = 1;
        this._router.navigate(['/seguidores', this.userPageId, page]); // si mete un texto como parametro va por aqui
      } else {
        this.next_page = page + 1;
        this.prev_page = page - 1;

        if (this.prev_page <= 0) {
          this.prev_page = 1;
        }
      }

      this.getUser(user_id, page);


    });
  }

  // obtiene el usuario del que vamos a ver a quien sigue
  // y listamos los usuarios a los que sigue
  getUser(user_id: string, page: number) {
    // para saber de que usuario estamos mostrando el listado
    this._userService.getUser(user_id).subscribe(
      response => {
        if (response.user) {
          this.user = response.user;

          // devolver listado de usuarios
          this.getFollows(user_id, page);
        } else {
          this._router.navigate(['/home']);
        }
      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );
  }

  getFollows(user_id: string, page: any) {
    this._followService.getFollowed(this.token, user_id, page).subscribe(
      response => {
        if (!response.follows) {
          this.status = 'error';
          console.log("no hay follows")
        } else {

          console.log(response);

          this.total = response.total;
          this.followed = response.follows; // usuarios que está siguiendo el user que estamos viendo
          this.pages = Number(response.pages);
          this.follows = response.users_following; // ids de los usuarios que sigue el user loggeado (identity)

          console.log(this.followed);

          if (page > this.pages) {
            console.log(page)
            this._router.navigate(['/seguidores', user_id, page]); //si pones una pagina que no existe te lleva a la primera
          }
        }
      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
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

  // seguir a un usuario (followed), que pasamos por parámetro
  followUser(followed: string) {
    console.log("following");
    var follow = new Follow('', this.identity._id, followed);

    this._followService.addFollow(this.token, follow).subscribe(
      reponse => {
        if (!reponse.follow) {
          this.status = 'error';
        } else {
          this.status = 'success';
          this.follows.push(followed);

          this.getCounters(); // para actualizar los valores en el localstorage
          //this.stats = this._userService.getStats();
        }
      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );
  }

  // dejar de  seguir a un usuario (followed)
  unfollowUser(followed: string) {
    console.log("unfollowing")
    this._followService.deleteFollow(this.token, followed).subscribe(
      response => {
        var search = this.follows.indexOf(followed);
        if (search != -1) {
          this.follows.splice(search, 1); // elimino del array el elemento encontrado

          this.getCounters(); // para actualizar los valores en el localstorage
          //this.stats = this._userService.getStats();
        }
      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );
  }

  // obtiene las estadisticas del usuario y las guarda en el localstorage
  getCounters() {
    this._userService.getCounters().subscribe(
      response => {
        localStorage.setItem('stats', JSON.stringify(response));
        this.status = 'success';
        console.log(response);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

}
