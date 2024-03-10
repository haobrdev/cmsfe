import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  Inject,
  ElementRef,
} from "@angular/core";
import { Subject } from "rxjs";
import { Router, ActivatedRoute, Params } from "@angular/router";

// Service Translate
import { TranslationLoaderService } from "src/app/common/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
// Import the locale files
import { locale as english } from "../i18n/en";
import { locale as vietnam } from "../i18n/vi";
import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// Globals File
import { Globals } from "src/app/common/globals";
import { Configs } from "src/app/common/configs";
import { Notification } from "src/app/common/notification";

import { L10n, setCulture } from "@syncfusion/ej2-base";
import {
  FilterService,
  GridComponent,
  VirtualScrollService,
} from "@syncfusion/ej2-angular-grids";
import { ToolbarItem, ToolbarInterface } from "src/app/_models/index";
import {
  ToolbarService,
  LinkService,
  ImageService,
  HtmlEditorService,
  QuickToolbarService,
  RichTextEditorComponent,
} from "@syncfusion/ej2-angular-richtexteditor";
import {
  RichTextEditor,
  Toolbar,
  Image,
  Link,
  HtmlEditor,
  Table,
  QuickToolbar,
  NodeSelection,
} from "@syncfusion/ej2-richtexteditor";
RichTextEditor.Inject(Toolbar, Table, Image, Link, HtmlEditor, QuickToolbar);
import { CoreService } from "src/app/_services/core.service";
import { ConfigService } from "src/app/_services/config.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ModalService } from "src/app/_services/modal.service";
import { Query, Predicate, DataManager } from "@syncfusion/ej2-data";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import { Organization } from "src/app/_models/masterdata/Organization";
import { TreeView } from "@syncfusion/ej2-navigations";
import * as $ from "jquery";
import * as moment from "moment";
import * as async from "async";
import * as _ from "lodash";
import { TreeViewComponent } from "@syncfusion/ej2-angular-navigations";

setCulture("vi");

