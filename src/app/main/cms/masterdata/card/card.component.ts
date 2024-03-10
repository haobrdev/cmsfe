import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { Observable } from "rxjs";
import { Router, ActivatedRoute } from "@angular/router";
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
import { Query } from "@syncfusion/ej2-data";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import {
  ListBoxComponent,
  CheckBoxSelection,
} from "@syncfusion/ej2-angular-dropdowns";
ListBoxComponent.Inject(CheckBoxSelection);
import * as async from "async";
setCulture("vi");

@Component({
  selector: "cms-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class CardComponent implements OnInit {
  // Varriable Language
  languages: any;
  selectedLanguage: any;
  pageIndex = 0;
  name: any;
  // View child Grid
  @ViewChild("overviewgrid", { static: false })
  public gridInstance: GridComponent;

  public search = {
    cardtype: "",
    cardstatus: ""
  };

  // List dropdown list
  lstTypeCard = [];
  lstStatusCard = [];
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
  deleteFlag : boolean = false;
  public modelAdd: any;
  // Query auto complete
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
    // Load List Data
    this.getListData();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    clearTimeout(this.setTimeout);
  }

  // Build Toolbar
  buildToolbar = () => {
    let toolbarList = [];
    toolbarList = [ToolbarItem.ADD];
    this.toolbar = this.globals.buildToolbar("cms_masterdata_card", toolbarList);


    let toolbarList2 = [];
    toolbarList2 = [ToolbarItem.VIEW, ToolbarItem.EDIT, ToolbarItem.DELETE];
    this.toolbar2 = this.globals.buildToolbar("cms_masterdata_card", toolbarList2);
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

  getComboBoxData = () => {
    async.parallel([
      (cb) => {
        async.parallel([(cb1) => {
          this._coreService
            .Get("/dropdown/card/cardtype")
            .subscribe((res) => {
              if (res.code == "200") {
                this.lstTypeCard = res.data;
                return cb1();
              }
            }, (err) => {
              return cb1();
            });
        }, (cb1) => {
          this._coreService
            .Get("/dropdown/card/cardstatus")
            .subscribe((res) => {
              if (res.code == "200") {
                this.lstStatusCard = res.data;
                return cb1();
              }
            }, (err) => {
              return cb1();
            });
        }], (err, result) => {
          return cb();
        })
      }
    ],)
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
    if (this.search.cardtype) {
      extraParams.push({
        field: "card_type",
        value: this.search.cardtype,
      });
    }

    if (this.search.cardstatus) {
      extraParams.push({
        field: "status",
        value: this.search.cardstatus
      });
    }

    this._coreService.execute(state, "/card/list", extraParams);
  };

  // Set DataChange OnInit
  dataStateChange(state: DataStateChangeEventArgs): void {
    this.state = state;
    this.pageIndex = Math.floor(state.skip / state.take);
    let extraParams = [];
    // Consider search conditions
    if (this.search.cardtype) {
      extraParams.push({
        field: "card_type",
        value: this.search.cardtype,
      });
    }

    if (this.search.cardstatus) {
      extraParams.push({
        field: "status",
        value: this.search.cardstatus
      });
    }

    this._coreService.execute(state, "/card/list", extraParams);
  }

  changeModel = () => {
    setTimeout(() => {
      this.getListData();
    }, 200);
  };

  // Format stt (Sort index)
  formatStt = (index: string) => {
    return (
      this.pageIndex * this.gridInstance.pageSettings.pageSize +
      parseInt(index, 0) +
      1
    );
  };

  confirmDeleteOne = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-delete-one-modal");
    } else {
      // Call the delete API here
      if (this.modelDelete) {
        this._coreService.Post("/card/delete", {
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
          () => {
            this.notification.deleteError();
          }
        );
      }
      this.modalService.close("confirm-delete-one-modal");
    }
  };

  clickToolbar = (itemButton: any): void => {
    const buttonId = itemButton.id;
    switch (buttonId) {
      case ToolbarItem.ADD:
        this.router.navigate(["/cms/masterdata/card/new"]);
        break;
      case ToolbarItem.EDIT:
        const selectRows: any = this.gridInstance.getSelectedRecords();
        if (selectRows && selectRows.length > 0) {
          const objParamAdd = { id: selectRows[0].id, type: "edit" };
          const paramAdd = window.btoa(JSON.stringify(objParamAdd));
          this.router.navigate(["/cms/masterdata/card", paramAdd]);
        } else {
          this.notification.warning("notify.NO_RECORD_SELECT");
        }
        break;

      default:
        break;
    }
  };

  clickRecord = (data, status) => {
    this.idClick = data.id;
    if (data && status === "view") {
      this.modelAdd = data;
      const objParamAdd = { id: this.modelAdd.id, type: "view" };
      const paramAdd = window.btoa(JSON.stringify(objParamAdd));
      this.router.navigate(["/cms/masterdata/card", paramAdd]);
    }
    if (data && status === "edit") {
      this.modelAdd = data;
      const objParamAdd = { id: this.modelAdd.id, type: "edit" };
      const paramAdd = window.btoa(JSON.stringify(objParamAdd));
      this.router.navigate(["/cms/masterdata/card", paramAdd]);
    }
    if (data && status === "delete") {
      this.deleteFlag = true;
      this.modelDelete = data;
      this.modalService.open("confirm-delete-one-modal");
    }
  };

}
