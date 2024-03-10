import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  ElementRef,
} from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";

// Service Translate
import { TranslationLoaderService } from "src/app/common/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
// Import the locale files
import { locale as english } from "../i18n/en";
import { locale as vietnam } from "../i18n/vi";

// Globals File
import { Globals } from "src/app/common/globals";
import { Configs } from "src/app/common/configs";
import { Notification } from "src/app/common/notification";

import { L10n, setCulture } from "@syncfusion/ej2-base";
import {
  FilterService,
  VirtualScrollService,
} from "@syncfusion/ej2-angular-grids";
import { ToolbarInterface } from "src/app/_models/index";
import {
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
} from "@syncfusion/ej2-richtexteditor";
RichTextEditor.Inject(Toolbar, Table, Image, Link, HtmlEditor, QuickToolbar);
import { CoreService } from "src/app/_services/core.service";
import { ConfigService } from "src/app/_services/config.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Query } from "@syncfusion/ej2-data";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import { Inforleaving } from "src/app/_models/masterdata/Inforleaving";
import * as async from "async";
import * as _ from "lodash";

setCulture("vi");

@Component({
  selector: "cms-inforleaving-edit",
  templateUrl: "./inforleaving-edit.component.html",
  styleUrls: ["./inforleaving-edit.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class InforLeavingEditComponent implements OnInit {
  // Varriable Language
  flagState = "";
  public portrait_photo = "/assets/images/addPicture_Vehicle.png";
  public front_photo = "/assets/images/addPicture_Vehicle.png";
  public back_photo = "/assets/images/addPicture_Vehicle.png";
  public documenttypes: string[] = [];
  model: Inforleaving = new Inforleaving();
  languages: any;
  selectedLanguage: any;
  editForm: FormGroup;

  // Focus position
  public query = new Query();
  public fields: FieldSettingsModel = { text: "name", value: "id" };
  // Toolbar Item
  public toolbar: ToolbarInterface[];
  @ViewChild("contentFull", { static: false })
  public contentFull: RichTextEditorComponent;

  // List dropdown list
  lstEmployeeType = [];
  lstGenders = [];
  lstJobTitle = [];
  lstDepartment = [];
  lstDocumentType = [];
  paramId: any;
  username: string;

  /**
   * Constructor
   *
   */
  constructor(
    private _coreService: CoreService,
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
      // If the status is edited, then Get data
      if (paramId !== "new") {
        const objParam = window.atob(paramId);
        const paramUrl = JSON.parse(objParam);
        if (paramUrl && paramUrl.id) {
          this.paramId = paramUrl.id;
          this.flagState = paramUrl.type;
        } else {
          // Handling redirects
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
      full_name: [
        "",
        [
          Validators.required,
          Validators.maxLength(255),
          this.globals.noWhitespaceValidator,
        ],
      ],
      gender: [""],
      address: [""],
      employee_type: [
        "",
        [
          Validators.required,
        ],
      ],
      job_title: [""],
      department: [""],
      phone_number: [""],
      email: ["",
      [
        Validators.email,
      ],],
      document_type: [""],
      document_number: [""],
      portrait_photo: [""],
      front_photo: [""],
      back_photo: [""],
    });

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

    // Build toolbar
    async.waterfall(
      [
        (cb) => {
          async.parallel([(cb1) => {
            this._coreService
            .Get("/dropdown/inforleaving/status_infor_leaving")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstEmployeeType = res.data;
                  return cb1();
                }
              }, (err) => {
                return cb1();
              });
          }, (cb1) => {
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
          }, (cb2) => {
            this._coreService
              .Get("/dropdown/title")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstJobTitle = res.data;
                  return cb2();
                }
              }, (err) => {
                return cb2();
              });
          }, (cb2) => {
            this._coreService
            .Get("/dropdown/organization/inforleaving")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstDepartment = res.data;
                  return cb2();
                }
              }, (err) => {
                return cb2();
              });
          }, (cb3) => {
            this._coreService
            .Get("/dropdown/documenttype/document_type")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstDocumentType = res.data;

                  this.lstDocumentType.forEach((element) => {
                    this.documenttypes.push(element.name);
                  });

                  return cb3();
                }
              }, (err) => {
                return cb3();
              });
          }], (err, result) => {
            return cb();
          })
        },
        (cb) => {
          if (this.flagState != "new") {
            this._coreService
              .Get("/inforleaving/" + this.paramId)
              .subscribe((res) => {
                if (res.code == "200") {
                  this.model = res.data[0];

                  this.portrait_photo = this.model.portrait_photo;
                  this.front_photo = this.model.front_photo;
                  this.back_photo = this.model.back_photo;
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
    this.model.document_type = 'CCCD';
    if (this.flagState == "view") {
      this.editForm.disable();
    }
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
          ? "/inforleaving/create"
          : "/inforleaving/update";
      this._coreService.Post(url, modelRequest).subscribe(
        (res) => {
          if (res && res.code == "200") {
            this.notification.success("Cập nhật thành công!");
            this.router.navigate(["/cms/masterdata/inforleaving"]);
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

  // Upload avatar for portrait photo
  uploadPortraitPhoto(files: FileList) {
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
            let x: any = document.getElementById("portrait_photo");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            this.portrait_photo = res.data[0].url;
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

  // Upload avatar for front photo
  uploadFrontPhoto(files: FileList) {
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
            let x: any = document.getElementById("front_photo");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            this.front_photo = res.data[0].url;
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

  // Upload avatar for back photo
  uploadBackPhoto(files: FileList) {
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
            let x: any = document.getElementById("back_photo");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            this.back_photo = res.data[0].url;
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
    if (model == 'portrait_photo') {
      this.portrait_photo = "";
    } else if(model == 'back_photo'){
      this.back_photo = "";
    }else{
      this.front_photo = "";
    }
  };

  prepareModelBeforeSave = () => {

    this.lstJobTitle.forEach((element) => {
      if(element.id == this.model.job_title)
      {
        this.model.job_title = element.name.trim();
      }
    });

    this.lstDepartment.forEach((element) => {
      if(element.id == this.model.department)
      {
        this.model.department = element.name.trim();
      }
    });

    let objAPI = Object.assign({}, this.model);

    objAPI.portrait_photo = this.portrait_photo;
    objAPI.front_photo = this.front_photo;
    objAPI.back_photo = this.back_photo;

    Object.keys(objAPI).map(
      (k) =>
      (objAPI[k] =
        typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );

    return objAPI;
  };

  back = () => {
    this.router.navigate(["/cms/masterdata/inforleaving"]);
  }
}
