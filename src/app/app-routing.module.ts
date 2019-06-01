import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderComponent } from './pages/order/order.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  {path: '', component: LoginComponent },
  {path: 'order', component: OrderComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
