import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { GridAllModule } from "@syncfusion/ej2-angular-grids";

import {
  DropDownListAllModule,
  DropDownListModule,
  ListBoxAllModule,
  AutoCompleteAllModule,
  MultiSelectModule,
} from "@syncfusion/ej2-angular-dropdowns";

import {
  DatePickerAllModule,
  DateRangePicker,
  DateRangePickerAllModule,
} from "@syncfusion/ej2-angular-calendars";

import {
  NumericTextBoxAllModule,
  MaskedTextBoxAllModule,
  ColorPickerAllModule,
  TextBoxAllModule,
} from "@syncfusion/ej2-angular-inputs";

import { DialogModule } from "@syncfusion/ej2-angular-popups";

import {
  ButtonModule,
  CheckBoxAllModule,
  ChipListModule,
  SwitchAllModule,
} from "@syncfusion/ej2-angular-buttons";
import {
  CheckBoxModule,
  RadioButtonModule,
} from "@syncfusion/ej2-angular-buttons";

import { TreeGridModule } from "@syncfusion/ej2-angular-treegrid";
import { TimePickerModule } from "@syncfusion/ej2-angular-calendars";
import { DateTimePickerModule } from "@syncfusion/ej2-angular-calendars";
import { ModalModule } from "src/app/components/modals/modals.module";
import { ListViewModule } from "@syncfusion/ej2-angular-lists";
import { TreeViewAllModule } from "@syncfusion/ej2-angular-navigations";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import { HighchartsChartModule } from "highcharts-angular";
import { TooltipModule } from "@syncfusion/ej2-angular-popups";
import { AccordionModule } from "@syncfusion/ej2-angular-navigations";
import { RichTextEditorModule } from "@syncfusion/ej2-angular-richtexteditor";
import { PagerModule } from "@syncfusion/ej2-angular-grids";
import { SliderModule } from "./slider/slider.module";
import { SanitizeHtmlPipe } from "src/app/common/santizeHtml";
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { ScheduleAllModule, RecurrenceEditorAllModule } from '@syncfusion/ej2-angular-schedule';
import { TimePickerAllModule, DateTimePickerAllModule } from '@syncfusion/ej2-angular-calendars';

@NgModule({
  imports: [
    TranslateModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    // Syncfusion Module
    GridAllModule,
    DropDownListAllModule,
    ListBoxAllModule,
    DatePickerAllModule,
    NumericTextBoxAllModule,
    TextBoxAllModule,
    DialogModule,
    ButtonModule,
    CheckBoxModule,
    RadioButtonModule,
    TreeGridModule,
    TimePickerModule,
    CheckBoxAllModule,
    MaskedTextBoxAllModule,
    ListViewModule,
    ColorPickerAllModule,
    TreeViewAllModule,
    CKEditorModule,
    SwitchAllModule,
    HighchartsChartModule,
    AccordionModule,
    RichTextEditorModule,
    MultiSelectModule,
    DateRangePickerAllModule,
    ChipListModule,
    PagerModule,
    SliderModule,
    NgxJsonViewerModule,
    ScheduleAllModule,
    RecurrenceEditorAllModule,
    TimePickerAllModule,
    DateTimePickerAllModule
  ],
  declarations: [SanitizeHtmlPipe],
  exports: [
    TranslateModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    // Syncfusion Module
    DropDownListAllModule,
    DropDownListModule,
    ListBoxAllModule,
    DatePickerAllModule,
    NumericTextBoxAllModule,
    TextBoxAllModule,
    DialogModule,
    GridAllModule,
    ButtonModule,
    CheckBoxModule,
    RadioButtonModule,
    TreeGridModule,
    TimePickerModule,
    MaskedTextBoxAllModule,
    AutoCompleteAllModule,
    ColorPickerAllModule,
    TreeViewAllModule,
    CKEditorModule,
    SwitchAllModule,
    TooltipModule,
    HighchartsChartModule,
    DateTimePickerModule,
    AccordionModule,
    RichTextEditorModule,
    MultiSelectModule,
    DateRangePickerAllModule,
    ChipListModule,
    SliderModule,
    PagerModule,
    SanitizeHtmlPipe,
    NgxJsonViewerModule,
    ScheduleAllModule,
    RecurrenceEditorAllModule,
    TimePickerAllModule,
    DateTimePickerAllModule
  ],
})
export class TlaSharedModule {}
