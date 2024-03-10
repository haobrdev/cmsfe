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

import { NumericTextBoxAllModule } from '@syncfusion/ej2-angular-inputs';

import { GridAllModule } from '@syncfusion/ej2-angular-grids';

import { TranslateModule } from '@ngx-translate/core';

import { GuestCalendarService } from 'src/app/_services/guestCalendar.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'src/app/components/modals/modals.module';
import { GuestCalendarComponent } from './guestcalendar.component';
import { GuestCalendarEditComponent } from './edit/guestcalendar-edit.component';
import { TlaSharedModule } from 'src/app/components/shared.module';
import { HtmlEditorService, ToolbarService, ImageService, TableService } from '@syncfusion/ej2-angular-richtexteditor';

const routes: Routes = [
  {
    path: '',
    component: GuestCalendarComponent
  }, {
    path: ':id',
    component: GuestCalendarEditComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    TranslateModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    DropDownListAllModule,
    DropDownListModule,
    DatePickerAllModule,
    ToolbarModule,
    NumericTextBoxAllModule,
    GridAllModule,
    ListBoxAllModule,
    ModalModule,
    CKEditorModule,
    TlaSharedModule
  ],
  declarations: [GuestCalendarComponent, GuestCalendarEditComponent],
  providers: [GuestCalendarService, ToolbarService, ImageService, HtmlEditorService, TableService]
})
export class AppGuestCalendarModule { }
