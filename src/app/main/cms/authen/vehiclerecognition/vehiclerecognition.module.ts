import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreService } from 'src/app/_services/core.service';
import { TlaSharedModule } from 'src/app/components/shared.module';
import { AppVehicleRecognitionComponent } from './vehiclerecognition.component';
const routes: Routes = [
  {
    path: '',
    component: AppVehicleRecognitionComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    TlaSharedModule
  ],
  declarations: [AppVehicleRecognitionComponent],
  providers: [CoreService]
})
export class AppVehicleRecognitionModule { }
