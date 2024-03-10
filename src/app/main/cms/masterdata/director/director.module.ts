import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import {
  DropDownListAllModule,
  DropDownListModule,
  ListBoxAllModule
} from '@syncfusion/ej2-angular-dropdowns';

import { DatePickerAllModule } from '@syncfusion/ej2-angular-calendars';

import { ToolbarModule } from '@syncfusion/ej2-angular-navigations';
import { GridAllModule } from '@syncfusion/ej2-angular-grids';
import { TranslateModule } from '@ngx-translate/core';
import { CoreService } from 'src/app/_services/core.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'src/app/components/modals/modals.module';
import { TlaSharedModule } from 'src/app/components/shared.module';
import { HtmlEditorService, ToolbarService, ImageService, TableService } from '@syncfusion/ej2-angular-richtexteditor';
import { DirectorComponent } from './director.component';
import { DirectorSerivce } from 'src/app/_services/director.service';

const routes: Routes = [
  {
    path: '',
    component: DirectorComponent
  },
//    {
//     path: ':id',
//     component: CarEditComponent
//   }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    TranslateModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    // Syncfusion
    DropDownListAllModule,
    DropDownListModule,
    DatePickerAllModule,
    ToolbarModule,
    GridAllModule,
    ListBoxAllModule,
    ModalModule,
    CKEditorModule,
    TlaSharedModule
  ],
  declarations: [DirectorComponent],
  providers: [CoreService, DirectorSerivce, ToolbarService, ImageService, HtmlEditorService, TableService]
})
export class AppDirectorModule { }
