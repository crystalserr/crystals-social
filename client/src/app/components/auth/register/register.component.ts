import { Component, OnInit } from '@angular/core';

import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { User } from 'src/app/models/user';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [UserService]
})
export class RegisterComponent implements OnInit {

  public user: User;
  public status: string;
  public mensajeError: string;
  emailPattern = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$";

  //registerForm: FormGroup;
  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    nick: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern(this.emailPattern)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });


  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService) {
    this.user = new User("", "", "", "", "", "", "ROLE_USER", "");
  }

  // getters

  get name() {
    return this.registerForm.get('name');
  }

  get surname() {
    return this.registerForm.get('surname');
  }

  get nick() {
    return this.registerForm.get('nick');
  }

  get password() {
    //return this.registerForm.controls['password'].value;
    return this.registerForm.get('password');
  }

  get email() {
    return this.registerForm.get('email');
  }

  onRegister() {

    // guardo los datos del formulario en mi usuario
    this.user.name = this.registerForm.get('name').value;
    this.user.surname = this.registerForm.get('surname').value;
    this.user.nick = this.registerForm.get('nick').value;
    this.user.email = this.registerForm.get('email').value;
    this.user.password = this.registerForm.get('password').value;

    this._userService.register(this.user).subscribe(
      response => {
        // si me devuelve los datos correctamente
        if (response.user && response.user._id) {
          //console.log(response.user);
          this.status = 'success';
          this.registerForm.reset();
        } else {
          //console.log(response);
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

  ngOnInit(): void {
    //console.log('Componente de register cargando...');
  }

}