@Component({
  selector: "app-organization-edit",
  templateUrl: "./organization-edit.component.html",
  styleUrls: ["./organization-edit.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationEditComponent implements OnInit {
  // Varriable Language
  flagState = "";
  public avatar = "/assets/images/addPicture.png";
  model: Organization = new Organization();
  languages: any;
  selectedLanguage: any;
  editForm: FormGroup;

  // vi tri focus
  public query = new Query();
  public fields: FieldSettingsModel = { text: "name", value: "id" };
  // Toolbar Item
  public toolbar: ToolbarInterface[];

  @ViewChild("tree", { static: false })
  public tree: TreeViewComponent;

  @ViewChild("orgDroplist", { static: false })
  public orgDroplist: any;

  public treeObj: TreeView;

  lstOrgs = [];
  lstOrg2s = [];
  lstOrgLevelOrigins = [];
  lstOrgLevels = [];
  private _unsubscribeAll: Subject<any>;
  paramId: any;
  username: string;

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
    private _formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    private _translateService: TranslateService,
    private _configService: ConfigService,
    private _tlaTranslationLoaderService: TranslationLoaderService,
    private el: ElementRef

  ) {
    // Get Route Param
    this.activatedRoute.params.subscribe((params: Params) => {
      const paramId = params["id"];
      // Nếu trạng thái chỉnh sửa thì Get dữ liệu
      if (paramId !== "new") {
        const objParam = window.atob(paramId);
        const paramUrl = JSON.parse(objParam);
        if (paramUrl && paramUrl.id) {
          this.paramId = paramUrl.id;
          this.flagState = paramUrl.type;
        } else {
          // Xu ly redirect
          this.router.navigate(["/errors/404"]);
        }
      } else {
        this.flagState = "new";
      }
    });

    // Set language
    this.languages = this.globals.languages;

    this._configService._configSubject.next("true");
    // Load file language
    this._tlaTranslationLoaderService.loadTranslations(vietnam, english);

    this.editForm = this._formBuilder.group({
      name: [
        "",
        [
          Validators.required,
          Validators.maxLength(255),
          this.globals.noWhitespaceValidator,
        ],
      ],
      name_en: [""],
      name_short: [""],
      name_compact: [""],
      parent_id: ["", Validators.required],
      is_org: [""],
      org_level: [""],
      orders: [""],
      description: [""]
    });

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

    let modelInit = null;
    // Build toolbar
    async.waterfall(
      [
        (cb) => {
          if (this.flagState != "new") {
            this._coreService
              .Get("/organization/" + this.paramId)
              .subscribe((res) => {
                if (res.code == "200") {
                  modelInit = res.data;
                  this.avatar = res.data && res.data.avatar ? res.data.avatar : this.avatar;
                  cb();
                }
              });
          } else {
            cb();
          }
        },
        (cb) => {
          async.parallel([(cb1) => {
            this._coreService
              .Post("/organization/getTree", {
                parent_id: null
              })
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstOrg2s = [];
                  if (res.data && res.data.length > 0) {
                    for (let n = 0; n < res.data.length; n++) {
                      this.prepareDataRender(res.data[n]);
                    }
                  }
                  this.lstOrg2s = _.sortBy(this.lstOrg2s, "orders");
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
            .Get("/dropdown/otherListByCode/org_level")
            .subscribe((res) => {
              if (res.code == "200") {
                this.lstOrgLevelOrigins = res.data;
                return cb();
              }
            }, (err) => {
              return cb();
            });
        },
        (cb) => {
          this._coreService
            .Get("/dropdown/organization2")
            .subscribe((res) => {
              if (res.code == "200") {
                this.lstOrgs = res.data;
                return cb();
              }
            }, (err) => {
              return cb();
            });
        }
      ],
      (err, ok) => {
        if (modelInit) {
          this.model = modelInit;
          setTimeout(() => {
            let drop = (document.getElementById("parent_id") as any)
              .ej2_instances[0];
            drop.inputElement.value = modelInit.parent_name;
          }, 100);
        }
        if (this.flagState == "view") {
          this.editForm.disable();
        }

        if (this.flagState === 'edit') {
          this.editForm.get("parent_id").setValidators(null);
          this.editForm.get("parent_id").updateValueAndValidity();

          if (this.model.org_level) {
            if (this.model.org_level == 3) {
              this.model.parent_id = null;
              this.editForm.get("parent_id").disable();
              this.editForm.get("parent_id").setValidators(null);
              this.editForm.get("parent_id").updateValueAndValidity();
            } else {
              this.editForm.get("parent_id").enable();
              this.editForm.get("parent_id").setValidators(Validators.required);
              this.editForm.get("parent_id").updateValueAndValidity();
            }
          }
        }
        if (this.flagState == "new") {
          this.lstOrgLevels = _.cloneDeep(this.lstOrgLevelOrigins);
        } else {
          this.changeOrg();
        }
      }
    );

  }

  changeOrg = () => {
    setTimeout(() => {
      if (this.model.parent_id) {
        let objOrg = _.find(this.lstOrgs, (item) => {
          return item.id == this.model.parent_id;
        });

        if (objOrg && objOrg.org_level_code) {
          this.model.org_level = null;
          this.lstOrgLevels = [];
          if (objOrg.org_level_code == "LEVEL_PROVINCE") {
            this.lstOrgLevels = _.filter(this.lstOrgLevelOrigins, (item) => {
              return item.id > 3;
            });
            this.model.org_level = 55;
          } else if (objOrg.org_level_code == "LEVEL_SO") {
            this.lstOrgLevels = _.filter(this.lstOrgLevelOrigins, (item) => {
              return item.id >= 4 && item.id < 50;
            });
            this.model.org_level = 4;
          } else {
            this.lstOrgLevels = _.filter(this.lstOrgLevelOrigins, (item) => {
              return item.id == 5;
            });
            this.model.org_level = 5;
          }
        }
      }
    })
  }


  saveData() {
    // if (!this.avatar || this.avatar === "/assets/images/addPicture.png") {
    //   this.notification.warning("Bạn chưa chọn Ảnh đại diện!");
    //   // window.scrollTo(0, 0);
    //   return;
    // }

    if (!this.editForm.valid) {
      for (const key of Object.keys(this.editForm.controls)) {
        if (this.editForm.controls[key].invalid) {
          const invalidControl = this.el.nativeElement.querySelector(
            '[formcontrolname="' + key + '"]'
          );
          if (invalidControl) {
            if (invalidControl.querySelector("input")) {
              invalidControl.querySelector("input").focus();
            } else {
              invalidControl.focus();
            }
            break;
          }
        }
      }
      this.notification.warning("notify.EDIT_ERROR");
      this.editForm.markAllAsTouched();
      return;
    } else {
      const modelRequest = this.prepareModelBeforeSave();
      const url =
        this.flagState && this.flagState === "new"
          ? "/organization/create"
          : "/organization/update";
      this._coreService.Post(url, modelRequest).subscribe(
        (res) => {
          if (res && res.code == "200") {
            this.notification.success("Cập nhật thành công!");
            this.router.navigate(["/cms/masterdata/organization"]);
          } else {
            if (res.error == "ERROR_ORG_MANAGE_NOT_UPDATE") {
              this.notification.warning("Quản trị đơn vị không được phép sửa thông tin đơn vị quản trị!");
            } else if (res.error == "ERROR_ORG_HAVE_USER") {
              this.notification.warning("Không thể thay đổi đơn vị cha nếu đã phát sinh người dùng!");
            } else {
              this.notification.warning(`${res.error}!`);
            }
          }
        },
        (error) => {
          this.notification.warning(`Lỗi hệ thống!`);
        }
      );
    }
  }

  // upload avatar
  uploadAvatar(files: FileList) {
    setTimeout(() => {
      if (files.length > 0) {
        this._configService.loadingSubject.next("true");
        for (let i = 0; i < files.length; i++) {
          // check file > 5MB
          const fsize = files.item(i).size;
          const file = Math.round(fsize / 1024);
          if (file > 5120) {
            this._configService.loadingSubject.next("false");
            this.notification.warning("Vui lòng tải File < 5MB");
            let x: any = document.getElementById("avatar");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            this.avatar = res.data[0].url;
            this._configService.loadingSubject.next("false");
          } else {
            this._configService.loadingSubject.next("false");
            this.notification.warning("Tải ảnh không thành công");
          }
        }, (err) => {
          this._configService.loadingSubject.next("false");
          this.notification.warning("Tải ảnh không thành công");
        });
      }
    }, 200);
  }
  // xóa avatar
  removeImage = (model) => {
    this.model[model] = "/assets/images/addPicture.png";
    this.avatar = "/assets/images/addPicture.png";
  };

  prepareModelBeforeSave = () => {
    let objAPI = Object.assign({}, this.model);
    // objAPI.avatar = this.avatar;
    Object.keys(objAPI).map(
      (k) =>
      (objAPI[k] =
        typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );

    return objAPI;
  };

  back = () => {
    if (this.editForm.dirty && this.editForm.touched) {
      this.modalService.open("confirm-back-modal");
    } else {
      this.router.navigate(["/cms/masterdata/organization"]);
    }
  }

  confirmBack = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-back-modal");
    } else {
      this.modalService.close("confirm-back-modal");
      this.router.navigate(["/cms/masterdata/organization"]);
    }
  };

  // filter status
  public onFiltering(e, lst) {
    e.preventDefaultProvince = true;
    const predicate = new Predicate("name", "contains", e.text, true, true);
    this.query = new Query();
    this.query = e.text !== "" ? this.query.where(predicate) : this.query;
    e.updateData(lst, this.query);
  }

  changeIsOrg = () => {
    setTimeout(() => {
      if (!this.model.is_org) {
        this.model.org_level = null;
        if (!this.model.parent_id) {
          this.editForm.get("parent_id").enable();
          this.editForm.get("parent_id").setValidators(Validators.required);
          this.editForm.get("parent_id").updateValueAndValidity();
        }
      }
    }, 50)
  }

  changeOrgLevel = (e: any) => {
    if (e.isInteracted) {
      setTimeout(() => {
        if (this.model.org_level) {
          if (this.model.org_level == 3) {
            this.model.parent_id = null;
            this.model.parent_name = "";
            let drop = (document.getElementById("parent_id") as any)
              .ej2_instances[0];
            drop.inputElement.value = this.model.parent_name;
            this.editForm.get("parent_id").disable();
            this.editForm.get("parent_id").setValidators(null);
            this.editForm.get("parent_id").updateValueAndValidity();
          } else {
            this.editForm.get("parent_id").enable();
            if (this.model.parent_id == null) {
              this.editForm.get("parent_id").setValidators(Validators.required);
              this.editForm.get("parent_id").updateValueAndValidity();
            } else {
              this.editForm.get("parent_id").setValidators(null);
              this.editForm.get("parent_id").updateValueAndValidity();
            }
          }
        }
      })
    }
  }

  public onOpenChooseOrg = () => {
    // modifying the dropdownlist's classes for styling
    $("#tree").html("<div id='tree'></div>");

    let selectNodes = [];
    if (this.model && this.model.parent_id) {
      const selectNodeIndex = _.findIndex(this.lstOrgs, item => {
        return (
          item.id === this.model.parent_id
        );
      });
      if (selectNodeIndex > -1) {
        selectNodes.push(this.lstOrgs[selectNodeIndex].id.toString());
      }
    }
    this.orgDroplist.popupObj.element.firstElementChild.className =
      "e-content overflow";
    // rendering the treeview only on first time
    this.treeObj = new TreeView({
      fields: {
        dataSource: this.lstOrg2s,
        id: "id",
        text: "name",
        parentID: "parent_id",
        hasChildren: "hasChild",
        expanded: "expanded"
      },
      selectedNodes: selectNodes,
      // use the nodeselected event to add the text to dropdown's input element.
      nodeSelected: (args: any) => {
        let drop = (document.getElementById("parent_id") as any)
          .ej2_instances[0];

        this.model.parent_id = args.nodeData.id;
        this.changeOrg();
        drop.inputElement.value = args.nodeData.text;
        this.editForm.get("parent_id").setErrors(null);

        this.orgDroplist.focusOut();
      }
    });
    this.treeObj.appendTo("#tree");
  };

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
    this.lstOrg2s.push(object);
  };

}
