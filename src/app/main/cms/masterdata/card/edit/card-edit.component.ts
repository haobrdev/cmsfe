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
import { Card } from "src/app/_models/masterdata/Card";
import * as async from "async";
import * as _ from "lodash";

setCulture("vi");

@Component({
  selector: "cms-card-edit",
  templateUrl: "./card-edit.component.html",
  styleUrls: ["./card-edit.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class CardEditComponent implements OnInit {
  // Varriable Language
  flagState = "";
  model: Card = new Card();
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
  lstTypeCard = [];
  lstStatusCard = [];
  lstUserByOrganizations = [];
  paramId: any;
  username: string;
  isloading: boolean;

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
      card_id: [
        "",
        [
          Validators.required,
          Validators.maxLength(255),
          this.globals.noWhitespaceValidator,
        ],
      ],
      card_type: [
        "",
        [
          Validators.required,
        ],
      ],
      number_card: [
        "0",
        [
          Validators.required,
          Validators.maxLength(9),
        ],
      ],
      card_user: [
        "",
        [
          Validators.required,
        ],
      ],
      department: [""],
      status: [""],
      date_range: [
        null,
        [this.validateDatePickerDate]
      ],
      note: [""],
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
    this.model.number_card = 1;
    this.model.status = 31;
    this.isloading = true;

    // Build toolbar
    async.waterfall(
      [
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
          },  (cb2) => {
            this._coreService
              .Get("/dropdown/card/cardstatus")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstStatusCard = res.data;
                  return cb2();
                }
              }, (err) => {
                return cb2();
              });
          }], (err, result) => {
            return cb();
          })
        },
        (cb) => {
          if (this.flagState != "new") {
            this._coreService
              .Get("/card/" + this.paramId)
              .subscribe((res) => {
                if (res.code == "200") {
                  let data = res.data[0];
                  let card_type = data.card_type;
                  this._coreService
                    .Get("/dropdown/inforleavingby/" + card_type.toString() )
                    .subscribe((res) => {
                      if (res.code == "200") {
                        this.lstUserByOrganizations = res.data;
                      }
                      this.model = data;
                   });
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
    
    setTimeout(() => {this.isloading = false;}, 500);
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
          ? "/card/create"
          : "/card/update";
      this._coreService.Post(url, modelRequest).subscribe(
        (res) => {
          if (res && res.code == "200") {
            this.notification.success("Cập nhật thành công!");
            this.router.navigate(["/cms/masterdata/card"]);
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

  back = () => {
    this.router.navigate(["/cms/masterdata/card"]);
  }

  validateDatePickerDate(control) {
    const inputValue = control.value;
    if (inputValue) {
      const parsedDate = new Date(inputValue);
      if (isNaN(parsedDate.getTime())) {
        return { 'invalidDate': true };
      }
    }
    return null;
  }

  getInforleavingbyComboBoxData = () => 
  {
      this.lstUserByOrganizations =[];
      this._coreService
        .Get("/dropdown/inforleavingby/" + this.model.card_type.toString() )
        .subscribe((res) => {
          this.model.card_user = null;
          if (res.code == "200") {
            this.lstUserByOrganizations = res.data;
          }
         });
  }
 changeModel = () => 
 {
    if ((!this.isloading) )
    {
        this.getInforleavingbyComboBoxData();
    }                    
  }
}
