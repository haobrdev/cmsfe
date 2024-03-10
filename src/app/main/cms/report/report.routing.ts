import { Routes } from "@angular/router";
import { Error404Component } from "../../../main/errors/404/error-404.component";

export const ReportRoute: Routes = [
  {
    path: "infoinout",
    loadChildren: "./infoinout/infoinout.module#AppInfoInOutModule",
  },
  {
    path: "accompanyingvehicle",
    loadChildren: "./accompanyingvehicle/accompanyingvehicle.module#AppAccompanyingVehicleModule",
  },
  {
    path: "employeeisatwork",
    loadChildren: "./employeeisatwork/employeeisatwork.module#AppEmployeeisatworkModule",
  },
  {
    path: "guestisatoffice",
    loadChildren: "./guestisatoffice/guestisatoffice.module#AppGuestisatofficeModule",
  },
  {
    path: "cardusedoffice",
    loadChildren: "./cardusedoffice/cardusedoffice.module#AppCardusedofficeModule",
  },
  {
    path: "**",
    component: Error404Component,
  },
];
