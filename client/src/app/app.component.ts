import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './models/user';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [UserService]
})
export class AppComponent {

  public title: string = 'crystals';
  public identity: any;

  constructor(
    private _router: Router,
    private _userService: UserService) { }

  ngOnInit(): void {
    this.identity = this._userService.getIdentity();
  }

  onActivate(event) {
    // cambio brusco
    window.scroll(0,0);
    // cambio suave
    /*var scrollToTop = window.setInterval(function() {
      var pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos-20);
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 5);*/
  }

}
