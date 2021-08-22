import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";
import { UserService } from "../services/user.service";

@Injectable()
export class UserGuard implements CanActivate {

  constructor(
    private _router: Router,
    private _userService: UserService
  ) {

  }

  canActivate() {
    let identity = this._userService.getIdentity();

    if (identity && (identity.role == 'ROLE_USER' || identity.role == 'ROLE_ADMIN')) {
      return true;  // me permite redirijir a la ruta
    } else {
      this._router.navigate(['/login']);
      return false;
    }
  }
}
