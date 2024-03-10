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
import {
  FilterService,
  GridComponent,
  VirtualScrollService,
  Filter,
  IFilter,
} from "@syncfusion/ej2-angular-grids";
import { DataStateChangeEventArgs } from "@syncfusion/ej2-grids";
import { ToolbarItem, ToolbarInterface } from "src/app/_models/index";
import { CoreService } from "src/app/_services/core.service";
import { ConfigService } from "src/app/_services/config.service";
import { ModalService } from "src/app/_services/modal.service";
import { Query, Predicate } from "@syncfusion/ej2-data";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import { VehicleRecognitionService } from "src/app/_services/vehiclerecognition.service";
import {
  ListBoxComponent,
  CheckBoxSelection,
} from "@syncfusion/ej2-angular-dropdowns";
ListBoxComponent.Inject(CheckBoxSelection);
setCulture("vi");

interface DataItem {
  id: number;
  license_no_correct: string;
}

@Component({
  selector: "cms-vehiclerecognition",
  templateUrl: "./vehiclerecognition.component.html",
  styleUrls: ["./vehiclerecognition.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class AppVehicleRecognitionComponent implements OnInit {
  // Varriable Language
  languages: any;
  selectedLanguage: any;
  pageIndex = 0;
  name: any;
  // View child Grid
  @ViewChild("overviewgrid", { static: false })
  public gridInstance: GridComponent;

  public modelDelete;
  public modelSend;
  tooglePassWord = false;
  tooglePassWord2 = false;
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


  // biến hoàn thêm -start
  checkXoa : boolean = false;
  // biến hoàn thêm -end
  /**
   * Constructor
   *
   */
  constructor(
    private _coreService: CoreService,
    private _VehicleRecognitionService: VehicleRecognitionService,
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
    this.data = _VehicleRecognitionService;
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
    // Load List Data
    this.getListData();
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
    this._VehicleRecognitionService.getlist(state, extraParams);

  };

  // Set DataChange OnInit
  public dataStateChange(state: DataStateChangeEventArgs): void {
    this.state = state;
    
    this.pageIndex = Math.floor(state.skip / state.take);
    let extraParams = [];
    this._VehicleRecognitionService.getlist(state, extraParams);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    clearTimeout(this.setTimeout);
  }

  public onFiltering(e, lst) {
    e.preventDefaultAction = true;
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

  changeStatus = (data) => {
    setTimeout(() => {
      data.status = data.status == 1 ? 2 : 1;
      this._coreService.Post("/vehiclerecognition/changeStatus", {
        id: data.id,
        status_id: data.status
      }).subscribe((res) => {
        if (res && res.code == "200") {
          this.notification.success("Cập nhật thành công!");
        } else {
          this.notification.warning(`${res.error}!`);
        }
      })
    }, 50);
  }

  clickRecord = (data, status) => {
    // Lấy bảng theo ID
    var licenseNoCorrect = (<HTMLInputElement>document.getElementById("license_no_correct_" + data.index)).value;

    // Lấy bảng theo ID
    var vehicleColorCorrect = (<HTMLInputElement>document.getElementById("vehicle_color_correct_" + data.index)).value;

    this.idClick = data.id;
    if (data && status === "edit") {
      this.modelAdd = data;
        this._coreService.Post("/vehiclerecognition/updateInfo",{
            id: data.id,
            license_no_correct: licenseNoCorrect,
            vehicle_color_correct: vehicleColorCorrect
        }).subscribe(() => {
          this.getListData();
      })
    }
  };

  onInputChange(license_no_correct: string, dataItem: DataItem): void {
    dataItem.license_no_correct = license_no_correct; // Cập nhật giá trị mới trong đối tượng DataItem
  }
}
