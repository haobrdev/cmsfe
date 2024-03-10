import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoreService } from 'src/app/_services/core.service';
import { TlaSharedModule } from 'src/app/components/shared.module';
import { AppToggleVisibilityInfoinoutComponent } from './togglevisibilityinfoinout.component';
const routes: Routes = [
  {
    path: '',
    component: AppToggleVisibilityInfoinoutComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    TlaSharedModule
  ],
  declarations: [AppToggleVisibilityInfoinoutComponent],
  providers: [CoreService]
})
export class AppToggleVisibilityInfoinoutModule { }
