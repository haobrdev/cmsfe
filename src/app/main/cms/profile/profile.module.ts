import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreService } from 'src/app/_services/core.service';
import { ClientService } from 'src/app/_services/client.service';

import { TlaSharedModule } from 'src/app/components/shared.module';
import { AppProfileComponent } from './profile.component';

const routes: Routes = [
  {
    path: '',
    component: AppProfileComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    TlaSharedModule
  ],
  declarations: [AppProfileComponent],
  providers: [CoreService, ClientService]
})
export class AppProfileModule { }
