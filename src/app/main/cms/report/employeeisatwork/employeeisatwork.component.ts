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
    selector: "cms-employeeisatwork",
    templateUrl: "./employeeisatwork.component.html",
    styleUrls: ["./employeeisatwork.component.scss"],
    providers: [FilterService, VirtualScrollService],
    encapsulation: ViewEncapsulation.None,
  })
    export class EmployeeisatworkComponent implements OnInit {
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
  
  public search = {full_name: ""};
  public setTimeout = null;
  
  // Toolbar Item
  public toolbar: ToolbarInterface[];
  public toolbar2: ToolbarInterface[];
  public selectItem = null;
  
  // List data
  public data: Observable<DataStateChangeEventArgs>;
  public state: DataStateChangeEventArgs;

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
  
    // Xét có điều kiện tìm kiếm
    if (this.search.full_name) {
        extraParams.push({
          field: "full_name",
          value: this.search.full_name,
        });
    }
    this._coreService.execute(state, "/employeeisatwork/list", extraParams);
  };

  // Set DataChange OnInit
  public dataStateChange(state: DataStateChangeEventArgs): void {
    this.state = state;
    this.pageIndex = Math.floor(state.skip / state.take);
    let extraParams = [];
     // Xét có điều kiện tìm kiếm
     if (this.search.full_name) {
        extraParams.push({
          field: "full_name",
          value: this.search.full_name,
        });
    }
    this._coreService.execute(state, "/employeeisatwork/list", extraParams);
  }

  // Build Toolbar
  buildToolbar = () => {
    let toolbarList = [];
    toolbarList = [ToolbarItem.EXPORT_EXCEL];
    this.toolbar = this.globals.buildToolbar("cms_report_employeeisatwork", toolbarList);
    let toolbarList2 = [];
    toolbarList2 = [ToolbarItem.EDIT, ToolbarItem.DELETE];
    this.toolbar2 = this.globals.buildToolbar("cms_report_employeeisatwork", toolbarList2);
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
      let file_name =  "BÁO CÁO DANH SÁCH NHÂN VIÊN ĐANG Ở CƠ QUAN_" + moment().format('YYYYMMDDHHmmss');
      this._coreService.PostExport("/employeeisatwork/export", {
        page_no: this.pageIndex,
        page_size: this.state.take,
        full_name: this.search.full_name == "" ? null : this.search.full_name
      }).subscribe((data) => {
        const blob = new Blob([data],
          { type: 'application/vnd.ms-excel' });
  
        saveAs(blob, file_name + ".xls");
      }, (error) => {
        this.notification.warning("Xuất file thất bại!");
      })
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
  
  //format stt (sắp xếp stt)
  formatStt = (index: string) => {
    return (
      this.pageIndex * this.gridInstance.pageSettings.pageSize +
      parseInt(index, 0) +
      1
    );
  };
  
  changeModel = (m) => {
    setTimeout(() => {
      this.getListData();
    }, 200);
  };
 
 }