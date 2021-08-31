import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Router, ActivatedRoute, Params} from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
  providers: [UserService]
})
export class ChangePasswordComponent implements OnInit {

  public user: User;
  public status: string;
  public mensajeError: string;
  public identity: any; // objeto del usuario al que le establecemos la nueva password
  public token: string; // token del usuario al que le establecemos la nueva password

  changePasswordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) {
    this.user = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.identity = this.user;
  }

  ngOnInit(): void {
    //console.log('Componente de change-password cargando...');
  }

  get password() {
    return this.changePasswordForm.get('password');
  }

  // metodo para cambiar la contraseña
  onSubmit() {

    this.user.password = this.changePasswordForm.get('password').value;

    this._userService.changePassword(this.user).subscribe(
      response => {
        // si me devuelve los datos correctamente
        if (response) {
          this.status = 'success';
        }

        this.changePasswordForm.reset();

      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );

  }

}
