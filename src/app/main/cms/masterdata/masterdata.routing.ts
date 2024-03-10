import { Routes } from "@angular/router";
import { Error404Component } from "../../../main/errors/404/error-404.component";

export const MasterDataRoute: Routes = [
  {
    path: "director",
    loadChildren: "./director/director.module#AppDirectorModule",
  },
  // {
  //   path: "province",
  //   loadChildren: "./province/province.module#AppProvinceModule",
  // },
  // {
  //   path: "district",
  //   loadChildren: "./district/district.module#AppDistrictModule",
  // },
  // {
  //   path: "ward",
  //   loadChildren: "./ward/ward.module#AppWardModule",
  // },
  // {
  //   path: "client",
  //   loadChildren: "./client/client.module#AppClientModule",
  // },

  // {
  //   path: "organization",
  //   loadChildren: "./organization/organization.module#AppOrganizationModule",
  // },
  // {
  //   path: "title",
  //   loadChildren: "./title/title.module#AppTitleModule",
  // },

  // {
  //   path: "car",
  //   loadChildren: "./car/car.module#AppCarModule",
  // },
  
  // {
  //   path: "inforleaving",
  //   loadChildren: "./inforleaving/inforleaving.module#AppInforLeavingModule",
  // },
  // {
  //   path: "card",
  //   loadChildren: "./card/card.module#AppCardModule",
  // },
  // {
  //   path: "port",
  //   loadChildren: "./port/port.module#AppPortModule",
  // },
  // {
  //   path: "guestcalendar",
  //   loadChildren: "./guestcalendar/guestcalendar.module#AppGuestCalendarModule",
  // },
  // {
  //   path: "equipment",
  //   loadChildren: "./equipment/equipment.module#AppEquipmentModule",
  // },
  // {
  //   path: "entryexitlane",
  //   loadChildren: "./entryexitlane/entryexitlane.module#AppEntryExitLaneModule",
  // },
  {
    path: "**",
    component: Error404Component,
  },
];
