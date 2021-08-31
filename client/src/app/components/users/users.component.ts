import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { User } from 'src/app/models/user';
import { Follow } from 'src/app/models/follow';

import { GLOBAL } from 'src/app/services/global';
import { UserService } from 'src/app/services/user.service';
import { FollowService } from 'src/app/services/follow.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [UserService, FollowService]
})
export class UsersComponent implements OnInit {

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
  public users: User[];

  public follows: any; // usuarios que nosotros estamos siguiendo

  //public stats: any;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _followService: FollowService
  ) {
    this.title = "Gente";
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
    //this.stats = this._userService.getStats();
   }

  ngOnInit(): void {
    //console.log("users.component se ha cargado");
    this.actualPage();
  }

  actualPage() {
    this._route.params.subscribe(params => {
      let page = +params['page']; // con esto paso la página a numero
      this.page = page;

      if (!params['page']) {
        page = 1;
      }

      if (!page) {
        page = 1;
        this._router.navigate(['/gente', page]); // si mete un texto como parametro va por aqui
      } else {
        this.next_page = page + 1;
        this.prev_page = page - 1;

        if (this.prev_page <= 0) {
          this.prev_page = 1;
        }
      }

      // devolver listado de usuarios
      this.getUsers(page);
    });
  }

  getUsers(page: any) {
    this._userService.getUsers(page).subscribe(
      response => {
        if (!response.users) {
          this.status = 'error';
        } else {
          this.total = response.total;
          this.users = response.users;
          this.pages = Number(response.pages);
          this.follows = response.users_following;

          //console.log(this.follows);

          if (page > this.pages) {
            //console.log(page)
            this._router.navigate(['/gente', 1]); //si pones una pagina que no existe te lleva a la primera
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
    //console.log("following");
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
    //console.log("unfollowing")
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
        //console.log(response);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

}
