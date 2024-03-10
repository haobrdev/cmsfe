import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleRecognitionService } from 'src/app/_services/vehiclerecognition.service';
import { TlaSharedModule } from 'src/app/components/shared.module';
import { AppConfigOpensAutoComponent } from './configopensauto.component';
import { ConfigOpensAutoEditComponent } from './edit/configopensauto-edit.component';
const routes: Routes = [
  {
    path: '',
    component: AppConfigOpensAutoComponent
  },{
    path: ':id',
    component: ConfigOpensAutoEditComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    TlaSharedModule
  ],
  declarations: [AppConfigOpensAutoComponent,ConfigOpensAutoEditComponent],
  providers: [VehicleRecognitionService]
})
export class AppConfigOpensAutoModule { }
