import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GridAllModule } from "@syncfusion/ej2-angular-grids";
import { DatePickerAllModule, DateTimePickerAllModule } from "@syncfusion/ej2-angular-calendars";
import { TreeViewModule } from "@syncfusion/ej2-angular-navigations";
import { CheckBoxSelectionService } from '@syncfusion/ej2-angular-dropdowns';
import { CheckBoxModule, RadioButtonAllModule } from '@syncfusion/ej2-angular-buttons';
import { NumericTextBoxAllModule, MaskedTextBoxAllModule, ColorPickerAllModule, TextBoxAllModule } from "@syncfusion/ej2-angular-inputs";
import {
  DropDownListAllModule,
  DropDownListModule,
  ListBoxAllModule,
  AutoCompleteAllModule,
  MultiSelectModule
} from "@syncfusion/ej2-angular-dropdowns";
import { ModalComponent } from "./modals.component";
import { ConfirmModalComponent } from './confirm-modals.component';
import { TooltipAllModule } from "@syncfusion/ej2-angular-popups";
import { AddEquipmentModalComponent } from "./add-equipment-modals/add-equipment-modals.component";
import { AccompanyingpersonmanageModalComponent } from "./accompanying-person-manage-modals/accompanying-person-manage-modals.component";
import { AccompanyingvehiclemanageModalComponent } from "./accompanying-vehicle-manage-modals/accompanying-vehicle-manage-modals.component";


import { ShowModalComponent } from "./show-modals.component";
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropDownListAllModule,
    FormsModule,
    GridAllModule,
    DatePickerAllModule,
    TreeViewModule,
    CheckBoxModule,
    TextBoxAllModule,
    NumericTextBoxAllModule,
    DropDownListModule,
    ListBoxAllModule,
    AutoCompleteAllModule,
    MultiSelectModule,
    DateTimePickerAllModule,
    TooltipAllModule,
    RadioButtonAllModule],

  declarations: [ModalComponent, ConfirmModalComponent, AddEquipmentModalComponent, AccompanyingpersonmanageModalComponent,AccompanyingvehiclemanageModalComponent,ShowModalComponent],
  exports: [ModalComponent, ConfirmModalComponent, AddEquipmentModalComponent, AccompanyingpersonmanageModalComponent,AccompanyingvehiclemanageModalComponent,ShowModalComponent]

})
export class ModalModule { }
