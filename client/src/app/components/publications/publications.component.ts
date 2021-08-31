import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Publication } from 'src/app/models/publication';
import { Like } from 'src/app/models/like';

import { GLOBAL } from 'src/app/services/global';
import { LikeService } from 'src/app/services/like.service';
import { PublicationService } from 'src/app/services/publication.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css'],
  providers: [PublicationService, UserService, LikeService]
})
export class PublicationsComponent implements OnInit {

  public title: string;
  public identity: any;
  public token: string;
  public url: string;

  public status: string;
  public mensajeError: string;
  public page: number;

  public total: number;
  public pages: any;
  public itemsPerPage: number;

  public publications: Array<Publication>;
  public noMore = false;

  public liking: any; // ids de las publicaciones que nos gustan

  @Input() user: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _publicationService: PublicationService,
    private _likeService: LikeService
  ) {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
    this.page = 1;
  }

  ngOnInit(): void {
    //console.log('timeline cargado correctamente');
    this.getPublications(this.user, this.page);
  }

  // user sería el user_id
  getPublications(user: string, page: number, adding = false) {
    this._publicationService.getUserPublications(this.token, user, page).subscribe(
      response => {
        //console.log(response);
        if (response.publications) {
          this.total = response.total_items;
          this.pages = response.pages;
          this.itemsPerPage = response.itemsPerPage;
          this.liking = response.liking;

          if (!adding) {
            this.publications = response.publications;
          } else {
            var arrayP = this.publications;
            var arrayNew = response.publications;
            //console.log(arrayNew);

            this.publications = arrayP.concat(arrayNew);

            // jQuery no me funciona
            //$("html", "body").animate({ scrollTop: $('body').prop("scrollHeight")}, 500 );
          }

        } else {
          this.status = 'error'; // podía mostrar algún mensaje en el front
        }
      },
      error => {
        this.mensajeError = error.error.message;
        console.log(<any>error);

        if (this.mensajeError != null) {
          this.status = 'error';
        }
      }
    )
  }

  public publicationOver: any;

  // id de la publicación sobre la que ponemos el ratón
  mouseEnter(publication_id: string) {
    this.publicationOver = publication_id;
  }

  mouseLeave() {
    this.publicationOver = 0;
  }

  // dar me gusta a una publicación - publication es el id de la publicacion
  likePublication(publication: string) {
    //console.log("liking");
    var like = new Like('', this.identity._id, publication);

    this._likeService.addLike(this.token, like).subscribe(
      response => {
        //console.log(response);
        if (!response.like) {
          this.status = 'error';
        } else {
          this.status = 'success';
          this.liking.push(publication); // añado el id de publicacion al array de me gustas del usuario

          // si aqui hubiese un contador de me gustas tendría que ir aquí
        }
      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );
  }

  // dejar de gustar una publicación (publication - id de la publicacion)
  dislikePublication(publication: string) {
    //console.log("disliking");
    this._likeService.deleteLike(this.token, publication).subscribe(
      response => {
        //console.log(response);
        var search = this.liking.indexOf(publication);
        if (search != -1) {
          this.liking.splice(search, 1); // elimino la publicacion del array de me gustas del usuario

          // si hubiese un contador de me gustas tendría que ir aqui
        }
      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );
  }


  viewMore() {
    this.page += 1; // para que aumente la página
    // si la página actual es igual al total de páginas
    if (this.page >= this.pages) {
      this.noMore = true;
    }

    this.getPublications(this.user, this.page, true);
  }

  refresh() {
      this.getCounters();
      this.noMore = false;
      this.page = 1
      this.getPublications(this.user, this.page);
  }

  public show = '';

  showImage(image) {

    //console.log(image)
    $("#ventana-modal").fadeIn();
    this.show = image;

  }

  closeImage() {
    $("#ventana-modal").fadeOut();
    this.show = '';
  }

  deletePublication(id: String) {
    this._publicationService.deletePublication(this.token, id).subscribe(
      response => {
        if (response.status == 200) {
          this.refresh();
          // actualizar las stats cuando borramos una publicación
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
