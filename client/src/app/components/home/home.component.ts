import { Component, OnInit, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, DoCheck {

  public identity: any;

  constructor(
    private _router: Router,
    private _userService: UserService) { }

  ngOnInit(): void {
    this.identity = this._userService.getIdentity();
  }

  // para que se refresque el componente cuando te loggeas
  // probablemente pueda quitar esto ya que cuando me loggeo carga timeline ahora
  ngDoCheck() {
    this.identity = this._userService.getIdentity();
  }

}
