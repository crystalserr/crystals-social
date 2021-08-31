import { Component, OnInit } from '@angular/core';

import { Router, ActivatedRoute, Params} from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { User } from 'src/app/models/user';

import { UserService } from 'src/app/services/user.service';
import { UploadService } from 'src/app/services/upload.service';

import { GLOBAL } from 'src/app/services/global';
@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  providers: [UserService, UploadService]
})
export class UserEditComponent implements OnInit {

  public user: User; // objeto que vamos a estar modificando
  public identity: any;
  public token: string;
  public status: string;
  public mensajeError: string;

  public filesToUpload: Array<File>;
  public url: string;

  private emailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";

  editForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    nick: new FormControl('', [Validators.required]), // validaré en algun momento que no puede haber dos iguales (?)
    email: new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)])
  });

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService,
    private _uploadService: UploadService
  ) {
    this.user = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.identity = this.user;
    this.url = GLOBAL.url;
  }

  // getters

  get name() {
    return this.editForm.get('name');
  }

  get surname() {
    return this.editForm.get('surname');
  }

  get nick() {
    return this.editForm.get('nick');
  }

  get email() {
    return this.editForm.get('email');
  }

  ngOnInit(): void {
    //console.log(this.user);
    //console.log('user-edit component se ha cargado');

    // establezco los valores de los inputs a las propiedades actuales del usuario
    this.editForm.get('name').setValue(this.user.name);
    this.editForm.get('surname').setValue(this.user.surname);
    this.editForm.get('nick').setValue(this.user.nick);
    this.editForm.get('email').setValue(this.user.email);
  }

  onEdit() {
    // guardo los datos del formulario en mi usuario
    this.user.name = this.editForm.get('name').value;
    this.user.surname = this.editForm.get('surname').value;
    this.user.nick = this.editForm.get('nick').value;
    this.user.email = this.editForm.get('email').value;

    // validar antes de hacer la peticion que los datos son correctos
    // o cumplen con las validaciones correspondientes

    // si mando el formulario vacio me deja guardarlo en el back
    // también podría hacer que si un campo es vacío le asigne el valor que tenía antes
    if (this.user.name == "" || this.user.surname == "" || this.user.nick == "" || this.user.email == "") {
      this.status = 'error'
      this.mensajeError = "No puedes enviar campos vacíos";
    } else {

      // hacer comprobacion de que los datos cumplen con las validaciones (??)

      this._userService.updateUser(this.user).subscribe(
        response => {
          if (!response.user) {
            this.status = 'error';
            //this.mensajeError = 'Error actualizando los datos de usuario';
            this.mensajeError = response.message;
          } else {
            this.status = 'success';
            localStorage.setItem('identity', JSON.stringify(this.user)); // no se si seria mejor poner response.user
            this.identity = this.user;

            //console.log(this.filesToUpload);

            // que solo actualice la imagen si la subimos
            if (this.filesToUpload != undefined) {

              // subida de imagen de usuario
              this._uploadService.makeFileRequest(this.url + 'upload-image-user/' + this.user._id, [], this.filesToUpload, this.token, 'image')
              .then((result: any) => {
                this.user.image = result.user.image;
                localStorage.setItem('identity', JSON.stringify(this.user));
              }).catch((err) => {
                console.log(err);
              });
            }

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
  }

  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>> fileInput.target.files;
    //console.log(this.filesToUpload);
  }

}
