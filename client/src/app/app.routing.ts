// 1. Importar módulos del router de Angular
import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule} from '@angular/router';

// Importar componentes
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { UsersComponent } from './components/users/users.component';
import { ProfileComponent } from './components/profile/profile.component';
import { FollowingComponent } from './components/follows/following/following.component';
import { FollowedComponent } from './components/follows/followed/followed.component';

// Guard
import { UserGuard } from './guards/user.guard';
import { LoginGuard } from './guards/login.guard';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './components/auth/new-password/new-password.component';
import { ChangePasswordComponent } from './components/auth/change-password/change-password.component';

// Array de configuración de rutas
const appRoutes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'gente', component: UsersComponent, canActivate: [UserGuard]},
    {path: 'timeline', component: TimelineComponent, canActivate: [UserGuard]},
    //{path: 'mensajes', component: MessagesComponent},
    {path: 'perfil/:id', component: ProfileComponent, canActivate: [UserGuard]},
    {path: 'siguiendo/:id/:page', component: FollowingComponent, canActivate: [UserGuard]},
    {path: 'seguidores/:id/:page', component: FollowedComponent, canActivate: [UserGuard]},
    {path: 'gente/:page', component: UsersComponent, canActivate: [UserGuard]},
    {path: 'mis-datos', component: UserEditComponent, canActivate: [UserGuard]},
    {path: 'change-password', component: ChangePasswordComponent, canActivate: [UserGuard]},
    {path: 'login', component: LoginComponent, canActivate: [LoginGuard]},
    {path: 'register', component: RegisterComponent, canActivate: [LoginGuard]},
    {path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [LoginGuard]},
    {path: 'new-password/:token', component: NewPasswordComponent, canActivate: [LoginGuard]},
    {path: '**', pathMatch:'full', redirectTo:'home'}
];

// Exportar el módulo del router
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoutes);
