import {
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation
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
    VirtualScrollService
  } from "@syncfusion/ej2-angular-grids";
  import { DataStateChangeEventArgs } from "@syncfusion/ej2-grids";
  import { ToolbarItem, ToolbarInterface } from "src/app/_models/index";
  
  import { CoreService } from "src/app/_services/core.service";
  import { EquipmentService } from "src/app/_services/equipment.service";
  import { ConfigService } from "src/app/_services/config.service";
  import { ModalService } from "src/app/_services/modal.service";
  import { Query, Predicate, DataManager } from "@syncfusion/ej2-data";
  import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
  import {
    ListBoxComponent,
    CheckBoxSelection
  } from "@syncfusion/ej2-angular-dropdowns";
  // import * as moment from "moment";
  ListBoxComponent.Inject(CheckBoxSelection);
  import * as async from "async";
  setCulture("vi");
  
  @Component({
    selector: "cms-equipment",
    templateUrl: "./equipment.component.html",
    styleUrls: ["./equipment.component.scss"],
    providers: [FilterService, VirtualScrollService],
    encapsulation: ViewEncapsulation.None,
  })
  export class EquipmentComponent implements OnInit {
    // Varriable Language
    languages: any;
    selectedLanguage: any;
    pageIndex = 0;
    checkpoint_name: any;
    // View child Grid
    @ViewChild("overviewgrid", { static: false })
    public gridInstance: GridComponent;
  
    public search = {
        equipment_name: "",
        equipment_type: "",

    };
    lstEquipmentTypes = [];
  
    public modelDelete;
    public modelSend;
    public newPassword = "";
    public confirmNewPassword = "";
    tooglePassWord = false;
    tooglePassWord2 = false;
    public fields: FieldSettingsModel = { text: "name", value: "id" };
  
    // Toolbar Item
    public toolbar: ToolbarInterface[];
    public toolbar2: ToolbarInterface[];
    public selectItem = null;
    public idClick = null;
    public setTimeout = null;
  
    //huy start
    checkXoa : boolean = false;
    //huy end
  
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
      private _equipmentService: EquipmentService,
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
      this.data = _equipmentService;
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
      
      this.getEquipmentTypeComboBoxData(); // Danh mục loại thiết bị

      // Load List Data
      this.getListData();
    }

    getEquipmentTypeComboBoxData = () => {
        async.parallel([(cb) => {
          this._coreService
            .Get("/dropdown/equipmenttype")
            .subscribe((res) => {
              if (res.code == "200") {
                this.lstEquipmentTypes = res.data;
                return cb();
              }
            }, (err) => {
              return cb();
            });
        }], (err, result) => {
    
        })
    }

    
    changeModel = () => {
      setTimeout(() => {
        this.getListData();
      }, 100);
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

      // Xét có điều kiện tìm kiếm
      if (this.search.equipment_name) {
        extraParams.push({
          field: "equipment_name",
          value: this.search.equipment_name.trim(),
        });
      }

      //Loại thiết bị
      if (this.search.equipment_type) {
        extraParams.push({
          field: "equipment_type",
          value: this.search.equipment_type
        });
      }
  
      this._equipmentService.getlist(state, extraParams);
    };
    // Set DataChange OnInit
    public dataStateChange(state: DataStateChangeEventArgs): void {
      this.state = state;
      this.pageIndex = Math.floor(state.skip / state.take);
      let extraParams = [];
  
      // Xét có điều kiện tìm kiếm
      if (this.search.equipment_name) {
        extraParams.push({
          field: "equipment_name",
          value: this.search.equipment_name.trim(),
        });
      }

      //Loại thiết bị
      if (this.search.equipment_type) {
        extraParams.push({
          field: "equipment_type",
          value: this.search.equipment_type
        });
      }
    
      this._equipmentService.getlist(state,  extraParams);
    }
  
    // Build Toolbar
    buildToolbar = () => {
      let toolbarList = [];
      toolbarList = [ToolbarItem.ADD];
      this.toolbar = this.globals.buildToolbar("cms_masterdata_equipment", toolbarList);
  
      
      let toolbarList2 = [];
      toolbarList2 = [ToolbarItem.EDIT, ToolbarItem.DELETE, ToolbarItem.VIEW];
      this.toolbar2 = this.globals.buildToolbar("cms_masterdata_equipment", toolbarList2);
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
          this.router.navigate(["/cms/masterdata/equipment/new"]);
          break;
        case ToolbarItem.EDIT:
          const selectRows: any = this.gridInstance.getSelectedRecords();
          if (selectRows && selectRows.length > 0) {
            const objParamAdd = { id: selectRows[0].id, type: "edit" };
            const paramAdd = window.btoa(JSON.stringify(objParamAdd));
            this.router.navigate(["/cms/masterdata/equipment", paramAdd]);
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
        this.router.navigate(["/cms/masterdata/equipment", paramAdd]);
      }
      
      if (data && status === "edit") {
        this.modelAdd = data;
        const objParamAdd = { id: this.modelAdd.id, type: "edit" };
        const paramAdd = window.btoa(JSON.stringify(objParamAdd));
        this.router.navigate(["/cms/masterdata/equipment", paramAdd]);
      }
      if (data && status === "delete") {
        this.checkXoa = true;
        this.modelDelete = data;
        this.modalService.open("confirm-delete-one-modal");
      }
    };
    confirmDeleteOne = (status): void => {
      if (status === "cancel") {
        this.modalService.close("confirm-delete-one-modal");
      } else {
        // gọi API xóa ở đây
          if (this.modelDelete) {
          this._equipmentService.delete( {
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

  }
  