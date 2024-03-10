import { Routes } from "@angular/router";
import { Error404Component } from "../../main/errors/404/error-404.component";

export const CmsRoutes: Routes = [
  {
    path: "dashboard",
    loadChildren: "./dashboard/dashboard.module#AppDashboardModule",
  },
  {
    path: "report",
    loadChildren: "./report/report.module#AppReportModule",
  },
  {
    path: "inmanagement",
    loadChildren: "./inmanagement/inmanagement.module#AppInManagementModule",
  },
  {
    path: "profile",
    loadChildren: "./profile/profile.module#AppProfileModule",
  },
  {
    path: "masterdata",
    loadChildren: "./masterdata/masterdata.module#AppMasterDataModule",
  },
  {
    path: "authen",
    loadChildren: "./authen/authen.module#AppAuthenModule",
  },
  
  {
    path: "**",
    component: Error404Component,
  },
];
