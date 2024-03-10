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
import { Function } from "src/app/_models/authen/Function";
import { TreeView } from "@syncfusion/ej2-navigations";
import * as $ from "jquery";
import * as moment from "moment";
import * as async from "async";
import * as _ from "lodash";

setCulture("vi");

@Component({
  selector: "app-function-edit",
  templateUrl: "./function-edit.component.html",
  styleUrls: ["./function-edit.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class FunctionEditComponent implements OnInit {
  // Varriable Language
  flagState = "";
  public avatar = "/assets/images/addPicture.png";
  model: Function = new Function();
  languages: any;
  selectedLanguage: any;
  editForm: FormGroup;

  // vi tri focus
  public query = new Query();
  public fields: FieldSettingsModel = { text: "name", value: "id" };
  // Toolbar Item
  public toolbar: ToolbarInterface[];
  @ViewChild("contentFull", { static: false })
  public contentFull: RichTextEditorComponent;
  lstParents = [];

  private _unsubscribeAll: Subject<any>;
  paramId: any;
  username: string;

  // hoàn thêm biến - start
  checkWarn: boolean = false;
  // -end

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
      code: [
        "",
        [
          Validators.required,
          Validators.maxLength(255),
          this.globals.noWhitespaceValidator,
        ],
      ],
      name: [
        "",
        [
          Validators.required,
          Validators.maxLength(255),
          this.globals.noWhitespaceValidator,
        ],
      ],
      parent_id: [""],
      description: [""],
      url: ["", Validators.required],
      status: [""],
      status_id: [""],
      orders: [""]
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

    // Build toolbar
    async.waterfall(
      [
        (cb) => {
          this._coreService.Get("/dropdown/function").subscribe((data) => {
            this.lstParents = _.filter(data.data, (item) => {
              return item.parent_id == null;
            });
            return cb();
          })
        },
        (cb) => {
          if (this.flagState != "new") {
            this._coreService
              .Get("/function/" + this.paramId)
              .subscribe((res) => {
                if (res.code == "200") {
                  this.model = res.data;
                  this.model.status_id = this.model.status ==1? true: false;
                  this.avatar = res.data && res.data.avatar ? res.data.avatar : this.avatar;
                  this.editForm.get("code").disable();
                  cb();
                }
              });
          } else {
            cb();
          }
        },
      ],
      (err, ok) => {
      }
    );
    if (this.flagState == "view") {
      this.editForm.disable();
    }
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
          ? "/function/create"
          : "/function/update";
      this._coreService.Post(url, modelRequest).subscribe(
        (res) => {
          if (res && res.code == "200") {
            this.notification.success("Cập nhật thành công!");
            this.router.navigate(["/cms/authen/function"]);
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
    objAPI.status = this.model.status_id ? 1 :0;
    Object.keys(objAPI).map(
      (k) =>
      (objAPI[k] =
        typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );
    return objAPI;
  };

  back = () => {
    if (this.editForm.dirty && this.editForm.touched) {
      this.checkWarn = true;
      this.modalService.open("confirm-back-modal");
    } else {
    this.router.navigate(["/cms/authen/function"]);
    }

  }

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


  // filter status
  public onFiltering(e, lst) {
    e.preventDefaultAction = true;
    const predicate = new Predicate("name", "contains", e.text, true, true);
    this.query = new Query();
    this.query = e.text !== "" ? this.query.where(predicate) : this.query;
    e.updateData(lst, this.query);
  }


  changeStatus = () => {
    setTimeout(() => {
      if (this.model.status_id) {

        this.model.status = 1;
      } else {
        this.model.status = 2;
      }
    }, 50);
  }

  confirmBack = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-back-modal");
    } else {
      this.modalService.close("confirm-back-modal");
    this.router.navigate(["/cms/authen/function"]);
    }
  };


}
