
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpModule } from "@angular/http";
import { RouterModule } from "@angular/router";
import {
  HttpClientModule,
  HttpClient,
  HTTP_INTERCEPTORS,
} from "@angular/common/http";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { StoreGuard } from "./common/auth.guard";
import { AppRoutes } from "./app.routing";
import { Globals } from "./common/globals";
import { Configs } from "./common/configs";
import { AuthService } from "./common/auth.service";
import { Notification } from "./common/notification";
import { ToastyModule } from "ng2-toasty";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
import { Error404Module } from "./main/errors/404/error-404.module";
import { LayoutModule } from "./layout/layout.module";
import { ConfigTreeGrids } from "./common/configs_treegrid";
import { TokenInterceptor } from "./common/token.interceptor";
import { CoreService } from "./_services/core.service";
import { ClientService } from "./_services/client.service";
import { CarService } from "./_services/car.service";
import { GuestCalendarService } from "./_services/guestCalendar.service";
import { ConfigOpensAutoService } from "./_services/configopensauto.service";
import { VehicleRecognitionService } from "./_services/vehiclerecognition.service";
import { EquipmentService } from "./_services/equipment.service";
import { AccompanyingpersonmanageService } from "./_services/accompanyingpersonmanage.service";
import { AccompanyingvehiclemanageService } from "./_services/accompanyingvehiclemanage.service";
import { OpeningautomaticcarService } from "./_services/openingautomaticcar.service";
import { GridAllModule } from '@syncfusion/ej2-angular-grids'; 
import { SanitizeHtmlPipe } from "./common/santizeHtml";


@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    // RouterModule.forRoot(AppRoutes, { useHash: true }),
    RouterModule.forRoot(AppRoutes),
    TranslateModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    ToastyModule.forRoot(),
    HttpModule,
    BrowserAnimationsModule,

    // Common Module
    Error404Module,
    LayoutModule,
  ],
  declarations: [AppComponent],
  providers: [
    AuthService,
    CoreService,
    ClientService,
    CarService,
    OpeningautomaticcarService,
    EquipmentService,
    StoreGuard,
    Globals,
    Configs,
    ConfigTreeGrids,
    Notification,
    GuestCalendarService,
    ConfigOpensAutoService,
    VehicleRecognitionService,
    AccompanyingpersonmanageService,
    AccompanyingvehiclemanageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    GridAllModule
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
