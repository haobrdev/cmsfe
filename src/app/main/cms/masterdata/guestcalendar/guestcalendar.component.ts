import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { Subject } from "rxjs";
import { Observable } from "rxjs";
import { Router, ActivatedRoute, Params } from "@angular/router";
// Service Translate
import { TranslationLoaderService } from "src/app/common/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
// Import the locale files
import { locale as english } from "./i18n/en";
import { locale as vietnam } from "./i18n/vi";
// Globals File
import { Globals } from "src/app/common/globals";
import { Configs } from "src/app/common/configs";
import { Notification } from "src/app/common/notification";
import * as _ from "lodash";
import { L10n, setCulture } from "@syncfusion/ej2-base";
import {
  FilterService,
  GridComponent,
  VirtualScrollService,
} from "@syncfusion/ej2-angular-grids";
import { DataStateChangeEventArgs } from "@syncfusion/ej2-grids";
import { ToolbarItem, ToolbarInterface } from "src/app/_models/index";
import { CoreService } from "src/app/_services/core.service";
import { ConfigService } from "src/app/_services/config.service";
import { ModalService } from "src/app/_services/modal.service";
import { Query, Predicate, DataManager } from "@syncfusion/ej2-data";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import {
  ListBoxComponent,
  CheckBoxSelection,
} from "@syncfusion/ej2-angular-dropdowns";
ListBoxComponent.Inject(CheckBoxSelection);
import * as async from "async";
import { TreeViewComponent } from "@syncfusion/ej2-angular-navigations";
setCulture("vi");

