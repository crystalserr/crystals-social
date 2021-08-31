import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Router, ActivatedRoute, Params} from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css'],
  providers: [UserService]
})
export class NewPasswordComponent implements OnInit {

  public user: User;
  public status: string;
  public mensajeError: string;
  public identity: any; // objeto del usuario al que le establecemos la nueva password
  public token: string; // token del usuario al que le establecemos la nueva password

  newPasswordForm = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) {
    this.user = new User("", "", "", "", "", "", "ROLE_USER", "");
  }

  ngOnInit(): void {
    //console.log('Componente de new-password cargando...');
  }

  get password() {
    return this.newPasswordForm.get('password');
  }

  // metodo para cambiar la contraseña
  onSubmit() {

    this._route.params.subscribe(params => {
      this.token = params['token'];
    });

    this.user.password = this.newPasswordForm.get('password').value;

    this._userService.newPassword(this.user, this.token).subscribe(
      response => {
        // si me devuelve los datos correctamente
        if (response) {
          this.status = 'success';
        }

        this.newPasswordForm.reset();

      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );
  }

}
