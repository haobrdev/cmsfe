import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  Inject,
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
import { createElement } from "@syncfusion/ej2-base";
import {
  FilterService,
  GridComponent,
  VirtualScrollService,
  Filter,
  IFilter,
} from "@syncfusion/ej2-angular-grids";
import { DataStateChangeEventArgs } from "@syncfusion/ej2-grids";
import { ClickEventArgs } from "@syncfusion/ej2-navigations";
import { ToolbarItem, ToolbarInterface } from "src/app/_models/index";
import * as $ from "jquery";
import { CoreService } from "src/app/_services/core.service";
import { ConfigService } from "src/app/_services/config.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { ModalService } from "src/app/_services/modal.service";
import { Query, Predicate, DataManager } from "@syncfusion/ej2-data";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import {
  ListBoxComponent,
  CheckBoxSelection,
  DropDownList,
} from "@syncfusion/ej2-angular-dropdowns";
import * as moment from "moment";
ListBoxComponent.Inject(CheckBoxSelection);
import * as async from "async";
import { saveAs } from 'file-saver';
import { TreeViewComponent } from "@syncfusion/ej2-angular-navigations";
setCulture("vi");

@Component({
  selector: "cms-accompanyingvehicle",
  templateUrl: "./accompanyingvehicle.component.html",
  styleUrls: ["./accompanyingvehicle.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
  export class AccompanyingVehicleComponent implements OnInit {
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
  checkpoint: "",
  port: "",
  lane: "",
  range_of_vehicle: "",
  employee_type: "",
  start_date: "",
  end_date: "",
  license_type: "",
  license_no: "",
};

public isError: boolean = false; 
//huy
deleteCN : any;
checkXoa: boolean = false;
//huy

lstPorts = [];
lstLanes = [];
lstCheckpoints = [];
lstVehicles = [];
lstEmployees = [];
lstLicenseTypes = [];
public modelDelete;
public modelSend;
public fields: FieldSettingsModel = { text: "name", value: "id" };

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
// query auto complete
public query = new Query();

public selection = {
  showCheckbox: true,
  showSelectAll: true,
};
// Private
private _unsubscribeAll: Subject<any>;

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
  this._unsubscribeAll = new Subject();
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
  // Load List Data
  this.getListData();
}

getComboBoxData = () => {
  async.parallel([
    (cb) => {
    this._coreService
    .Get("/dropdown/client")
    .subscribe((res) => {
      if (res.code == "200") {
        this.lstCheckpoints = res.data;
        return cb();
      }
    }, (err) => {
      return cb();
    });
  },
  (cb) => {
    this._coreService
    .Get("/dropdown/vehicle")
    .subscribe((res) => {
      if (res.code == "200") {
        this.lstVehicles = res.data;
        return cb();
      }
    }, (err) => {
      return cb();
    });
  },
  (cb) => {
    this._coreService
      .Get("/dropdown/licensetype")
      .subscribe((res) => {
        if (res.code == "200") {
          this.lstLicenseTypes = res.data;
          return cb();
        }
      }, (err) => {
        return cb();
      });
    },
  (cb) => {
    this._coreService
    .Get("/dropdown/inforleaving/status_infor_leaving")
    .subscribe((res) => {
      if (res.code == "200") {
        this.lstEmployees = res.data;
        return cb();
      }
    }, (err) => {
      return cb();
    });
  }
], 
  (err, result) => {
  })
}

getPortComboBoxData = (id: string) => {
  this.lstPorts = [];
  this.lstLanes =[];
  async.parallel([
    (cb) => {
      this._coreService
        .Get("/dropdown/port/" + id)
        .subscribe(
          (res) => {
            if (res.code == "200") {
              this.lstPorts = res.data;
              return cb();
            }
          },
          (err) => {
            return cb();
          }
        );
    },
  ]);
};

getLaneComboBoxData = (id: string) => {
  this.lstLanes =[];
  async.parallel([
    (cb) => {
      this._coreService.Get("/dropdown/laneby/" + id).subscribe(
        (res) => {
          if (res.code == "200") {
            this.lstLanes = res.data;
            return cb();
          }
        },
        (err) => {
          return cb();
        }
      );
    },
  ]);
};

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

  if (!this.isError)
  {
      // Xét có điều kiện tìm kiếm
      if (this.search.checkpoint) {
        extraParams.push({
          field: "checkpoint",
          value: this.search.checkpoint,
        });
      }

      if (this.search.license_type) {
        extraParams.push({
          field: "license_type",
          value: this.search.license_type
        });
      }

      if (this.search.license_no) {
        extraParams.push({
          field: "license_no",
          value: this.search.license_no.trim(),
        });
      }

      if (this.search.port) {
        extraParams.push({
          field: "port",
          value: this.search.port,
        });
      }

      if (this.search.lane) {
        extraParams.push({
          field: "lane",
          value: this.search.lane,
        });
      }

      if (this.search.range_of_vehicle) {
        extraParams.push({
          field: "range_of_vehicle",
          value: this.search.range_of_vehicle,
        });
      }

      if (this.search.employee_type) {
        extraParams.push({
          field: "employee_type",
          value: this.search.employee_type,
        });
      }

      if (this.search.start_date) {
        extraParams.push({
          field: "start_date",
          value: this.search.start_date
        });
      }

      if (this.search.end_date) {
        extraParams.push({
          field: "end_date",
          value: this.search.end_date
        });
      }

      this._coreService.execute(state, "/accompanyingvehicle/list", extraParams);
  }
  
};
// Set DataChange OnInit
public dataStateChange(state: DataStateChangeEventArgs): void {
  this.state = state;
  this.pageIndex = Math.floor(state.skip / state.take);
  let extraParams = [];
  if (!this.isError)
  {
      if (this.search.checkpoint) {
        extraParams.push({
          field: "checkpoint",
          value: this.search.checkpoint,
        });
      }
    
      if (this.search.port) {
        extraParams.push({
          field: "port",
          value: this.search.port,
        });
      }
    
      if (this.search.license_type) {
        extraParams.push({
          field: "license_type",
          value: this.search.license_type
        });
      }
    
      if (this.search.license_no) {
        extraParams.push({
          field: "license_no",
          value: this.search.license_no.trim(),
        });
      }
    
      if (this.search.lane) {
        extraParams.push({
          field: "lane",
          value: this.search.lane,
        });
      }
    
      if (this.search.range_of_vehicle) {
        extraParams.push({
          field: "range_of_vehicle",
          value: this.search.range_of_vehicle,
        });
      }
    
      if (this.search.employee_type) {
        extraParams.push({
          field: "employee_type",
          value: this.search.employee_type,
        });
      }
    
      this._coreService.execute(state, "/accompanyingvehicle/list", extraParams);
  }
}
// Build Toolbar
buildToolbar = () => {
  let toolbarList = [];
  toolbarList = [ToolbarItem.EXPORT_EXCEL];
  this.toolbar = this.globals.buildToolbar("cms_report_infoinout", toolbarList);

  
  let toolbarList2 = [];
  toolbarList2 = [ToolbarItem.EDIT, ToolbarItem.DELETE];
  this.toolbar2 = this.globals.buildToolbar("cms_report_infoinout", toolbarList2);
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

exportData = () => {
  if (!this.isError)
  {

    let file_name =  "THỐNG KÊ NGƯỜI RA VÀO CƠ QUAN_" + moment().format('YYYYMMDDHHmmss');
    this._coreService.PostExport("/accompanyingvehicle/export", {
      page_no: this.pageIndex,
      page_size: this.state.take,
      checkpoint: this.search.checkpoint == "" ? null : this.search.checkpoint,
      port: this.search.port == "" ? null : this.search.port,
      lane: this.search.lane == "" ? null : this.search.lane,
      range_of_vehicle: this.search.range_of_vehicle == "" ? null : this.search.range_of_vehicle,
      employee_type: this.search.employee_type == "" ? null : this.search.employee_type,
      start_date: this.search.start_date == "" ? null : this.search.start_date,
      end_date: this.search.end_date == "" ? null : this.search.end_date
    }).subscribe((data) => {
      const blob = new Blob([data],
        { type: 'application/vnd.ms-excel' });

      saveAs(blob, file_name + ".xls");
    }, (error) => {
      this.notification.warning("Xuất file thất bại!");
    })
  }
};

searchListEnter = (event): void => {
  if (event.keyCode === 13) {
    this.getListData();
  }
};

ngOnDestroy(): void {
  //Called once, before the instance is destroyed.
  //Add 'implements OnDestroy' to the class.
  clearTimeout(this.setTimeout);
}

// disbale button chon nhieu ban ghi
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

public onFiltering(e, lst) {
  e.preventDefaultProvince = true;
  const predicate = new Predicate("name", "contains", e.text, true, true);
  this.query = new Query();
  this.query = e.text !== "" ? this.query.where(predicate) : this.query;
  e.updateData(lst, this.query);
}

//format stt (sắp xếp stt)
formatStt = (index: string) => {
  return (
    this.pageIndex * this.gridInstance.pageSettings.pageSize +
    parseInt(index, 0) +
    1
  );
};

changeModel = (key: string) => {
  setTimeout(() => {

     // Trạm
     if (key =='checkpoint')
     { // Load Port theo trạm
       
       this.getPortComboBoxData(this.search.checkpoint);
     } else if  (key =='port') 
     {//Load Lane theo port
       this.getLaneComboBoxData(this.search.port);
     }
 
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