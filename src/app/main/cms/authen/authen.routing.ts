import { Routes } from "@angular/router";
import { Error404Component } from "../../errors/404/error-404.component";

export const AuthenRoute: Routes = [
  {
    path: "groupuser",
    loadChildren: "./groupuser/groupuser.module#AppUserGroupModule",
  },
  {
    path: "user",
    loadChildren: "./user/user.module#AppUserModule",
  },
  {
    path: "function",
    loadChildren: "./function/function.module#AppFunctionModule",
  },
  {
    path: "action",
    loadChildren: "./action/action.module#AppActionModule",
  },
  {
    path: "loginlogging",
    loadChildren: "./loginlogging/loginlogging.module#AppLoginLoggingModule",
  },
  {
    path: "actionlogging",
    loadChildren: "./actionlogging/actionlogging.module#AppActionLoggingModule",
  },
  {
    path: "apilogging",
    loadChildren: "./apilogging/apilogging.module#AppAPILoggingModule",
  },
  {
    path: "configopensauto",
    loadChildren: "./configopensauto/configopensauto.module#AppConfigOpensAutoModule",
  },
  {
    path: "openingautomaticcar",
    loadChildren: "./openingautomaticcar/openingautomaticcar.module#AppOpeningAutomaTicCarCarModule",
  },
  {
    path: "vehiclerecognition",
    loadChildren: "./vehiclerecognition/vehiclerecognition.module#AppVehicleRecognitionModule",
  },
  {
    path: "togglevisibilityinfoinout",
    loadChildren: "./togglevisibilityinfoinout/togglevisibilityinfoinout.module#AppToggleVisibilityInfoinoutModule",
  },
  {
    path: "**",
    component: Error404Component,
  },
];
