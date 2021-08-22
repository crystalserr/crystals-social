import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import{ HttpClientModule } from '@angular/common/http';
import { MomentModule } from 'ngx-moment';

// Routing
import { routing, appRoutingProviders } from './app.routing';

// Dependencies
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgScrollbarModule } from 'ngx-scrollbar';

// Components
import { HeaderComponent } from './components/estructura/header/header.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { UsersComponent } from './components/users/users.component';
import { SidebarComponent } from './components/estructura/sidebar/sidebar.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PublicationsComponent } from './components/publications/publications.component';
import { FollowingComponent } from './components/follows/following/following.component';
import { FollowedComponent } from './components/follows/followed/followed.component';

// Servicios
import { UserService } from './services/user.service';
import { UserGuard } from './guards/user.guard';
import { LoginGuard } from './guards/login.guard';

// Módulos
import { MessagesModule } from './messages/messages.module';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './components/auth/new-password/new-password.component';
import { ChangePasswordComponent } from './components/auth/change-password/change-password.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    UserEditComponent,
    UsersComponent,
    SidebarComponent,
    TimelineComponent,
    ProfileComponent,
    PublicationsComponent,
    FollowingComponent,
    FollowedComponent,
    ForgotPasswordComponent,
    NewPasswordComponent,
    ChangePasswordComponent,
  ],
  imports: [
    BrowserModule,
    routing,
    NgbModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MomentModule,
    NgScrollbarModule,
    MessagesModule
  ],
  providers: [
    appRoutingProviders,
    UserService,
    UserGuard,
    LoginGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
