import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Router, ActivatedRoute, Params} from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  providers: [UserService]
})
export class ForgotPasswordComponent implements OnInit {

  public user: User;
  public status: string;
  public mensajeError: string;
  emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$";

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)]),
  });

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService
  ) {
    this.user = new User("", "", "", "", "", "", "ROLE_USER", "");
  }

  ngOnInit(): void {
    console.log('Componente de forgot-password cargando...');
  }


  get email() {
    return this.forgotPasswordForm.get('email');
  }

  // metodo para mandar el mail de recuperación de contraseña
  onSubmit() {

    this.user.email = this.forgotPasswordForm.get('email').value;

    this._userService.forgotPassword(this.user).subscribe(
      response => {
        // si me devuelve los datos correctamente
        if (response) {
          this.status = 'success';
          //console.log(response);
        }

        this.forgotPasswordForm.reset();

      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );

  }

}
