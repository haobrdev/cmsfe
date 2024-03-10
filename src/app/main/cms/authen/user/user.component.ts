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
import { saveAs } from 'file-saver';
import * as moment from "moment";
ListBoxComponent.Inject(CheckBoxSelection);
import * as async from "async";
import { TreeViewComponent } from "@syncfusion/ej2-angular-navigations";
setCulture("vi");

@Component({
  selector: "cms-user",
  templateUrl: "./user.component.html",
  styleUrls: ["./user.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class UserComponent implements OnInit {
  // Varriable Language
  languages: any;
  selectedLanguage: any;
  pageIndex = 0;
  name: any;
  // View child Grid
  @ViewChild("overviewgrid", { static: false })
  public gridInstance: GridComponent;

  // @ViewChild("tree", { static: false })
  // public tree: TreeViewComponent;

  public search = {
    username: "",
    full_name: "",
    role_id: null,
    user_type: null,
    org_id: null
  };

  public modelDelete;
  public modelSend;
  public newPassword = "";
  public confirmNewPassword = "";
  tooglePassWord = false;
  tooglePassWord2 = false;
  passwordForm: FormGroup;
  confirmFlag = false;
  flagOldPassword = false;

  public fields: FieldSettingsModel = { text: "name", value: "id" };

  public lstUserTypes = [];
  public lstRoles = [];
  lstOrgs = [];
  idsTree = null;
  public fieldOrg = null;

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

  // hoan them bien - start
  checkRepass:boolean=true;
  isChange:boolean=false;
  isError:boolean=false;
  checkXoa:boolean = false;
  checkLock: boolean = false;
  checkUnlock: boolean = false;
  full_nameDlt: any;
  accountName: any;
  isChecked: boolean = false;
  // end

  /**
   * Constructor
   *
   */
  constructor(
    private _coreService: CoreService,
    private modalService: ModalService,
    private notification: Notification,
    private globals: Globals,
    private _formBuilder: FormBuilder,
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

    // Change Password Form
    this.passwordForm = _formBuilder.group({
      isChecked: [""],
      newPassword: [
        "",
        [
          Validators.required,
          this.globals.noWhitespaceValidator,
          Validators.maxLength(255),
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      confirmNewPassword: [
        "",
        [
          Validators.required,
          this.globals.noWhitespaceValidator,
          Validators.maxLength(255), 
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
    });

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
    async.parallel([(cb1) => {
      this._coreService
        .Get("/dropdown/otherListByCode/user_type")
        .subscribe((res) => {
          if (res.code == "200") {
            this.lstUserTypes = res.data;
            return cb1();
          }
        }, (err) => {
          return cb1();
        });
    }, (cb1) => {
      this.lstRoles = [{
        id: "DELEGATE",
        name: "Đại biểu tham dự"
      }, {
        id: "CHAIR",
        name: "Chủ trì"
      }, {
        id: "APPROVE_USER",
        name: "Người phê duyệt"
      }, {
        id: "SECRETARY",
        name: "Thư ký cuộc họp"
      }, {
        id: "TRACKING_SPECIALIST",
        name: "Chuyên viên theo dõi"
      }];
      return cb1();
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
        this.lstOrgs = _.sortBy(this.lstOrgs, "name");
        // this.tree.fields = {
        //   dataSource: this.lstOrgs,
        //   id: "id",
        //   text: "name",
        //   parentID: "parent_id",
        //   hasChildren: "hasChild",
        //   expanded: "expanded"
        // };
        // this.idsTree = this.lstOrgs && this.lstOrgs.length ? this.lstOrgs[this.lstOrgs.length - 1].org_id : null;
        // if (this.idsTree) {
        //   setTimeout(() => {
        //     this.tree.selectedNodes = [this.idsTree];
        //   }, 1000)
        // }
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
    if (this.search.username) {
      extraParams.push({
        field: "username",
        value: this.search.username.trim(),
      });
    }

    if (this.search.full_name) {
      extraParams.push({
        field: "full_name",
        value: this.search.full_name.trim(),
      });
    }

    if (this.search.role_id) {
      extraParams.push({
        field: "role_id",
        value: this.search.role_id,
      });
    }

    if (this.search.user_type) {
      extraParams.push({
        field: "user_type",
        value: this.search.user_type,
      });
    }

    if (this.search.org_id) {
      extraParams.push({
        field: "org_id",
        value: this.search.org_id,
      });
    }

    this._coreService.execute(state, "/user/list", extraParams);
  };
  // Set DataChange OnInit
  public dataStateChange(state: DataStateChangeEventArgs): void {
    this.state = state;
    this.pageIndex = Math.floor(state.skip / state.take);
    let extraParams = [];
    // Xét có điều kiện tìm kiếm
    if (this.search.username) {
      extraParams.push({
        field: "username",
        value: this.search.username.trim(),
      });
    }

    if (this.search.full_name) {
      extraParams.push({
        field: "full_name",
        value: this.search.full_name.trim(),
      });
    }

    if (this.search.role_id) {
      extraParams.push({
        field: "role_id",
        value: this.search.role_id,
      });
    }

    if (this.search.user_type) {
      extraParams.push({
        field: "user_type",
        value: this.search.user_type,
      });
    }

    if (this.search.org_id) {
      extraParams.push({
        field: "org_id",
        value: this.search.org_id,
      });
    }
    this._coreService.execute(state, "/user/list", extraParams);
  }
  // Build Toolbar
  buildToolbar = () => {
    let toolbarList = [];
    toolbarList = [ToolbarItem.ADD];
    this.toolbar = this.globals.buildToolbar("cms_authen_user", toolbarList);


    let toolbarList2 = [];
    toolbarList2 = [ToolbarItem.LOCK, ToolbarItem.UNLOCK, ToolbarItem.CHANGEPASS, ToolbarItem.EDIT, ToolbarItem.DELETE];
    this.toolbar2 = this.globals.buildToolbar("cms_authen_user", toolbarList2);
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
        this.router.navigate(["/cms/authen/user/new"]);
        break;
      case ToolbarItem.EDIT:
        const selectRows: any = this.gridInstance.getSelectedRecords();
        if (selectRows && selectRows.length > 0) {
          const objParamAdd = { id: selectRows[0].id, type: "edit" };
          const paramAdd = window.btoa(JSON.stringify(objParamAdd));
          this.router.navigate(["/cms/authen/user", paramAdd]);
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
  searchList = (): void => {
    const state = { take: 20, skip: 0 };
    if (this.state && this.state.take && this.state.skip) {
      this.state.skip = this.state.skip;
      this.state.take = this.state.take;
      this.pageIndex = 0;
    } else {
      this.state = state;
      this.pageIndex = 0;
    }
    let extraParams = [];
    // Xét có điều kiện tìm kiếm

    if (this.search.username) {
      extraParams.push({
        field: "username",
        value: this.search.username.trim(),
      });
    }

    if (this.search.full_name) {
      extraParams.push({
        field: "full_name",
        value: this.search.full_name.trim(),
      });
    }

    if (this.search.role_id) {
      extraParams.push({
        field: "role_id",
        value: this.search.role_id,
      });
    }

    if (this.search.user_type) {
      extraParams.push({
        field: "user_type",
        value: this.search.user_type,
      });
    }

    if (this.search.org_id) {
      extraParams.push({
        field: "org_id",
        value: this.search.org_id,
      });
    }
    this._coreService.execute(state, "/user/list", extraParams);
  };

  nodeSelected = (e: any) => {
    // tim vi tri id phong ban trung voi org_id click tree
    this.search.org_id = e.nodeData.id;
    this.getListData();
    // let indexOrg = _.findIndex(this.lstOrgs, item => {
    //   return item.org_id === e.nodeData.id;
    // });
    // console.log(e.nodeData.id);
    // let x;
    // // co thi lay id = id tim thay
    // if (indexOrg > -1) {
    //   x = this.lstOrgs[indexOrg];
    // }
    // let id = x && x.id ? x.id : null;
  };

  clickRecord = (data, status) => {
    this.idClick = data.id;
    if (data && status === "view") {
      this.modelAdd = data;
      const objParamAdd = { id: this.modelAdd.id, type: "view" };
      const paramAdd = window.btoa(JSON.stringify(objParamAdd));
      this.router.navigate(["/cms/authen/user", paramAdd]);
      console.log(this.modelAdd.id)
    }
    if (data && status === "edit") {
      this.modelAdd = data;
      const objParamAdd = { id: this.modelAdd.id, type: "edit" };
      const paramAdd = window.btoa(JSON.stringify(objParamAdd));
      this.router.navigate(["/cms/authen/user", paramAdd]);
    }
    if (data && status === "delete") {
      this.checkXoa= true;
      this.modelDelete = data;
      this.full_nameDlt = data.full_name;
      this.modalService.open("confirm-delete-one-modal");
    }

    if (data && status === "lock") {
      this.checkLock = true;
      this.modelSend = data.id;
      this.accountName = data.username;
      this.modalService.open("confirm-lock-modal");
    }

    if (data && status === "unlock") {
      this.checkUnlock = true;
      this.modelSend = data.id;
      this.accountName = data.username;
      console.log(this.accountName)
      this.modalService.open("confirm-unlock-modal");
    }

    if (data && status === "changePass") {
      this.modelSend = data.id;
      this.newPassword = "";
      this.confirmNewPassword = "";
      this.checkRepass = true;
      this.confirmFlag = false;
      this.flagOldPassword = false;
      this.isChange = false;
      this.isChecked = false;
      this.passwordForm.reset(); 
      this.passwordForm.enable();
      this.modalService.open("confirm-change-pass-modal");
    }
  };
  confirmDeleteOne = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-delete-one-modal");
    } else {
      // gọi API xóa ở đây

      if (this.modelDelete) {
        this._coreService.Post("/user/delete", {
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

  confirmLock = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-lock-modal");
    } else {
      if (this.modelSend) {
        this._coreService.Post("/user/lock", {
          id: this.modelSend
        }).subscribe(
          (res) => {
            if (res.code === "200") {
              this.notification.editSuccess();
              this.getListData();
            } else {
              this.notification.editError();
            }
          },
          (err) => {
            this.notification.editError();
          }
        );
      }
      this.modalService.close("confirm-lock-modal");
    }
  };

  confirmUnlock = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-unlock-modal");
    } else {
      if (this.modelSend) {
        this._coreService.Post("/user/unlock", {
          id: this.modelSend
        }).subscribe(
          (res) => {
            if (res.code === "200") {
              this.notification.editSuccess();
              this.getListData();
            } else {
              this.notification.editError();
            }
          },
          (err) => {
            this.notification.editError();
          }
        );
      }
      this.modalService.close("confirm-unlock-modal");
    }
  };


  validdate(): boolean  {
    if (this.newPassword == '' ||  this.newPassword == undefined)
    {
      this.notification.warning("Bạn chưa nhập mật khẩu mới!");
      return false;

    } else if (this.passwordForm.get('newPassword').hasError('minlength') ||  this.passwordForm.get('newPassword').hasError('pattern'))
    {
      this.notification.warning("Cập nhật mật khẩu không hợp lệ!");
      return false;
    }

    if (this.confirmNewPassword == '' ||  this.confirmNewPassword == undefined)
    {
      this.notification.warning("Bạn chưa nhập lại mật khẩu mới!");
      return false;

    } else if (this.passwordForm.get('confirmNewPassword').hasError('minlength') ||  this.passwordForm.get('confirmNewPassword').hasError('pattern'))
    {
      this.notification.warning("Cập nhật mật khẩu không hợp lệ!");
      return false;
    }

    if (this.newPassword != this.confirmNewPassword)
    {
      this.notification.warning("Cập nhật mật khẩu không hợp lệ!");
      this.confirmFlag = true;
      return false;
    }

    return true;

  }
  confirmChangePass = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-change-pass-modal");
    } else {
      if (this.modelSend) {
        if(this.isChecked) {
          this._coreService.Post("/user/changePass", {
            id: this.modelSend,
            is_generate_password: 1,
            is_send_email: 1
          }).subscribe(
            (res) => {
              if (res.code === "200") {
                console.log('good', res.code)
                this.notification.success("Mật khẩu mới đã gửi về mail của bạn!");
                this.getListData();
              } else {
                this.notification.editError();
              }
            },
            (err) => {
              this.notification.editError();
            }
          );
        } else if (this.validdate()) {

            this.isChecked = false;
            if (this.newPassword != '' && this.newPassword != undefined && this.confirmNewPassword !='' && this.confirmNewPassword != undefined)
            {
              this.confirmFlag = (this.newPassword != this.confirmNewPassword);
              this.isChecked = (this.newPassword == this.confirmNewPassword); 
            }
            
            // Mật khẩu mới và Mật khẩu nhập lại đúng
            if (this.isChecked) 
            {
              this._coreService.Post("/user/changePass", {
                id: this.modelSend,
                new_password: this.newPassword,
              }).subscribe(
                (res) => {
                  if (res.code === "200") {
                    this.notification.editSuccess();
                    this.getListData();
                  } else {
                    this.notification.editError();
                  }
                },
                (err) => {
                  this.notification.editError();
                }
              );
            }
        } else {
          return;
        }
      }
      this.modalService.close("confirm-change-pass-modal");
    }
  };

  checkPass = () => {
    this.confirmFlag = false;
    this.isChange = true;
    if (this.newPassword == this.confirmNewPassword) {
      this.passwordForm.get("confirmNewPassword").setErrors({ incorrect: true });
      return;
    }
  };

  // set default validate khi thay doi
  changeOldPass() {
    this.flagOldPassword = false;
    this.confirmFlag = false;
    this.isChange = true;
  }
  onKeyDown(event: any) {
    this.confirmFlag = false;
    this.isChange = true;
  }
  onCheckboxChange() {
    if (this.isChecked)
    {
      this.passwordForm.disable();
    } else {
      this.passwordForm.enable();
    }
  }

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

  changeModel = (m) => {
    setTimeout(() => {
      this.searchList();
    }, 200);
  };

  // exportData = () => {
  //   this._coreService.PostExport("/export/user", {
  //     page_no: this.pageIndex,
  //     page_size: this.state.take,
  //     full_name: this.search.full_name,
  //     user_group_id: this.search.user_group_id,
  //     status: this.search.status
  //   }).subscribe((data) => {
  //     const blob = new Blob([data],
  //       { type: 'application/vnd.ms-excel' });

  //     saveAs(blob, "Export.xls");
  //   }, (error) => {
  //     this.notification.warning("Xuất file thất bại!");
  //   })
  // }
}