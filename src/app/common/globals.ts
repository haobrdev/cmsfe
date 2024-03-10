import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Consts } from "./const";
import {
  Headers,
  RequestOptions,
  ResponseContentType,
  ResponseType,
} from "@angular/http";
import { DataStateChangeEventArgs, Sorts } from "@syncfusion/ej2-angular-grids";

import { TranslateService } from "@ngx-translate/core";
import { locale as commonEnglish } from "./i18n/en";
import { locale as commonVietNam } from "./i18n/vi";
import { TranslationLoaderService } from "./translation-loader.service";

import { ExtraParams, ToolbarItem } from "../_models/index";
import * as moment from "moment";
import { Chart } from "angular-highcharts";
import { Buffer } from "buffer";
import { FormControl } from "@angular/forms";
import * as _ from "lodash";
import { Item } from "@syncfusion/ej2-angular-navigations";
// import { type } from 'os';

@Injectable()
export class Globals {
  // Token
  username = localStorage.getItem("username");
  token = localStorage.getItem("token");
  isAdmin = localStorage.getItem("isAdmin") || false;
  isUseHiepHoi = localStorage.getItem("isUseHiepHoi") || "0";

  // Language
  currentLang = localStorage.getItem("lang");

  // Store Code + Pathname
  storeCode: string = window.location.host
    .replace(/^www\./, "")
    .toLowerCase()
    .split(".")[0];
  pathName = window.location.pathname;

  // BACKEND + API URL
  isProduction = environment.production;
  backendURL = environment.production
    ? Consts.BACKEND_URL_PRODUCTION
    : Consts.BACKEND_URL_LOCAL;
  apiURL = environment.production
    ? Consts.API_URL_PRODUCTION
    : Consts.API_URL_LOCAL;

  // Languages
  languages = [
    {
      id: "vi",
      title: "Việt Nam",
      flag: "vi",
    },
    {
      id: "en",
      title: "English",
      flag: "us",
    },
  ];

  // Paging
  pageSize = 20;

  lstColorProcess = ["#E3E3E7", "#29D28E", "#14618C", "#F09393", "#E94949"];
  lstColorNormal = ["#FFC940", "#14618C", "#29D28E", "#F09393", "#E94949"];

