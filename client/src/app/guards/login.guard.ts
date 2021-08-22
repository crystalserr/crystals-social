import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";
import { UserService } from "../services/user.service";

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(
    private _router: Router,
    private _userService: UserService
  ) {

  }

  canActivate() {
    let identity = this._userService.getIdentity();

    if (identity && (identity.role == 'ROLE_USER' || identity.role == 'ROLE_ADMIN')) {
      this._router.navigate(['/timeline']); // si ya estas loggeado te lleva a timeline
      return false;
    } else {
      return true;
    }
  }
}
