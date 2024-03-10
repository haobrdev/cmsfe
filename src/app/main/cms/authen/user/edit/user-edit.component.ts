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
import { User } from "src/app/_models/authen/User";
import { TreeView } from "@syncfusion/ej2-navigations";
import * as $ from "jquery";
import * as moment from "moment";
import * as async from "async";
import * as _ from "lodash";
import { MultiSelectComponent } from "@syncfusion/ej2-angular-dropdowns";
import { TreeViewComponent } from "@syncfusion/ej2-angular-navigations";

setCulture("vi");

@Component({
  selector: "app-user-edit",
  templateUrl: "./user-edit.component.html",
  styleUrls: ["./user-edit.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class UserEditComponent implements OnInit {
  // Varriable Language
  flagState = "";
  public avatar = "";
  public signature = "";
  model: User = new User();
  languages: any;
  selectedLanguage: any;
  editForm: FormGroup;

  public selectAllText: string;
  public unSelectAllText: string;
  customMaximumMulti = 2000;
  public mode: string;
  public dataBefore: string;
  public dataBefore_email : string;

  // tắt thuộc tính không cho chèn iframe vào
  public enableSanitixze: boolean = false;
  // vi tri focus
  public ranges: Range;
  public selection: NodeSelection = new NodeSelection();
  public lstUserGroups = [];
  public lstUserClients = [];
  public lstStatus = [];
  public lstPermissions = [];
  public Editor = ClassicEditor;
  public query = new Query();
  public fields: FieldSettingsModel = { text: "name", value: "id" };
  // Toolbar Item
  public toolbar: ToolbarInterface[];
  @ViewChild("contentFull", { static: false })
  public contentFull: RichTextEditorComponent;

  @ViewChild("majorMultiselect", { static: false })
  public majorMultiselect: MultiSelectComponent;

  @ViewChild("tree", { static: false })
  public tree: TreeViewComponent;

  @ViewChild("orgDroplist", { static: false })
  public orgDroplist: any;

  public treeObj: TreeView;

  private _unsubscribeAll: Subject<any>;
  paramId: any;
  username: string;
  flagEdit = true;
  groupOptions: {
    showDropArea: boolean;
    columns: string[];
    captionTemplate: string;
  };

  lstOrgs = [];
  lstOrg2s = [];
  lstTitles = [];
  lstProvinces = [];
  lstDistricts = [];
  lstWards = [];
  lstUserTypes = [];
  lstGenders = [];
  lstAllUser = [];

  // hoàn thêm biến - start
  checkWarn: boolean = false;
  // info org_id
  org_id_info: string;

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
      org_id: ["", Validators.required],
      title_id: ["", Validators.required],
      username: [
        "",
        [
          Validators.maxLength(100),
          Validators.required
        ],
      ],
      full_name: [
        "",
        [
          Validators.required,
          Validators.maxLength(255),
          this.globals.noWhitespaceValidator,
        ],
      ],
      password: ["", [Validators.required, 
        Validators.maxLength(255),
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
      confirm_password: ["", [Validators.required,
        Validators.maxLength(255),
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      email: ["", [Validators.required]],
      address: ["", Validators.required],
      user_group_id: ["", [Validators.required]],
      client_id: [""],
      phone: ["", [Validators.required]],
      is_org_present: [""],
      status: [""],
      work_phone: [""],
      birth_date: [""],
      gender_id: [""],
      province_id: [""],
      district_id: [""],
      ward_id: [""],
      is_delegate: [""],
      is_chair: [""],
      is_approve_user: [""],
      is_secretary: [""],
      is_tracking_specialist: [""],
      list_org_manages: [""],
      user_type: [""]
    });

    // Thêm validator custom 'duplicate' cho trường 'username'
    this.editForm.get('username').setValidators([Validators.required, this.checkDuplicate.bind(this)]);

    // Thêm validator custom 'duplicate' cho trường 'email'
    this.editForm.get('email').setValidators([Validators.required, this.checkEmailDuplicate.bind(this)]);

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

    // Build toolbar
    let model = null;
    async.waterfall(
      [
        (cb) => {
          if (this.paramId && this.flagState != "new") {
            async.parallel([(cb1) => {
              this._coreService
              .Get("/user/" + this.paramId)
              .subscribe((res) => {
                if (res.code && res.code == "200") {
                  model = res.data;
                  this.dataBefore = model.username;
                  this.dataBefore_email = model.email;
                  this.avatar = model && model.avatar ? model.avatar : this.avatar;
                  this.signature = model && model.signature ? model.signature : this.signature;
                  if (model.list_groups && model.list_groups.length > 0) {
                    model.list_group2s = [];
                    for (let i = 0; i < model.list_groups.length; i++) {
                      model.list_group2s.push(model.list_groups[i].user_group_id)
                    }
                  }
                  if (model.list_clients && model.list_clients.length > 0) {
                    model.list_client2s = [];
                    for (let i = 0; i < model.list_clients.length; i++) {
                      model.list_client2s.push(model.list_clients[i].client_id)
                    }
                  }
                  if (model.list_org_manages && model.list_org_manages.length > 0) {
                    model.list_org_manage2s = [];
                    for (let i = 0; i < model.list_org_manages.length; i++) {
                      model.list_org_manage2s.push(model.list_org_manages[i].org_id)
                    }
                  }
                  return cb1();
                }
              }, (error) => {
                return cb1();
              });
            }, (cb2) => {
              this._coreService
                .Get("/user/allUser")
                .subscribe((res) => {
                  if (res.code && res.code == "200") {
                    this.lstAllUser = res.data;
                    return cb2();
                  }
                }, (error) => {
                  return cb2();
                });
            }], (err, result) => {
              return cb();
            })
          } else {
            async.parallel([(cb1) => {
              this._coreService
              .Get("/user/allUser")
              .subscribe((res) => {
                if (res.code && res.code == "200") {
                  this.lstAllUser = res.data;
                  return cb1();
                }
              }, (error) => {
                return cb1();
              });
            }], (err, result) => {
              return cb();
            })
          }
        },
        (cb) => {
          this._coreService.Post("/client/list",
            {
              page_no: 1,
              page_size: 9999,
              types: 1
            }).subscribe((data) => {
            this.lstUserClients = data.data.data;
            return cb();
          })
        },
        (cb) => {
          async.parallel([(cb1) => {
            this._coreService
              .Get("/dropdown/otherListByCode/gender")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstGenders = res.data;
                  return cb1();
                }
              }, (err) => {
                return cb1();
              });
          }, (cb1) => {
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
          }, 
          (cb1) => {
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
                  return cb1();
                }
              }, (err) => {
                return cb1();
              });
          }, 
          (cb1) => {
            this._coreService
              .Get("/dropdown/title")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstTitles = res.data;
                  return cb1();
                }
              }, (err) => {
                return cb1();
              });
          }, 
          (cb1) => {
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
          }, 
          (cb1) => {
            this._coreService
              .Get("/dropdown/usergroup")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstUserGroups = res.data;
                  return cb1();
                }
              }, (err) => {
                return cb1();
              });
          }, 
          (cb1) => {
            this._coreService
              .Get("/dropdown/province")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstProvinces = res.data;
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
          if (model && model.province_id) {
            this._coreService
              .Get("/dropdown/provinceBy/" + model.province_id)
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstDistricts = res.data;
                  return cb();
                }
              }, (err) => {
                return cb();
              });
          }
        },
         (cb) => {
          if (model && model.district_id) {
            this._coreService
              .Get("/dropdown/provinceBy/" + model.district_id)
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstWards = res.data;
                  return cb();
                }
              }, (err) => {
                return cb();
              });
          }
        }
      ],
      (err, ok) => {
        this.model = model;
        this.org_id_info = this.model.org_id;
        if (this.flagState !== "new") {
          setTimeout(() => {
            let drop = (document.getElementById("org_id") as any)
              .ej2_instances[0];
            drop.inputElement.value = model.org_name;
          }, 300);
        }

        if (this.flagState == "view") {
          this.editForm.disable();
        }
      }
    );
  }

  saveData() {
    if (!this.avatar || this.avatar === "/assets/images/addPicture.png") {
      this.notification.warning("Bạn chưa chọn Ảnh đại diện!");
      // window.scrollTo(0, 0);
      return;
    }
    if (this.flagState !== "new") {
      this.editForm.get("password").setErrors(null);
      this.editForm.get("confirm_password").setErrors(null);
    }
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
          ? "/user/create"
          : "/user/update";
      this._coreService.Post(url, modelRequest).subscribe(
        (res) => {
          if (res && res.code == "200") {
            this.notification.success("Cập nhật thành công!");
            this.router.navigate(["/cms/authen/user"]);
          } else {
            this.notification.warning(`${res.error}!`);
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
    }, 100);

    
  }

  uploadSignature(files: FileList) {
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
            let x: any = document.getElementById("signature");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            this.signature = res.data[0].url;
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
    this.model[model] = "";
    if (model == 'avatar') {
      this.avatar = "";
    } else {
      this.signature = "";
    }
  };

  prepareModelBeforeSave = () => {
    this.model.org_id = this.org_id_info;
    let objAPI = Object.assign({}, this.model);
    objAPI.avatar = this.avatar;
    objAPI.signature = this.signature;
    if (objAPI.birth_date != null) {
      objAPI.birth_date = this.globals.convertDateString(objAPI.birth_date);
    }

    if (objAPI.list_group2s && objAPI.list_group2s.length > 0) {
      objAPI.list_groups = [];
      for (let i = 0; i < objAPI.list_group2s.length; i++) {
        objAPI.list_groups.push({
          user_group_id: objAPI.list_group2s[i]
        })
      }
    }

    if (objAPI.list_client2s && objAPI.list_client2s.length > 0) {
      objAPI.list_clients = [];
      for (let i = 0; i < objAPI.list_client2s.length; i++) {
        objAPI.list_clients.push({
          client_id: objAPI.list_client2s[i]
        })
      }
    }

    if (objAPI.list_org_manage2s && objAPI.list_org_manage2s.length > 0) {
      objAPI.list_org_manages = [];
      for (let i = 0; i < objAPI.list_org_manage2s.length; i++) {
        objAPI.list_org_manages.push({
          org_id: objAPI.list_org_manage2s[i]
        })
      }
    }
    Object.keys(objAPI).map(
      (k) =>
      (objAPI[k] =
        typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );

    return objAPI;
  };

  // back = () => {
  //   this.checkWarn = true
  //   this.router.navigate(["/cms/authen/user"]);
  // }

  back = () => {
    if (this.editForm.dirty && this.editForm.touched) {
      this.checkWarn = true;
      this.modalService.open("confirm-back-modal");
    } else {
      this.router.navigate(["/cms/authen/user"]);
    }
  }
  
  confirmBack = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-back-modal");
    } else {
      this.modalService.close("confirm-back-modal");
      this.router.navigate(["/cms/authen/user"]);
    }
  };

  checkPhoneNumber = (model) => {
    if (this.model && this.model[model] && this.model[model].length > 0) {
      if (this.model[model].length > 30) {
        this.editForm.get(model).setValue("");
        return;
      }
      if (this.model[model].length > 11) {
        this.editForm.get(model).setErrors({ incorrect: true });
        return;
      }
      const valid = this.globals.checkMobile(this.model[model]);
      if (valid) {
        this.editForm.get(model).setErrors(null);
        return;
      } else {
        this.editForm.get(model).setErrors({ incorrect: true });
        return;
      }
    } else {
      this.editForm.get(model).setErrors(null);
      return;
    }
  };

  changePass = () => {
    setTimeout(() => {
      if (this.model.password && this.model.confirm_password && this.model.password !== this.model.confirm_password) {
        this.editForm.get("confirm_password").setErrors({ incorrect: true });
      } else if (!this.model.confirm_password && this.editForm.get("confirm_password").touched) {
        this.editForm.get("confirm_password").setErrors({ require: true });
      } else {
        this.editForm.get("confirm_password").setErrors(null);
      }
    }, 50);
  }
  // filter status
  public onFiltering(e, lst) {
    e.preventDefaultAction = true;
    const predicate = new Predicate("name", "contains", e.text, true, true);
    this.query = new Query();
    this.query = e.text !== "" ? this.query.where(predicate) : this.query;
    e.updateData(lst, this.query);
  }

  changeUserType = (event) => {
    setTimeout(() => {
      if (this.model.user_type) {
        if (this.model.user_type == 12) {
          this.editForm.get("list_manange_orgs").setValidators(Validators.required);
          this.editForm.get("list_manange_orgs").updateValueAndValidity();
        } else {
          this.editForm.get("list_manange_orgs").setValidators(null);
          this.editForm.get("list_manange_orgs").updateValueAndValidity();
        }
      }
    }, 50);
  }
  changeProvince = (e: any) => {
    if (e.isInteracted) {
      this.model.district_id = null;
      this.lstDistricts = [];
      this.model.ward_id = null;
      this.lstWards = [];
      setTimeout(() => {
        if (this.model.province_id != null) {
          this._coreService.Get("/dropdown/provinceBy/" + this.model.province_id).subscribe((data) => {
            if (data && data.code && data.code === "200") {
              this.lstDistricts = data.data;
            }
          })
        }
      }, 200)
    }
  }

  changeDistrict = (e: any) => {
    if (e.isInteracted) {
      this.model.ward_id = null;
      this.lstWards = [];
      setTimeout(() => {
        if (this.model.district_id != null) {
          this._coreService.Get("/dropdown/provinceBy/" + this.model.district_id).subscribe((data) => {
            if (data && data.code && data.code === "200") {
              this.lstWards = data.data;
            }
          })
        }
      }, 200)
    }
  }

  public onOpenChooseOrg = () => {
    // modifying the dropdownlist's classes for styling
    $("#tree").html("<div id='tree'></div>");

    let selectNodes = [];
    if (this.model && this.model.org_id) {
      const selectNodeIndex = _.findIndex(this.lstOrgs, item => {
        return (
          item.id === this.model.org_id
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
        child: "childs",
        expanded: "expanded"
      },
      selectedNodes: selectNodes,
      // use the nodeselected event to add the text to dropdown's input element.
      nodeSelected: (args: any) => {
        let drop = (document.getElementById("org_id") as any)
          .ej2_instances[0];
        const selectOrgParent = _.filter(this.lstOrgs, item => {
          return item.id.toString() === args.nodeData.id.toString();
        });
        if (selectOrgParent && selectOrgParent.length) {
          this.org_id_info = selectOrgParent[0].id;
          drop.inputElement.value = args.nodeData.text;
          this.editForm.get("org_id").setErrors(null);

          this.orgDroplist.focusOut();
        }
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
      // for (let i = 0; i < object.childs.length; i++) {
      //   this.prepareDataRender(object.childs[i], object.id);
      // }
    }
    this.lstOrg2s.push(object);
  };

  checkDuplicate(control) {
    if(this.flagState !== "edit")
    {
      const isDuplicate = this.lstAllUser.some(x => x.username === control.value);
      if (isDuplicate) {
        return { duplicate: true }; // Trả về error 'duplicate' nếu có username trùng lặp
      }
      return null; // Trả về null nếu không có lỗi 'duplicate'
    }
    else
    {
      const isDuplicate = this.lstAllUser.some(x => x.username === control.value && x.username !== this.dataBefore);
      if (isDuplicate) {
        return { duplicate: true }; // Trả về error 'duplicate' nếu có username trùng lặp
      }
      return null; // Trả về null nếu không có lỗi 'duplicate'
    }
  }
  
  checkEmailDuplicate(control) {
    if(this.flagState !== "edit")
    {
      const isDuplicate = this.lstAllUser.some(x => x.email === control.value);
      if (isDuplicate) {
        return { duplicate: true }; // Trả về error 'duplicate' nếu có email trùng lặp
      }
      return null; // Trả về null nếu không có lỗi 'duplicate'
    }
    else
    {
      const isDuplicate = this.lstAllUser.some(x => x.email === control.value && x.email !== this.dataBefore_email);
      if (isDuplicate) {
        return { duplicate: true }; // Trả về error 'duplicate' nếu có email trùng lặp
      }
      return null; // Trả về null nếu không có lỗi 'duplicate'
    }
  }
}