  pieChartCommon = new Chart({
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      height: "245",
      type: "pie",
    },
    title: {
      text: "",
    },
    tooltip: {
      pointFormat: "<b>{point.percentage:.1f}%</b>",
    },
    credits: {
      enabled: false,
    },
    legend: {
      align: "right",
      layout: "vertical",
      verticalAlign: "middle",
      itemMarginBottom: 10,
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
        colors: this.lstColorNormal,
      },
    },
    series: [
      {
        type: "pie",
        data: [],
      },
    ],
  });

  /**
   * Constructor
   *
   * @param {TranslationLoaderService} _translationLoaderService
   * @param {TranslateService} _translateService
   */
  constructor(
    private _translationLoaderService: TranslationLoaderService,
    private _translateService: TranslateService
  ) {
    _translationLoaderService.loadTranslations(commonVietNam, commonEnglish);
  }

  // Function get Common Options
  getCommonOptions = (url, body?) => {
    const options = new RequestOptions();
    options.url = url;
    if (body) {
      options.body = body;
    } else {
      options.body = {};
    }
    options.headers = this.getCommonHeader();

    return options;
  };

  getCommonOptionsWithAuth = (url, body?) => {
    const options = new RequestOptions();
    options.url = url;
    if (body) {
      options.body = body;
    } else {
      options.body = {};
    }
    options.headers = this.getCommonHeaderWithAuth();

    return options;
  };

  getCommonExportOptionsWithAuth = (url, body?) => {
    const options = new RequestOptions();
    options.url = url;
    if (body) {
      options.body = body;
    } else {
      options.body = {};
    }

    options.responseType = ResponseContentType.Blob;
    options.headers = this.getCommonHeaderWithAuth();

    return options;
  };

  patternRegex = (name) => {
    let pattern = new RegExp(
      /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/g
    );
    return pattern.test(name);
  };

  convertDateString(date) {
    if (date && typeof date == "object") {
      date = moment(date).format("DD/MM/YYYY");
    }
    if (date) {
      if (this.patternRegex(date)) {
        date = moment(date).format("DD/MM/YYYY");
      }
    }
    return date;
  }

  convertDateStringFull(date) {
    if (date && typeof date == "object") {
      date = moment(date).format("DD/MM/YYYY HH:mm:ss");
    }
    if (date) {
      if (this.patternRegex(date)) {
        date = moment(date).format("DD/MM/YYYY HH:mm:ss");
      }
    }
    return date;
  }

  converTimeString(date) {
    if (date && typeof date == "object") {
      date = moment(date).format("HH:mm");
    }
    if (date) {
      if (this.patternRegex(date)) {
        date = moment(date).format("HH:mm");
      }
    }
    return date;
  }

  // Function get Common Header
  getCommonHeader = () => {
    const header = new Headers();
    header.append("Content-Type", "application/json");
    header.append("Accept", "application/json");
    header.append("Access-Control-Allow-Origin", "*");
    header.append(
      "Access-Control-Allow-Methods",
      "POST, GET, OPTIONS, DELETE, PUT"
    );

    return header;
  };

  // Function get Common Header With Authorization
  getCommonHeaderWithAuth = () => {
    const header = new Headers();
    header.append("Content-Type", "application/json");
    header.append("Accept", "application/json");
    header.append("Access-Control-Allow-Origin", "*");
    header.append(
      "Access-Control-Allow-Methods",
      "POST, GET, OPTIONS, DELETE, PUT"
    );
    header.append("Authorization", "Bearer " + localStorage.getItem("token"));

    return header;
  };

  // Function get Common URL Get All
  getCommonURLGetAll = (
    state: DataStateChangeEventArgs,
    url_core: string,
    extraParams?: Array<ExtraParams>
  ): string => {
    let url_get_all = "";
    const pageSize = state.take;
    const pageNo = Math.floor(state.skip / state.take) + 1;
    url_get_all =
      this.apiURL + url_core + "?pageIndex=" + pageNo + "&pageSize=" + pageSize;

    let sortQuery = "";
    let filterQuery = "";
    let extraQuery = "";

    // Sorted
    if ((state.sorted || []).length) {
      sortQuery =
        `&sort=` +
        state.sorted
          .map((obj: Sorts) => {
            return obj.direction === "descending" ? `-${obj.name}` : obj.name;
          })
          .reverse()
          .join(",");
      url_get_all += sortQuery;
    }

    // Query
    if ((state.where || []).length) {
      if ((state.where[0].predicates || []).length) {
        for (let i = 0; i < state.where[0].predicates.length; i++) {
          filterQuery +=
            "&" +
            state.where[0].predicates[i].field +
            "=" +
            state.where[0].predicates[i].value;
        }
      }
      url_get_all += filterQuery;
    }

    // Extra Params
    if (extraParams && extraParams.length > 0) {
      for (let i = 0; i < extraParams.length; i++) {
        extraQuery += "&" + extraParams[i].field + "=" + extraParams[i].value;
      }
      url_get_all += extraQuery;
    }
    return url_get_all;
  };

  // Build toolbar from Permission
  buildToolbar = (
    state_url: string,
    toolbarList: Array<any>,
    extraParams?: Array<any>
  ): Array<any> => {
    let toolbar_item = [];
    // Check toolbar Permission
    let permission = "";
    // Phân quyền hội đồng
    let isAdmin: any = localStorage.getItem("isAdmin");
    let permissions: any = localStorage.getItem("permissions");
    if (permissions) {
      permissions = JSON.parse(permissions);
    } else {
      permissions = [];
    }

    if (isAdmin == "0") {
      this.isAdmin = false;

      var functionObj = _.find(permissions, (item) => {
        return item.function_code == state_url;
      });

      var lstActions =
        functionObj && functionObj.actions ? functionObj.actions : [];

      if (lstActions.length > 0) {
        var indexView = _.findIndex(lstActions, (item) => {
          return item.action_code.indexOf("VIEW") > -1;
        });

        if (indexView > -1) {
          permission += "view,";
        }

        var indexAdd = _.findIndex(lstActions, (item) => {
          return item.action_code.indexOf("ADD") > -1;
        });

        if (indexAdd > -1) {
          permission += "add,";
        }

        var indexEdit = _.findIndex(lstActions, (item) => {
          return item.action_code.indexOf("EDIT") > -1;
        });

        if (indexEdit > -1) {
          permission += "edit,";
        }

        var indexDelete = _.findIndex(lstActions, (item) => {
          return item.action_code.indexOf("DELETE") > -1;
        });

        if (indexDelete > -1) {
          permission += "delete,";
        }

        var indexLock = _.findIndex(lstActions, (item) => {
          return item.action_code.indexOf("LOCK") > -1;
        });

        if (indexLock > -1) {
          permission += "lock,";
        }

        var indexUnlock = _.findIndex(lstActions, (item) => {
          return item.action_code.indexOf("UNLOCK") > -1;
        });

        if (indexUnlock > -1) {
          permission += "unlock,";
        }

        var indexApprove = _.findIndex(lstActions, (item) => {
          return item.action_code.indexOf("APPROVE") > -1;
        });

        if (indexApprove > -1) {
          permission += "approve,";
        }

        var indexChangePass = _.findIndex(lstActions, (item) => {
          return item.action_code.indexOf("CHANGEPASS") > -1;
        });

        if (indexChangePass > -1) {
          permission += "changepass,";
        }

        var indexExport = _.findIndex(lstActions, (item) => {
          return item.action_code.indexOf("EXPORT") > -1;
        });

        if (indexExport > -1) {
          permission += "export_excel,";
        }
      }
    } else {
      this.isAdmin = true;
      permission = "view,add,edit,delete,export_excel,lock,unlock,approve";
    }

    const permission_check = permission.split(",");

    // Back
    if (toolbarList.indexOf(ToolbarItem.BACK) > -1) {
      this._translateService.get("BUTTONS.BACK").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-reply",
          iconColorClass: "btn-blue",
          id: ToolbarItem.BACK,
        });
      });
    }

    // Add
    if (
      toolbarList.indexOf(ToolbarItem.ADD) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.ADD) > -1)
    ) {
      this._translateService.get("BUTTONS.ADD").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-plus-circle",
          iconColorClass: "btn-new",
          id: ToolbarItem.ADD,
        });
      });
    }

    if (
      toolbarList.indexOf(ToolbarItem.ADD_SMS) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.ADD) > -1)
    ) {
      this._translateService.get("BUTTONS.ADD_SMS").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-plus-circle",
          iconColorClass: "btn-new",
          id: ToolbarItem.ADD_SMS,
        });
      });
    }

    if (
      toolbarList.indexOf(ToolbarItem.ADD_EMAIL) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.ADD) > -1)
    ) {
      this._translateService.get("BUTTONS.ADD_EMAIL").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-plus-circle",
          iconColorClass: "btn-new",
          id: ToolbarItem.ADD_EMAIL,
        });
      });
    }

    // Edit
    if (
      toolbarList.indexOf(ToolbarItem.EDIT) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.EDIT) > -1)
    ) {
      this._translateService.get("BUTTONS.EDIT").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-pencil-square",
          iconColorClass: "btn-edit",
          id: ToolbarItem.EDIT,
          isDisable: false,
        });
      });
    }

    // Add
    if (
      toolbarList.indexOf(ToolbarItem.VIEW) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.VIEW) > -1)
    ) {
      this._translateService.get("BUTTONS.VIEW").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-eye",
          id: ToolbarItem.VIEW,
          iconColorClass: "btn-blue",
          isDisable: false,
        });
      });
    }

    // Save
    if (
      toolbarList.indexOf(ToolbarItem.SAVE) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.SAVE) > -1)
    ) {
      this._translateService.get("BUTTONS.SAVE").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-save",
          iconColorClass: "btn-green",
          id: ToolbarItem.SAVE,
          isDisable: false,
        });
      });
    }

    // Export Excel
    if (
      toolbarList.indexOf(ToolbarItem.EXPORT_EXCEL) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.VIEW) > -1)
    ) {
      this._translateService.get("BUTTONS.EXPORT_EXCEL").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-file-excel-o",
          iconColorClass: "btn-orange",
          id: ToolbarItem.EXPORT_EXCEL,
          isDisable: false,
        });
      });
    }

    // Delete
    if (
      toolbarList.indexOf(ToolbarItem.DELETE) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.DELETE) > -1)
    ) {
      this._translateService.get("BUTTONS.DELETE").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-trash",
          iconColorClass: "btn-red",
          id: ToolbarItem.DELETE,
          align: "right",
          isDisable: false,
        });
      });
    }

    // Delete all
    if (
      toolbarList.indexOf(ToolbarItem.DELETE_ALL) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.DELETE_ALL) > -1)
    ) {
      this._translateService.get("BUTTONS.DELETE_ALL").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-times-circle",
          iconColorClass: "btn-blue",
          id: ToolbarItem.DELETE_ALL,
          align: "right",
          isDisable: false,
        });
      });
    }

    // APPRVE
    if (
      toolbarList.indexOf(ToolbarItem.APPROVE) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.APPROVE) > -1)
    ) {
      this._translateService.get("BUTTONS.APPROVE").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-check-square",
          iconColorClass: "btn-green",
          id: ToolbarItem.APPROVE,
          align: "right",
          isDisable: false,
        });
      });
    }

    if (
      toolbarList.indexOf(ToolbarItem.SEND_APPROVE) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.APPROVE) > -1)
    ) {
      this._translateService.get("BUTTONS.SEND_APPROVE").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-check-square",
          iconColorClass: "btn-green",
          id: ToolbarItem.SEND_APPROVE,
          align: "right",
          isDisable: false,
        });
      });
    }

    if (
      toolbarList.indexOf(ToolbarItem.DENIED) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.APPROVE) > -1)
    ) {
      this._translateService.get("BUTTONS.DENIED").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-check-square",
          iconColorClass: "btn-green",
          id: ToolbarItem.DENIED,
          align: "right",
          isDisable: false,
        });
      });
    }

    if (
      toolbarList.indexOf(ToolbarItem.UNDO) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.APPROVE) > -1)
    ) {
      this._translateService.get("BUTTONS.UNDO").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-check-square",
          iconColorClass: "btn-green",
          id: ToolbarItem.UNDO,
          align: "right",
          isDisable: false,
        });
      });
    }

    // Khóa/Mở khóa
    if (
      toolbarList.indexOf(ToolbarItem.LOCK) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.LOCK) > -1)
    ) {
      this._translateService.get("BUTTONS.LOCK").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-lock",
          id: ToolbarItem.LOCK,
          isDisable: false,
        });
      });
    }

    if (
      toolbarList.indexOf(ToolbarItem.UNLOCK) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.UNLOCK) > -1)
    ) {
      this._translateService.get("BUTTONS.UNLOCK").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-unlock",
          id: ToolbarItem.UNLOCK,
          isDisable: false,
        });
      });
    }

    if (
      toolbarList.indexOf(ToolbarItem.CHANGEPASS) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.CHANGEPASS) > -1)
    ) {
      this._translateService.get("BUTTONS.CHANGE_PASS").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-key",
          id: ToolbarItem.CHANGEPASS,
          isDisable: false,
        });
      });
    }

    if (
      toolbarList.indexOf(ToolbarItem.IMPORT) > -1 &&
      (this.isAdmin || permission_check.indexOf(ToolbarItem.ADD) > -1)
    ) {
      this._translateService.get("BUTTONS.IMPORT").subscribe((data) => {
        toolbar_item.push({
          text: data,
          tooltipText: data,
          prefixIcon: "fa-upload",
          id: ToolbarItem.IMPORT,
          iconColorClass: "btn-blue",
          isDisable: false,
        });
      });
    }

    // Custom toolbar
    if (extraParams && extraParams.length > 0) {
      for (let i = 0; i < extraParams.length; i++) {
        if (extraParams[i].no_role) {
          this._translateService
            .get("BUTTONS." + extraParams[i].id.toString().toUpperCase())
            .subscribe((data) => {
              toolbar_item.push({
                text: data,
                tooltipText: data,
                prefixIcon: extraParams[i].icon,
                iconColorClass: extraParams[i].iconColorClass,
                id: extraParams[i].id.toString(),
                isDisable: false,
              });
            });
        } else {
          if (permission_check.indexOf(extraParams[i].id) > -1) {
            this._translateService
              .get("BUTTONS." + extraParams[i].id.toString().toUpperCase())
              .subscribe((data) => {
                toolbar_item.push({
                  text: data,
                  tooltipText: data,
                  prefixIcon: extraParams[i].icon,
                  iconColorClass: extraParams[i].iconColorClass,
                  id: extraParams[i].id.toString(),
                  isDisable: false,
                });
              });
          }
        }
      }
    }
    return toolbar_item;
  };

  // Get User Info
  getUserInfo = () => {
    const userInfo = {
      username: localStorage.getItem("username"),
      fullname: localStorage.getItem("fullname"),
      avatar: localStorage.getItem("avatar"),
    };
    return userInfo;
  };

  // Replace date
  replaceDate = (date): string => {
    date = date.toLowerCase();
    var patt = new RegExp(
      "q|w|e|r|t|y|u|i|o|p|a|s|d|f|g|h|j|k|l|z|x|c|v|b|n|m"
    );
    let returnDate = "";
    if (
      date.indexOf("-") === -1 &&
      date.indexOf("/") === -1 &&
      patt.test(date) === false
    ) {
      let day;
      let month;
      let year;
      if (date.length === 8) {
        day = date.substr(0, 2);
        month = date.substr(2, 2);
        year = date.substr(4, 4);
      } else if (date.length === 6) {
        day = date.substr(0, 2);
        month = date.substr(2, 2);
        year = date.substr(4, 2);
        if (parseInt(year, 0) < 50) {
          year = parseInt("20" + year, 0);
        } else {
          year = parseInt("19" + year, 0);
        }
      }

      if (parseInt(day, 0) > 31) {
        day = 30;
      }
      if (parseInt(month, 0) > 12) {
        month = 12;
      }
      if (parseInt(year, 0) > 3000) {
        year = 2020;
      }
      returnDate = day + "/" + month + "/" + year;
    } else {
      returnDate = date;
    }
    return returnDate;
  };
  // Replace date
  replaceDateFormArray = (date): string => {
    date = date.toLowerCase();
    var patt = new RegExp(
      "q|w|e|r|t|y|u|i|o|p|a|s|d|f|g|h|j|k|l|z|x|c|v|b|n|m"
    );
    let returnDate = "";
    if (
      date.indexOf("-") === -1 &&
      date.indexOf("/") === -1 &&
      patt.test(date) === false
    ) {
      let day;
      let month;
      let year;
      if (date.length === 8) {
        day = date.substr(0, 2);
        month = date.substr(2, 2);
        year = date.substr(4, 4);
      } else if (date.length === 6) {
        day = date.substr(0, 2);
        month = date.substr(2, 2);
        year = date.substr(4, 2);
        if (parseInt(year, 0) < 50) {
          year = parseInt("20" + year, 0);
        } else {
          year = parseInt("19" + year, 0);
        }
      }

      if (parseInt(day, 0) > 31) {
        day = 30;
      }
      if (parseInt(month, 0) > 12) {
        month = 12;
      }
      // T1
      if (parseInt(day, 0) == 0 && parseInt(month) == 1) {
        day = 31;
        month = 12;
      }
      // T2

      if (parseInt(day, 0) == 0 && parseInt(month) == 2) {
        day = 29;
        month = 1;
      }
      // T3

      if (parseInt(day, 0) == 0 && parseInt(month) == 3) {
        day = 29;
        month = 2;
      }
      // T4

      if (parseInt(day, 0) == 0 && parseInt(month) == 4) {
        day = 31;
        month = 3;
      }
      // T5

      if (parseInt(day, 0) == 0 && parseInt(month) == 5) {
        day = 30;
        month = 4;
      }
      // T6

      if (parseInt(day, 0) == 0 && parseInt(month) == 6) {
        day = 31;
        month = 5;
      }
      // T7

      if (parseInt(day, 0) == 0 && parseInt(month) == 7) {
        day = 30;
        month = 6;
      }
      // T8

      if (parseInt(day, 0) == 0 && parseInt(month) == 8) {
        day = 31;
        day = 7;
      }
      // T9

      if (parseInt(day, 0) == 0 && parseInt(month) == 9) {
        day = 31;
        month = 8;
      }
      // T10

      if (parseInt(day, 0) == 0 && parseInt(month) == 10) {
        day = 30;
        month = 9;
      }
      // T11

      if (parseInt(day, 0) == 0 && parseInt(month) == 11) {
        day = 31;
        month = 10;
      }
      // T12

      if (parseInt(day, 0) == 0 && parseInt(month) == 12) {
        day = 30;
        month = 11;
      }

      if (parseInt(day) == 30 && parseInt(month) == 2) {
        day = 29;
      }
      if (parseInt(year, 0) > 3000) {
        year = 2020;
      }
      returnDate = day + "/" + month + "/" + year;
    } else {
      returnDate = date;
    }
    return returnDate;
  };
  // Replace date ver new

  replaceDateOrignal = (date): string => {
    date = date.toLowerCase();
    var patt = new RegExp(
      "q|w|e|r|t|y|u|i|o|p|a|s|d|f|g|h|j|k|l|z|x|c|v|b|n|m"
    );
    let returnDate = "";
    if (
      date.indexOf("-") === -1 &&
      date.indexOf("/") === -1 &&
      patt.test(date) === false
    ) {
      let day;
      let month;
      let year;
      if (date.length === 8) {
        day = date.substr(0, 2);
        month = date.substr(2, 2);
        year = date.substr(4, 4);
      } else if (date.length === 6) {
        day = date.substr(0, 2);
        month = date.substr(2, 2);
        year = date.substr(4, 2);
        if (parseInt(year, 0) < 50) {
          year = parseInt("20" + year, 0);
        } else {
          year = parseInt("19" + year, 0);
        }
      }
      if (parseInt(day, 0) > 31) {
        return null;
      }
      if (parseInt(day, 0) < 1) {
        return null;
      }
      if (parseInt(month, 0) > 12) {
        return null;
      }
      if (parseInt(month, 0) < 1) {
        return null;
      }
      if (year.length == 4 && parseInt(year, 0) < 1000) {
        return null;
      }

      if (parseInt(year, 0) > 3000) {
        year = 2020;
      }
      if (
        day == 29 &&
        month == 2 &&
        parseInt(year, 0) % 100 == 0 &&
        parseInt(year, 0) % 4 !== 0
      ) {
        return null;
      } else if (
        day == 29 &&
        month == 2 &&
        parseInt(year, 0) % 100 !== 0 &&
        parseInt(year, 0) % 4 !== 0
      ) {
        return null;
      }

      returnDate = day + "/" + month + "/" + year;
    } else {
      returnDate = date;
    }
    return returnDate;
  };

  // check website
  checkUrl = (url) => {
    var pattern = new RegExp(
      "^(http|https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(url);
  };
  // check đường dẫn là video
  // exp:http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4
  checkMp4 = (url) => {
    url = url.split(".");
    for (let i = 0; i < url.length; i++) {
      if (url[url.length - 1] === "mp4") {
        return true;
      } else {
        return false;
      }
    }
  };
  //check url fb
  checkUrlFB = (url) => {
    var pattern = new RegExp(
      /(?:https?:\/\/)?(?:www\.)?(mbasic.facebook|m\.facebook|facebook|fb)\.(com|me)\/(?:(?:\w\.)*#!\/)?(?:pages\/)?(?:[\w\-\.]*\/)*([\w\-\.]*)/gi
    ); // fragment locator
    return !!pattern.test(url);
  };
  // check url youtube
  checkUrlYT = (url) => {
    var pattern = new RegExp(
      "(?:(?:http|https)://)?(?:www.)?youtube.com/(?:(?:w)*#!/)?(?:pages/)?(?:[?w-]*/)?(?:profile.php?id=(?=d.*))?([w-]*)?",
      "i"
    ); // fragment locator
    return !!pattern.test(url);
  };
  // check url instagram
  checkUrlIns = (url) => {
    var pattern = new RegExp(
      "(?:(?:http|https)://)?(?:www.)?instagram.com/(?:(?:w)*#!/)?(?:pages/)?(?:[?w-]*/)?(?:profile.php?id=(?=d.*))?([w-]*)?",
      "i"
    ); // fragment locator
    return !!pattern.test(url);
  };
  // check url twitter
  checkUrlTwiiter = (url) => {
    var pattern = new RegExp(
      "(?:(?:http|https)://)?(?:www.)?twitter.com/(?:(?:w)*#!/)?(?:pages/)?(?:[?w-]*/)?(?:profile.php?id=(?=d.*))?([w-]*)?",
      "i"
    ); // fragment locator
    return !!pattern.test(url);
  };
  // check url iframe
  checkIframe = (url) => {
    var pattern = new RegExp("(?:<iframe[^>]*)(?:(?:/>)|(?:>.*?</iframe>))");
    return !!pattern.test(url);
  };

  // Check Valid Mobile
  checkMobile = (mobile) => {
    if (mobile.length === 10) {
      const match = mobile.toString().match(/0[1-9]{1,}[0-9]{8,}/);
      return match && match.length > 0;
    } else if (mobile.length === 11) {
      const match = mobile.toString().match(/0[1-9]{1,}[0-9]{9,}/);
      return match && match.length > 0;
    } else {
      return false;
    }
  };
  // Check Valid Mobile 10
  checkMobile1 = (mobile) => {
    if (mobile.length === 10) {
      const match = mobile.toString().match(/0[1-9]{1,}[0-9]{8,}/);
      return match && match.length > 0;
    } else {
      return false;
    }
  };
  // check CMND/HC
  checkCMND = (cmnd) => {
    // checm cmnd ko phải là 9 hoặc 12 số
    // if (!cmnd || (cmnd && (cmnd.length != 9) && (cmnd.length != 12))) {
    // checm cmnd ko phải là 9 đến 12 số
    if (!cmnd || (cmnd && (cmnd.length < 9 || cmnd.length > 14))) {
      return false;
    }
    if (/\D/.test(cmnd)) {
      return false;
    }
    return true;
  };

  // check CMND/HC Child
  checkCMNDChild = (cmnd) => {
    if (!cmnd || (cmnd && (cmnd.length < 9 || cmnd.length > 13))) {
      return false;
    }
    if (/\D/.test(cmnd)) {
      return false;
    }
    return true;
  };

  // validate mã số thuế
  checkMST = (mst) => {
    // Nếu không đủ 10 số return false
    if (!mst || (mst && mst.length !== 10 && mst.length !== 14)) {
      return false;
    }

    // Kiểm tra logic
    let mst_check =
      Number(mst[0] * 31) +
      Number(mst[1] * 29) +
      Number(mst[2] * 23) +
      Number(mst[3] * 19) +
      Number(mst[4] * 17) +
      Number(mst[5] * 13) +
      Number(mst[6] * 7) +
      Number(mst[7] * 5) +
      Number(mst[8] * 3);
    // kiểm tra số thứ tự 11 12 13 ko phải là số
    if (
      Number.isInteger(Number([mst[11]])) === false ||
      Number.isInteger(Number([mst[12]])) === false ||
      Number.isInteger(Number([mst[13]])) === false
    ) {
      return false;
    }
    if (mst[10] && mst[10] !== "-") {
      return false;
    }
    if (10 - (mst_check % 11) === Number(mst[9])) {
      return true;
    } else {
      return false;
    }
  };

  // Change dữ liệu kỳ thì binding dữ liệu ngày tháng
  processDateUsePeriod = (period: string) => {
    let result = {
      from_date: null,
      to_date: null,
    };
    // Nếu kỳ là tháng này
    switch (period) {
      case "T": // hôm nay
        result.from_date = moment().startOf("day").format("DD/MM/YYYY");
        result.to_date = moment().endOf("day").format("DD/MM/YYYY");
        break;
      case "Y": // hôm qua
        result.to_date = moment().format("DD/MM/YYYY");
        result.from_date = moment().subtract(1, "days").format("DD/MM/YYYY");
        break;
      case "7D": // 7 ngày gần nhất
        result.to_date = moment().format("DD/MM/YYYY");
        result.from_date = moment().subtract(7, "days").format("DD/MM/YYYY");
        break;
      case "30D": // 30 ngày gần nhất
        result.to_date = moment().format("DD/MM/YYYY");
        result.from_date = moment().subtract(30, "days").format("DD/MM/YYYY");
        break;
      case "this_month": // Trong tháng này
        result.from_date = moment().startOf("month").format("DD/MM/YYYY");
        result.to_date = moment().endOf("month").format("DD/MM/YYYY");
        break;
      case "start_week": // Từ đầu tuần đến hiện tại
        result.from_date = moment().startOf("week").format("DD/MM/YYYY");
        result.to_date = moment().format("DD/MM/YYYY");
        break;
      case "start_month": // từ đầu tháng đến hiện tại
        result.from_date = moment().startOf("month").format("DD/MM/YYYY");
        result.to_date = moment().format("DD/MM/YYYY");
        break;
      case "this_quarter": // trong quý này
        result.from_date = moment().startOf("quarter").format("DD/MM/YYYY");
        result.to_date = moment().endOf("quarter").format("DD/MM/YYYY");
        break;
      case "start_quarter": // từ đầu quý đến hiện tại
        result.from_date = moment().startOf("quarter").format("DD/MM/YYYY");
        result.to_date = moment().format("DD/MM/YYYY");
        break;
      case "this_year": //trong năm này
        result.from_date = moment().startOf("year").format("DD/MM/YYYY");
        result.to_date = moment().endOf("year").format("DD/MM/YYYY");
        break;
      case "start_year": // từ đầu năm đến hiện tại
        result.from_date = moment().startOf("year").format("DD/MM/YYYY");
        result.to_date = moment().format("DD/MM/YYYY");
        break;
      case "begin_year": // 6 tháng đầu năm
        result.from_date = moment().startOf("year").format("DD/MM/YYYY");
        result.to_date = moment(result.from_date)
          .add(6, "month")
          .format("DD/MM/YYYY");
        break;
      case "end_year": // 6 tháng đầu năm
        let begin_year = moment().startOf("year").format("DD/MM/YYYY");
        result.from_date = moment(begin_year)
          .add(6, "month")
          .format("DD/MM/YYYY");
        result.to_date = moment().endOf("year").format("DD/MM/YYYY");
      case "last_month": // tháng trước
        result.from_date = moment().subtract(1, "month").format("DD/MM/YYYY");
        result.to_date = moment()
          .startOf("month")
          .subtract(1, "days")
          .format("DD/MM/YYYY");
        break;
      case "last_year": // năm trước
        result.from_date = moment().subtract(1, "year").format("DD/MM/YYYY");
        result.to_date = moment()
          .startOf("year")
          .subtract(1, "days")
          .format("DD/MM/YYYY");
        break;
    }

    return result;
  };

  convertObjectToBase64(object: any) {
    const objString = JSON.stringify(object);
    const objB64 = Buffer.from(objString).toString("base64");
    return objB64;
  }

  convertBase64ToString(string) {
    const objString = Buffer.from(string, "base64").toString("ascii");
    const objJson = JSON.parse(objString);
    return objJson;
  }

  b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    const objString = decodeURIComponent(
      atob(str)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const objJson = JSON.parse(objString);
    return objJson;
  }
  // check nhập 2 khoảng trắng liền kề
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || "").trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { required: true };
  }
  // check nhập 2 khoảng trắng liền kề
  public noWhitespaceValidatorEditor(control: FormControl) {
    // <p>&nbsp; &nbsp; &nbsp; &nbsp;</p>
    let flagNoSpace = false;
    if (control.value) {
      let arrStr = control.value.split(" ");
      arrStr.forEach((element) => {
        let findItem = element.indexOf("&nbsp;");
        if (findItem == -1) {
          flagNoSpace = true;
        }
      });
    }

    //if(arrStr.length == 0)
    return flagNoSpace ? null : { required: true };
  }

  // check khoản trăng giữa các từ sai định dạng
  public noExitSpaceValidator(control: FormControl) {
    const isWhitespace = (control.value || "").trim().length === 0;
    if (control.value) {
      if (control.value.length > 30) {
        return { required: false };
      } else {
        if (isWhitespace === false) {
          const NoWhiteSpace = control.value.indexOf(" ");
          if (NoWhiteSpace > 0) {
            return { incorrect: true };
          }
        }
      }
    }
  }
  // check nhập một chuỗi toàn là số
  public numberWordsValidator(control: FormControl) {
    // xóa space đầu cuối
    const value = (control.value || "").trim();
    // xóa space giữa các từ
    const valueValidator = value.split(" ").join("");
    // check chuỗi có phải sô k
    if (!isNaN(valueValidator) && valueValidator.length > 0) {
      return { numberValidator: true };
    }
  }
  // Function get Common Body Get All
  getCommonBodyGetAll = (
    state: DataStateChangeEventArgs,
    extraParams?: Array<ExtraParams>
  ) => {
    let body = {};

    const pageSize = state.take;
    const pageNo = Math.floor(state.skip / state.take) + 1;

    body["page_no"] = pageNo;
    body["page_size"] = pageSize;
    let filters = [];
    let objMatchingOperator = {
      startswith: "START_WITH",
      endswith: "END_WITH",
      contains: "CONTAINS_IGNORECASE",
      equal: "EQUAL",
      notequal: "NOT_EQUAL",
      lessthan: "LESS_THAN",
      morethan: "MORE_THAN",
      lessthanorequal: "LESS_OR_EQUAL",
      morethanorequal: "MORE_OR_EQUAL",
    };
    let stringOperators = ["startswith", "endswith", "contains"];
    let numberOperators = [
      "equal",
      "notequal",
      "lessthan",
      "morethan",
      "lessthanorequal",
      "morethanorequal",
    ];
    let dateOperators = [
      "equal",
      "notequal",
      "lessthan",
      "morethan",
      "lessthanorequal",
      "morethanorequal",
    ];

    // Query
    if ((state.where || []).length) {
      if ((state.where[0].predicates || []).length) {
        for (let i = 0; i < state.where[0].predicates.length; i++) {
          let obj = Object.assign({}, state.where[0].predicates[i]);
          // Kiếm tra xem có phải string không
          if (stringOperators.indexOf(obj.operator) > -1) {
            filters.push({
              dataType: "TEXT",
              operator: objMatchingOperator[obj.operator],
              value: obj.value,
              variable: obj.field,
            });
          }

          if (numberOperators.indexOf(obj.operator) > -1 && !isNaN(obj.value)) {
            filters.push({
              dataType: "NUMBER",
              operator: objMatchingOperator[obj.operator],
              value: obj.value,
              variable: obj.field,
            });
          }

          if (dateOperators.indexOf(obj.operator) > -1 && isNaN(obj.value)) {
            filters.push({
              dataType: "DATETIME",
              operator: objMatchingOperator[obj.operator],
              value: moment(obj.value).format("DD/MM/YYYY"),
              variable: obj.field,
            });
          }
        }
      }
    }

    if (filters.length > 0) {
      body["filters"] = filters;
    }
    if (extraParams && extraParams.length > 0) {
      for (let i = 0; i < extraParams.length; i++) {
        body[extraParams[i].field] = extraParams[i].value;
      }
    }
    return body;
  };

  convertStringToDate = (string) => {
    const dateParts = string.split("/");
    const date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
    return date;
  };

  convertTitleCase = (str) => {
    var splitStr = str.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
  };
  convertUnicode(str, specialSymbol) {
    if (typeof str !== "string") {
      str = str.toString();
    }
    //str= str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    str = str.replace(/"/g, "");
    if (specialSymbol) {
      str = str.replace(
        /!|@|–|\$|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\'| |\'|\&|\#|\[|\]|~/g,
        "-"
      );
      str = str.replace(/-+-/g, "-"); //thay thế 2- thành 1-
      str = str.replace(/^\-+|\-+$/g, ""); //cắt bỏ ký tự - ở đầu và cuối chuỗi
      str = str.replace(/\"/g, ""); // cắt bỏ kí tự ""
      str = str.replace(/\“/g, ""); // cắt bỏ kí tự ""
      str = str.replace(/\”/g, ""); // cắt bỏ kí tự ""
      str = str.replace(/\‘/g, ""); // cắt bỏ kí tự ""
      str = str.replace(/\’/g, ""); // cắt bỏ kí tự ""
    } else {
      str = "";
    }
    return str.toLowerCase(); //capitalise(str);
  }

  removeMoreText = () => {
    const strArr = document.getElementsByClassName("e-more-indicator");
    for (let i = 0; i < strArr.length; i++) {
      const text = strArr[i].innerHTML;
      if (text.includes("more")) {
        strArr[i].innerHTML = text.replace("more", "...");
      }
    }
  };


  // haohv - header for word export
  getCommonOptionsWithAuthForWord = (url, body?) => {
    const options = {
      url: url,
      body: body !== null ? body : {},
      headers: this.getCommonHeaderWithAuth(),
      observe: 'response',
    };
    return options;
  };
}
