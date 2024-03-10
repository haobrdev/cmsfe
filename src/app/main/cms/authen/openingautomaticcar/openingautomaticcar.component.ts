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
  import { OpeningautomaticcarService } from "src/app/_services/openingautomaticcar.service";
  import { ConfigService } from "src/app/_services/config.service";
  import { ModalService } from "src/app/_services/modal.service";
  import { Query, Predicate, DataManager } from "@syncfusion/ej2-data";
  import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
  import { LicenseType } from "src/app/_models/authen/LicenseType";

  import {
    ListBoxComponent,
    CheckBoxSelection
  } from "@syncfusion/ej2-angular-dropdowns";
  // import * as moment from "moment";
  ListBoxComponent.Inject(CheckBoxSelection);
  import * as async from "async";
  setCulture("vi");
  
  @Component({
    selector: "cms-openingautomaticcar",
  templateUrl: "./openingautomaticcar.component.html",
  styleUrls: ["./openingautomaticcar.component.scss"],
    providers: [FilterService, VirtualScrollService],
    encapsulation: ViewEncapsulation.None,
  })
  export class OpeningautomaticcarComponent implements OnInit {
    // Varriable Language
    languages: any;
    selectedLanguage: any;
    pageIndex = 0;
    checkpoint_name: any;
    // View child Grid
    @ViewChild("overviewgrid", { static: false })
    public gridInstance: GridComponent;
  
    public search = {
        license_no: "",
        license_type: "",
        car_owner: "",
        license_type_check: "",
        listId: "",
        value: "",
        checked_license_type:false,
        page_no :0,
        page_size :20
    };
    public lstLicenseTypes = [];
    public LicenseTypes: any = [];
  

  
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
      private _openingautomaticcarService: OpeningautomaticcarService,
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
      this.data = _openingautomaticcarService;
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
      this.getLicenseTypeComboBoxData(); // Danh mục loại biển
      // Load List Data
      this.getListData();
    }

    getLicenseTypeComboBoxData = () => {
        async.parallel([(cb) => {
          this._coreService
            .Get("/dropdown/openingautomaticbylincesetype")
            .subscribe((res) => {
              if (res.code == "200") {
                this.lstLicenseTypes = res.data;
                this.lstLicenseTypes.forEach((element) => {
                  let  item  = new LicenseType ();

                  item.id = element.id;
                  item.name = element.name;
                  item.checked = element.is_active;

                  this.LicenseTypes.push(item);
                });
  

                return cb();
              }
            }, (err) => {
              return cb();
            });
        }], (err, result) => {
    
        })
    }

  // filter status
  public onFiltering(e, lst) {
    e.preventDefaultAction = true;
    const predicate = new Predicate("name", "contains", e.text, true, true);
    this.query = new Query();
    this.query = e.text !== "" ? this.query.where(predicate) : this.query;
    e.updateData(lst, this.query);
  }

    changeModel = () => {
      setTimeout(() => {
        this.getListData();
      }, 100);
    }

    checkBoxChange(args){
      const state = { take: 20, skip: 0 };
        if (this.state && this.state.take) {
          this.state.skip = this.state.skip;
          this.state.take = this.state.take;
          this.pageIndex = Math.floor(this.state.skip / this.state.take);
        } else {
          this.state = state;
          this.pageIndex = 0;
        }
  
        this.search.page_no = this.pageIndex;
        this.search.page_size = this.state.take;
        
        this.search.listId = args.selectedRowIndexes.join(',')
        this.search.value =  args.checked;
        this.search.checked_license_type = false;
  
        this._openingautomaticcarService.update(this.search).subscribe(
          (res) => {
            if (res && res.code == "200") {
              this.notification.success("Cập nhật thành công!");
              
            } else {
              this.notification.warning(`${res.error}!`);
            }
          },
          (error) => {
            this.notification.warning(`Lỗi hệ thống!`);
          }
        );
    }
    
    changeLicenseType(item: any) {
        item.checked = !item.checked;
        var  data  = {car_license_type: item.id,is_active: item.checked};
        this._openingautomaticcarService.changeacctive(data).subscribe(
          (res) => {
            if (res && res.code == "200") {
              this.notification.success("Cập nhật tự động mở với loại biển xe thành công!");
            } else {
              this.notification.warning(`${res.error}!`);
            }
          },
          (error) => {
            this.notification.warning(`Lỗi hệ thống!`);
          }
        );
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
      if (this.search.license_no) {
        extraParams.push({
          field: "license_no",
          value: this.search.license_no.trim(),
        });
      }

      //Họ tên chủ xe
      if (this.search.car_owner) {
        extraParams.push({
          field: "car_owner",
          value: this.search.car_owner.trim(),
        });
      }

      //Loại biển
      if (this.search.license_type) {
        extraParams.push({
          field: "license_type",
          value: this.search.license_type
        });
      }
  
      this._openingautomaticcarService.getlist(state, extraParams);

    };
    // Set DataChange OnInit
    public dataStateChange(state: DataStateChangeEventArgs): void {
      this.state = state;
      this.pageIndex = Math.floor(state.skip / state.take);
      let extraParams = [];
  
      // Xét có điều kiện tìm kiếm
      if (this.search.license_no) {
        extraParams.push({
          field: "license_no",
          value: this.search.license_no.trim(),
        });
      }

       //Họ tên chủ xe
       if (this.search.car_owner) {
        extraParams.push({
          field: "car_owner",
          value: this.search.car_owner.trim(),
        });
      }

      //Loại biển
      if (this.search.license_type) {
        extraParams.push({
          field: "license_type",
          value: this.search.license_type
        });
      }
  
      this._openingautomaticcarService.getlist(state,  extraParams);
    }
  
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
  