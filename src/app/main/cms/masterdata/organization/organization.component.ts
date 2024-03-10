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
import { TreeViewComponent } from "@syncfusion/ej2-angular-navigations";
setCulture("vi");

@Component({
  selector: "cms-organization",
  templateUrl: "./organization.component.html",
  styleUrls: ["./organization.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationComponent implements OnInit {
  // Varriable Language
  languages: any;
  selectedLanguage: any;
  pageIndex = 0;
  name: any;
  nodeTemplate = "<div><span><i class='fa fa-folder'></i></span><span></span></div>"
  // View child Grid
  @ViewChild("overviewgrid", { static: false })
  public gridInstance: GridComponent;

  @ViewChild("tree", { static: false })
  public tree: TreeViewComponent;

  public search = {
    name: "",
    org_id: null,
    org_level: null
  };

  lstOrgs = [];
  lstOrg2s = [];
  idsTree = null;
  public fieldOrg = null;

  lstOrgLevels = [];
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
    this.getOrgData();
    this.getComboBoxData();
    // Load List Data
    this.getListData();
  }

  getComboBoxData = () => {
    async.parallel([(cb) => {
      this._coreService
        .Get("/dropdown/otherListByCode/org_level")
        .subscribe((res) => {
          if (res.code == "200") {
            this.lstOrgLevels = res.data;
            return cb();
          }
        }, (err) => {
          return cb();
        });
    }, (cb) => {
      this._coreService
        .Get("/dropdown/organization")
        .subscribe((res) => {
          if (res.code == "200") {
            this.lstOrg2s = res.data;
            return cb();
          }
        }, (err) => {
          return cb();
        });
    }], (err, result) => {

    })
  }

  // danh sách phòng ban
  getOrgData = () => {
    return new Promise((resolve, reject) => {
      this._coreService.Post("/organization/getTree", {
        parent_id: null
      }).subscribe(data => {
        this.lstOrgs = [];
        if (data.data && data.data.length > 0) {
          for (let n = 0; n < data.data.length; n++) {
            this.prepareDataRender(data.data[n]);
          }
        }
        this.lstOrgs = _.sortBy(this.lstOrgs, "orders");

        this.tree.fields = {
          dataSource: this.lstOrgs,
          id: "id",
          text: "name",
          parentID: "parent_id",
          hasChildren: "hasChild",
          expanded: "expanded"
        };
        this.idsTree = this.lstOrgs && this.lstOrgs.length ? this.lstOrgs[this.lstOrgs.length - 1].org_id : null;
        if (this.idsTree) {
          setTimeout(() => {
            this.tree.selectedNodes = [this.idsTree];
          }, 1000)
        }
        resolve(true);
      }, (error) => {
        if (error && error.status === 401) {
          location.href = '/auth/login?refreshToken=true';
        }
      });
    });
  };
  // xử lý data phòng ban treeview
  prepareDataRender = (object: any, parent_id?: any) => {
    if (parent_id) {
      object.parent_id = parent_id;
    }
    object.tooltip = object.name;
    if (object.childs && object.childs.length > 0) {
      object.expanded = true;
      object.hasChild = true;
      for (let i = 0; i < object.childs.length; i++) {
        this.prepareDataRender(object.childs[i], object.id);
      }
    }
    this.lstOrgs.push(object);
  };

  nodeSelected = (e: any) => {
    this.search.org_id = e.nodeData.id;
    this.getListData();
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
    if (this.search.name) {
      extraParams.push({
        field: "name",
        value: this.search.name.trim(),
      });
    }

    if (this.search.org_id) {
      extraParams.push({
        field: "parent_id",
        value: this.search.org_id
      });
    }

    if (this.search.org_level) {
      extraParams.push({
        field: "org_level",
        value: this.search.org_level
      });
    }

    this._coreService.execute(state, "/organization/list", extraParams);
  };
  // Set DataChange OnInit
  public dataStateChange(state: DataStateChangeEventArgs): void {
    this.state = state;
    this.pageIndex = Math.floor(state.skip / state.take);
    let extraParams = [];
    if (this.search.name) {
      extraParams.push({
        field: "name",
        value: this.search.name.trim(),
      });
    }

    if (this.search.org_id) {
      extraParams.push({
        field: "parent_id",
        value: this.search.org_id
      });
    }

    if (this.search.org_level) {
      extraParams.push({
        field: "org_level",
        value: this.search.org_level
      });
    }

    this._coreService.execute(state, "/organization/list", extraParams);
  }
  // Build Toolbar
  buildToolbar = () => {
    let toolbarList = [];
    toolbarList = [ToolbarItem.ADD];
    this.toolbar = this.globals.buildToolbar("cms_masterdata_organization", toolbarList);


    let toolbarList2 = [];
    toolbarList2 = [ToolbarItem.EDIT, ToolbarItem.DELETE];
    this.toolbar2 = this.globals.buildToolbar("cms_masterdata_organization", toolbarList2);
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
        this.router.navigate(["/cms/masterdata/organization/new"]);
        break;
      case ToolbarItem.EDIT:
        const selectRows: any = this.gridInstance.getSelectedRecords();
        if (selectRows && selectRows.length > 0) {
          const objParamAdd = { id: selectRows[0].id, type: "edit" };
          const paramAdd = window.btoa(JSON.stringify(objParamAdd));
          this.router.navigate(["/cms/masterdata/organization", paramAdd]);
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
      this.router.navigate(["/cms/masterdata/organization", paramAdd]);
    }
    if (data && status === "edit") {
      this.modelAdd = data;
      const objParamAdd = { id: this.modelAdd.id, type: "edit" };
      const paramAdd = window.btoa(JSON.stringify(objParamAdd));
      this.router.navigate(["/cms/masterdata/organization", paramAdd]);
    }
    if (data && status === "delete") {
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
        this._coreService.Post("/organization/delete", {
          id: this.modelDelete.id
        }).subscribe(
          (res) => {
            if (res.code === "200") {
              this.notification.deleteSuccess();
              this.getListData();
              this.getOrgData();
            } else {
              if (res.error === "ERROR_ORG_DATA_EXISTS") {
                this.notification.warning("Không thể xóa đơn vị đã phát sinh đơn vị/phòng ban khác!");
              } else if (res.error = "ERROR_USER_DATA_EXISTS") {
                this.notification.warning("Không thể xóa phòng ban đã phát sinh người dùng");
              } else {
                this.notification.deleteError();
              }
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

  changeModel = (m) => {
    setTimeout(() => {
      this.getListData();
    }, 200);
  };


  changeStatus = (data) => {
    setTimeout(() => {
      data.status = data.status == 1 ? 2 : 1;
      this._coreService.Post("/organization/changeStatus", {
        id: data.id,
        status_id: data.status
      }).subscribe((res) => {
        if (res && res.code == "200") {
          this.notification.success("Đổi trạng thái Đơn vị/Phòng ban thành công!");
          this.getListData();
          this.getOrgData();
        } else {
          if (data.status == 1) {
            this.notification.warning("Đơn vị/phòng ban trực thuộc " + data.parent_name + " đang không được kích hoạt nên không thể kích hoạt " + data.name)
          } else {
            this.notification.warning("Đổi trạng thái Đơn vị/Phòng ban không thành công!");
          }
          this.getListData();
        }
      })
    }, 50);
  }
}
