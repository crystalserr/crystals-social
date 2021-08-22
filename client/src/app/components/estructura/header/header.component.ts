import { Component, OnInit, DoCheck } from '@angular/core';
import { faGem, faHome, faListUl, faUsers, faSignOutAlt, faUser, faUserCog } from '@fortawesome/free-solid-svg-icons';

import { Router, ActivatedRoute, Params} from '@angular/router';
import { UserService } from 'src/app/services/user.service';

import { GLOBAL } from 'src/app/services/global';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [UserService]
})
export class HeaderComponent implements OnInit, DoCheck {

  // iconos
  faGem = faGem;
  faHome = faHome;
  faListUl = faListUl;
  faUsers = faUsers;
  faSignOutAlt = faSignOutAlt;
  faUser = faUser;
  faUserCog = faUserCog;

  // propiedades
  public title: string = 'crystals';
  public identity: any;
  public url: string;


  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _userService: UserService) { }

  ngOnInit(): void {
    this.identity = this._userService.getIdentity();
    this.url = GLOBAL.url;
  }

  // para que se refresque el componente
  ngDoCheck() {
    this.identity = this._userService.getIdentity();
  }

  logout() {
    this.identity = this._userService.logout();
    this._router.navigate(['/home']);
  }

}
