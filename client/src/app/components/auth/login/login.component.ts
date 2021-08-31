import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { Router, ActivatedRoute, Params} from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService]
})
export class LoginComponent implements OnInit {

  public user: User;
  public status: string;
  public mensajeError: string;
  public identity: any; // objeto del usuario identificado
  public token: string; // token del usuario
  emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$";

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)]),
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
    //console.log('Componente de login cargando...');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get email() {
    return this.loginForm.get('email');
  }

  // metodo para logearse
  onLogin() {

    this.user.email = this.loginForm.get('email').value;
    this.user.password = this.loginForm.get('password').value;

    this._userService.login(this.user).subscribe(
      response => {
        // si me devuelve los datos correctamente
        if (response.user && response.user._id) {
          this.identity = response.user;
          //console.log(this.identity);
          if (!this.identity || !this.identity._id) {
            this.status = 'error';
            this.mensajeError = 'No se ha podido iniciar sesión, inténtelo de nuevo más tarde';
          } else {
            //this.status = 'success';

            // Persistir datos del usuario con LocalStorage
            localStorage.setItem('identity', JSON.stringify(this.identity));

            // Obtener el token del usuario
            this.getToken();

          }
          this.loginForm.reset();
        } else {
          this.status = 'error';
          this.mensajeError = response.message;
        }
      },
      error => {
        this.status = 'error';
        this.mensajeError = error.error.message;
        console.log(<any>error);
      }
    );

  }

  // obtiene el token del usuario y lo guarda en el localstorage
  getToken() {

    this._userService.login(this.user, "true").subscribe(
      response => {
        this.token = response.token;
        //console.log(this.token)
        if (this.token.length <= 0) {
          this.status = 'error';
          this.mensajeError = response.message;
        } else {
          //this.status = 'success';

          // Persistir el token del usuario
          localStorage.setItem('token', this.token);

          // Conseguir los contadores o estadísticas del usuario
          this.getCounters();
        }
        this.loginForm.reset();
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
        this._router.navigate(['/timeline']); // dejo la redireccion a timeline
      },
      error => {
        console.log(<any>error);
      }
    );
  }

}
