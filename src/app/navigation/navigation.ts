import { Navigation } from "../_models/index";

export const navigation: Navigation[] = [
  {
    id: "cms_dashboards",
    title: "Tổng quan",
    translate: "NAV.DASHBOARDS",
    type: "items",
    icon: "home",
    url: "/cms/dashboard",
    exactMatch: true,
  },
  // {
  //   id: "cms_inmanagement",
  //   title: "Quản lý vào ra",
  //   translate: "NAV.INMANAGEMENT",
  //   type: "items",
  //   icon: "inmanagement",
  //   url: "/cms/inmanagement",
  //   exactMatch: true,
  // },
  // {
  //   id: "cms_report",
  //   title: "Báo cáo",
  //   translate: "NAV.REPORT",
  //   type: "group",
  //   icon: "list",
  //   url: "/cms/report",
  //   exactMatch: true,
  //   children: [
  //     {
  //     id: "cms_report_infoinout",
  //     title: "Thông kê người ra vào cơ quan",
  //     translate: "NAV.REPORT_LIST.INFOINOUT",
  //     type: "item",
  //     url: "/cms/report/infoinout",
  //     exactMatch: true,
  //     },
  //     {
  //       id: "cms_report_accompanying_vehicle_manage",
  //       title: "Thông kê người ra vào cơ quan",
  //       translate: "NAV.REPORT_LIST.ACCOMPANYING_VEHICLE",
  //       type: "item",
  //       url: "/cms/report/accompanyingvehicle",
  //       exactMatch: true,
  //     },
  //     {
  //       id: "cms_report_employee_is_atwork_manage",
  //       title: "Thông kê danh sách nhân viên đang ở trong cơ quan",
  //       translate: "NAV.REPORT_LIST.EMPLOYEE_IS_AT_WORK",
  //       type: "item",
  //       url: "/cms/report/employeeisatwork",
  //       exactMatch: true,
  //     },
  //     {
  //       id: "cms_report_guest_is_at_office_manage",
  //       title: "Thông kê danh sách khách đang ở trong cơ quan",
  //       translate: "NAV.REPORT_LIST.GUEST_IS_AT_OFFICE",
  //       type: "item",
  //       url: "/cms/report/guestisatoffice",
  //       exactMatch: true,
  //     },
  //     {
  //       id: "cms_report_cardusedoffice_manage",
  //       title: "Thông kê danh sách thẻ  dùng trong cơ quan",
  //       translate: "NAV.REPORT_LIST.CARD_USED_OFFICE",
  //       type: "item",
  //       url: "/cms/report/cardusedoffice",
  //       exactMatch: true,
  //     },
  //   ],
  // },
  {
    id: "cms_masterdata",
    title: "Danh mục",
    translate: "NAV.MASTER_DATA",
    type: "group",
    icon: "list",
    url: "/cms/masterdata",
    exactMatch: true,
    children: [
      
      {
        id: "cms_masterdata_director",
        title: "Director Management",
        translate: "NAV.DIRECTOR",
        type: "item",
        url: "/cms/masterdata/director",
        exactMatch: true
      },

      // {
      //   id: "cms_masterdata_province",
      //   title: "Tỉnh/Thành phố",
      //   translate: "NAV.MASTER_DATA_LIST.PROVINCE_STRUCTURE_LIST.PROVINCE",
      //   type: "item",
      //   url: "/cms/masterdata/province",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_district",
      //   title: "Quận/Huyện/Thị xã",
      //   translate: "NAV.MASTER_DATA_LIST.PROVINCE_STRUCTURE_LIST.DISTRICT",
      //   type: "item",
      //   url: "/cms/masterdata/district",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_ward",
      //   title: "Xã/Phường/Thị Trấn",
      //   translate: "NAV.MASTER_DATA_LIST.PROVINCE_STRUCTURE_LIST.WARD",
      //   type: "item",
      //   url: "/cms/masterdata/ward",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_organization",
      //   title: "Đơn vị/Phòng ban",
      //   translate: "NAV.MASTER_DATA_LIST.ORGANIZATION",
      //   type: "item",
      //   url: "/cms/masterdata/organization",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_title",
      //   title: "Chức vụ",
      //   translate: "NAV.MASTER_DATA_LIST.TITLE",
      //   type: "item",
      //   url: "/cms/masterdata/title",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_inforleaving",
      //   title: "Thông tin người ra vào",
      //   translate: "NAV.MASTER_DATA_LIST.INFORLEAVING",
      //   type: "item",
      //   url: "/cms/masterdata/inforleaving",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_car",
      //   title: "Xe",
      //   translate: "NAV.MASTER_DATA_LIST.CAR",
      //   type: "item",
      //   url: "/cms/masterdata/car",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_guestcalendar",
      //   title: "Lịch khách mời",
      //   translate: "NAV.MASTER_DATA_LIST.GUESTCALENDAR",
      //   type: "item",
      //   url: "/cms/masterdata/guestcalendar",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_card",
      //   title: "Thẻ",
      //   translate: "NAV.MASTER_DATA_LIST.CARD",
      //   type: "item",
      //   url: "/cms/masterdata/card",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_checkpoints",
      //   title: "Trạm kiểm soát",
      //   translate: "NAV.MASTER_DATA_LIST.CHECKPOINTS",
      //   type: "item",
      //   url: "/cms/masterdata/client",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_port",
      //   title: "Cổng",
      //   translate: "NAV.MASTER_DATA_LIST.PORT",
      //   type: "item",
      //   url: "/cms/masterdata/port",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_entryexitlane",
      //   title: "Làn ra vào",
      //   translate: "NAV.MASTER_DATA_LIST.ENTRYEXITLANE",
      //   type: "item",
      //   url: "/cms/masterdata/entryexitlane",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_masterdata_equipment",
      //   title: "Quản lý trang thiết bị",
      //   translate: "NAV.MASTER_DATA_LIST.EQUIPMENT",
      //   type: "item",
      //   url: "/cms/masterdata/equipment",
      //   exactMatch: true
      // },
    ],
  },
  {
    id: "cms_authen",
    title: "Quản trị hệ thống",
    translate: "NAV.AUTHEN",
    type: "group",
    icon: "user",
    url: "/cms/authen",
    exactMatch: true,
    children: [
      {
        id: "cms_authen_groupuser",
        title: "Nhóm quyền người dùng",
        translate: "NAV.AUTHEN_LIST.GROUP_USER",
        type: "item",
        url: "/cms/authen/groupuser",
        exactMatch: true
      },
      {
        id: "cms_authen_function",
        title: "Chức năng hệ thống",
        translate: "NAV.AUTHEN_LIST.FUNCTION",
        type: "item",
        url: "/cms/authen/function",
        exactMatch: true
      },
      {
        id: "cms_authen_user",
        title: "Người dùng hệ thống",
        translate: "NAV.AUTHEN_LIST.USER",
        type: "item",
        url: "/cms/authen/user",
        exactMatch: true
      },
      {
        id: "cms_authen_action",
        title: "Hành động hệ thống",
        translate: "NAV.AUTHEN_LIST.ACTION",
        type: "item",
        url: "/cms/authen/action",                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
        exactMatch: true
      },
      {
        id: "cms_authen_loginlogging",
        title: "Quản lý lịch sử",
        translate: "NAV.AUTHEN_LIST.LOGINLOGGING_STRUCTURE_LIST.LOGINLOGGING",
        type: "item",
        url: "/cms/authen/loginlogging",
        exactMatch: true
      },
      {
        id: "cms_authen_actionlogging",
        title: "Lịch sử thao tác hành động",
        translate: "NAV.AUTHEN_LIST.LOGINLOGGING_STRUCTURE_LIST.ACTIONLOGGING",
        type: "item",
        url: "/cms/authen/actionlogging",
        exactMatch: true
      },
      {
        id: "cms_authen_apilogging",
        title: "Lịch sử thao tác hành động",
        translate: "NAV.AUTHEN_LIST.LOGINLOGGING_STRUCTURE_LIST.APILOGGING",
        type: "item",
        url: "/cms/authen/apilogging",
        exactMatch: true
      },
      // {
      //   id: "cms_authen_monitoringequipment",
      //   title: "Monitoring trang thiết bị",
      //   translate: "NAV.AUTHEN_LIST.MONITORINGEQUIPMENT",
      //   type: "item",
      //   url: "/cms/authen/monitoringequipment",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_authen_openingautomaticcar",
      //   title: "Cấu hình tự động mở",
      //   translate: "NAV.AUTHEN_LIST.OPENINGAUTOMATICCAR",
      //   type: "item",
      //   url: "/cms/authen/openingautomaticcar",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_authen_vehiclerecognition",
      //   title: "Nhận diện biển số",
      //   translate: "NAV.AUTHEN_LIST.VEHICLERECOGNITION",
      //   type: "item",
      //   url: "/cms/authen/vehiclerecognition",
      //   exactMatch: true
      // },
      // {
      //   id: "cms_authen_togglevisibilityinfoinout",
      //   title: "Cấu hình ẩn hiện thông tin vào ra",
      //   translate: "NAV.AUTHEN_LIST.TOGGLEVISIBILITYINFOINOUT",
      //   type: "item",
      //   url: "/cms/authen/togglevisibilityinfoinout",
      //   exactMatch: true
      // },
    ]
  },
];