@Component({
  selector: "cms-guestcalendar",
  templateUrl: "./guestcalendar.component.html",
  styleUrls: ["./guestcalendar.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class GuestCalendarComponent implements OnInit {
  // Varriable Language
  languages: any;
  selectedLanguage: any;
  pageIndex = 0;
  name: any;
  // View child Grid
  @ViewChild("overviewgrid", { static: false })
  public gridInstance: GridComponent;

  @ViewChild("tree", { static: false })
  public tree: TreeViewComponent;

  public search = {
    invited_guest: "",
    invited_person: "",
    department: "",
    status: "",
    start_date: "",
    end_date: "",
  };

  //Cancel
  deleteCN : any;
  checkXoa: boolean = false;
  //Cancel

  lstOrgs = [];
  lstStatus = [];
  public modelDelete;
  public modelSend;
  public fieldOrgs: FieldSettingsModel = { text: "name", value: "id" };
  public fieldStatus: FieldSettingsModel = { text: "name", value: "id" };

  // Toolbar Item
  public toolbar: ToolbarInterface[];
  public toolbar2: ToolbarInterface[];
  public selectItem = null;
  public idClick = null;
  public setTimeout = null;

  // List data
  public data: Observable<DataStateChangeEventArgs>;
  public state: DataStateChangeEventArgs;
  public dataOrigin = [];
  public modelAdd: any;
  public isError: boolean = false; 
  // query auto complete
  public query = new Query();

  public selection = {
    showCheckbox: true,
    showSelectAll: true,
  };

  /**
   * Constructor
   *
   */
  constructor(
    private _coreService: CoreService,
    private modalService: ModalService,
    private notification: Notification,
    private globals: Globals,
    public configs: Configs,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    private _translateService: TranslateService,
    private _configService: ConfigService,
    private _tlaTranslationLoaderService: TranslationLoaderService
  ) {
    // Set language
    this.data = _coreService;
    this.languages = this.globals.languages;

    this._configService._configSubject.next("true");
    // Load file language
    this._tlaTranslationLoaderService.loadTranslations(vietnam, english);

    // Set the private defaults
    L10n.load(this.configs.languageGrid);
  }

  /**
   * On init
   */
  ngOnInit(): void {
    // Set the selected language from default languages
    this.selectedLanguage = _.find(this.languages, {
      id: this._translateService.currentLang,
    });
    this._translateService.use(this.selectedLanguage.id);
    this.buildToolbar();
    this.getComboBoxData();
    this.getListData();
    this.isError = false;
  }

  getComboBoxData = () => {
    async.parallel([
      (cb) => {
        async.parallel([(cb1) => {
          this._coreService
          .Get("/dropdown/organization")
            .subscribe((res) => {
              if (res.code == "200") {
                this.lstOrgs = res.data;
                return cb1();
              }
            }, (err) => {
              return cb1();
            });
        }], (err, result) => {
          return cb();
        })
      },
      (cb) => {
      this._coreService
      .Get("/dropdown/status")
      .subscribe((res) => {
        if (res.code == "200") {
          this.lstStatus = res.data;
          return cb();
        }
      }, (err) => {
        return cb();
      });
    }], (err, result) => {

    })
  }

  // GetListData
  getListData = (): void => {
    const state = { take: 20, skip: 0 };
    if (this.state && this.state.take) {
      this.state.skip = this.state.skip;
      this.state.take = this.state.take;
      this.pageIndex = Math.floor(this.state.skip / this.state.take);
    } else {
      this.state = state;
      this.pageIndex = 0;
    }
    let extraParams = [];
   
    // Consider search conditions
    if (this.search.invited_guest) {
      extraParams.push({
        field: "invited_guest",
        value: this.search.invited_guest,
      });
    }
    if (this.search.invited_person) {
      extraParams.push({
        field: "invited_person",
        value: this.search.invited_person,
      });
    }
    if (this.search.department) {
      extraParams.push({
        field: "department",
        value: this.search.department,
      });
    }
    if (this.search.status) {
      extraParams.push({
        field: "status",
        value: this.search.status
      });
    }
    if (this.search.start_date) {
      extraParams.push({
        field: "start_date",
        value: this.search.start_date
      });
    }
    if (this.search.end_date) {
      const endDate = new Date(this.search.end_date);
      endDate.setHours(23, 59, 59, 999); 
      extraParams.push({
        field: "end_date",
        value: endDate.toISOString() 
      });
    }

    this._coreService.execute(state, "/guestcalendar/list", extraParams);
  };
  // Set DataChange OnInit
  public dataStateChange(state: DataStateChangeEventArgs): void {
    this.state = state;
    this.pageIndex = Math.floor(state.skip / state.take);
    let extraParams = [];
    if (this.search.invited_guest) {
      extraParams.push({
        field: "invited_guest",
        value: this.search.invited_guest,
      });
    }
    if (this.search.invited_person) {
      extraParams.push({
        field: "invited_person",
        value: this.search.invited_person,
      });
    }
    if (this.search.department) {
      extraParams.push({
        field: "department",
        value: this.search.department,
      });
    }
    if (this.search.status) {
      extraParams.push({
        field: "status",
        value: this.search.status
      });
    }

    this._coreService.execute(state, "/guestcalendar/list", extraParams);
  }
  // Build Toolbar
  buildToolbar = () => {
    let toolbarList = [];
    toolbarList = [ToolbarItem.ADD];
    this.toolbar = this.globals.buildToolbar("cms_masterdata_guestcalendar", toolbarList);

    
    let toolbarList2 = [];
    toolbarList2 = [ToolbarItem.EDIT, ToolbarItem.DELETE, ToolbarItem.VIEW];
    this.toolbar2 = this.globals.buildToolbar("cms_masterdata_guestcalendar", toolbarList2);
  };

  checkToolbar = (action: string) => {
    var indexToolbar = _.findIndex(this.toolbar2, (item) => {
      return item.id.toLowerCase() == action.toLowerCase();
    });
    
    if (indexToolbar > -1) {
      return true;
    } else {
      return false;
    }
  }

  clickToolbar = (itemButton: any): void => {
    const buttonId = itemButton.id;
    switch (buttonId) {
      case ToolbarItem.ADD:
        this.router.navigate(["/cms/masterdata/guestcalendar/new"]);
        break;
      case ToolbarItem.EDIT:
        const selectRows: any = this.gridInstance.getSelectedRecords();
        if (selectRows && selectRows.length > 0) {
          const objParamAdd = { id: selectRows[0].id, type: "edit" };
          const paramAdd = window.btoa(JSON.stringify(objParamAdd));
          this.router.navigate(["/cms/masterdata/guestcalendar", paramAdd]);
        } else {
          this.notification.warning("notify.NO_RECORD_SELECT");
        }
        break;

      default:
        break;
    }
  };


  searchListEnter = (event): void => {
    if (event.keyCode === 13) {
      this.getListData();
    }
  };

  clickRecord = (data, status) => {
    this.idClick = data.id;
    if (data && status === "view") {
      this.modelAdd = data;
      const objParamAdd = { id: this.modelAdd.id, type: "view" };
      const paramAdd = window.btoa(JSON.stringify(objParamAdd));
      this.router.navigate(["/cms/masterdata/guestcalendar", paramAdd]);
    }
    if (data && status === "edit") {
      this.modelAdd = data;
      const objParamAdd = { id: this.modelAdd.id, type: "edit" };
      const paramAdd = window.btoa(JSON.stringify(objParamAdd));
      this.router.navigate(["/cms/masterdata/guestcalendar", paramAdd]);
    }
    if (data && status === "delete") {
      this.checkXoa = true;
      this.deleteCN = data.name;
      this.modelDelete = data;
      this.modalService.open("confirm-delete-one-modal");
    }

  };
  confirmDeleteOne = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-delete-one-modal");
    } else {
      // Call Delete API

      if (this.modelDelete) {
        this._coreService.Post("/guestcalendar/delete", {
          id: this.modelDelete.id
        }).subscribe(
          (res) => {
            if (res.code === "200") {
              this.notification.deleteSuccess();
              this.getListData();
            } else {
              this.notification.deleteError();
            }
          },
          (err) => {
            this.notification.deleteError();
          }
        );
      }
      this.modalService.close("confirm-delete-one-modal");
    }
  };

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    clearTimeout(this.setTimeout);
  }

  // disable the multi-record selection button
  setButtonStatus = (event) => {
    if (this.setTimeout) {
      clearTimeout(this.setTimeout);
    }
    this.setTimeout = setTimeout(() => {
      const rowSelects: any = this.gridInstance.getSelectedRecords();
      if (rowSelects && rowSelects.length > 0) {
        this.selectItem = rowSelects[0];
      } else {
        this.selectItem = null;
      }
      this.buildToolbar();
    }, 200);
  };

  //format stt 
  formatStt = (index: string) => {
    return (
      this.pageIndex * this.gridInstance.pageSettings.pageSize +
      parseInt(index, 0) +
      1
    );
  };

  changeModel = (m) => {
    setTimeout(() => {
      this.isError = false;
      this.getListData();
    }, 200);
  };

  dateChanged: boolean = false;
  onDateChange() {
    this.isError = false;
    setTimeout(() => {
      const startDateString = this.search.start_date.toString();
      const endDateString = this.search.end_date.toString();
      const start_date = new Date(startDateString);
      const end_date = new Date(endDateString);
      if (start_date > end_date) {
        this.isError = true;
      } 
    }, 200);
  }

}
