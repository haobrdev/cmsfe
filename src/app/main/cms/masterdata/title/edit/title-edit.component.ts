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
import { Title } from "src/app/_models/masterdata/Title";
import { TreeView } from "@syncfusion/ej2-navigations";
import * as $ from "jquery";
import * as moment from "moment";
import * as async from "async";
import * as _ from "lodash";

setCulture("vi");

@Component({
  selector: "app-title-edit",
  templateUrl: "./title-edit.component.html",
  styleUrls: ["./title-edit.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class TitleEditComponent implements OnInit {
  // Varriable Language
  flagState = "";
  model: Title = new Title();
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

  lstStatus = [];
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
      status: [1],
      orders: [""],
      description: [""],
      status_name: [""],
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
          if (this.flagState != "new") {
            this._coreService
              .Get("/title/" + this.paramId)
              .subscribe((res) => {
                if (res.code == "200") {
                  this.model = res.data;
                  this.model.flag_status = res.data.status  ==1 ? true: false;
                  cb();
                }
              });
          } else {
            this.model.status = 2;
            this.model.flag_status = false;
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

  changeAcctive = () => {
    this.model.status =  this.model.flag_status ? 2: 1;
  }
  saveData() {
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
          ? "/title/create"
          : "/title/update";
      this._coreService.Post(url, modelRequest).subscribe(
        (res) => {
          if (res && res.code == "200") {
            this.notification.success("Cập nhật thành công!");
            this.router.navigate(["/cms/masterdata/title"]);
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

  prepareModelBeforeSave = () => {
    let objAPI = Object.assign({}, this.model);
    Object.keys(objAPI).map(
      (k) =>
      (objAPI[k] =
        typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );

    return objAPI;
  };

  //huy
  uploadFile(files: FileList) {
    // setTimeout(() => {
    //   if (files.length > 0) {
    //     this._configService.loadingSubject.next("true");
    //     for (let i = 0; i < files.length; i++) {
    //       const fsize = files.item(i).size;
    //       const file = Math.round(fsize / 1024);
    //       if (file > 5120) {
    //         this._configService.loadingSubject.next("false");
    //         this.notification.warning("Vui lòng tải File < 5MB");
    //         let x: any = document.getElementById("avatar");
    //         x.value = null;
    //         return;
    //       }
    //     }
    //     let data = new FormData();
    //     data.append("files", files[0]);
    //     this._coreService.uploadFile(data).subscribe((res) => {
    //       if (res && res.status && res.status == 200) {
    //         this.avatar = res.data[0].url;
    //         this._configService.loadingSubject.next("false");
    //       } else {
    //         this._configService.loadingSubject.next("false");
    //         this.notification.warning("Tải ảnh không thành công");
    //       }
    //     }, (err) => {
    //       this._configService.loadingSubject.next("false");
    //       this.notification.warning("Tải ảnh không thành công");
    //     });
    //   }
    // }, 200);
  }
//huy

  back = () => {
    this.router.navigate(["/cms/masterdata/title"]);
  }

  // filter status
  public onFiltering(e, lst) {
    e.preventDefaultProvince = true;
    const predicate = new Predicate("name", "contains", e.text, true, true);
    this.query = new Query();
    this.query = e.text !== "" ? this.query.where(predicate) : this.query;
    e.updateData(lst, this.query);
  }
}


