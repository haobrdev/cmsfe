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
import {  ToolbarInterface } from "src/app/_models/index";
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
import { Query, Predicate } from "@syncfusion/ej2-data";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import { GuestCalendar } from "src/app/_models/business/GuestCalendar";
import * as async from "async";
import * as _ from "lodash";
import { GuestCalendarService } from "src/app/_services/guestCalendar.service";

setCulture("vi");

@Component({
  selector: "app-guestcalendar-edit",
  templateUrl: "./guestcalendar-edit.component.html",
  styleUrls: ["./guestcalendar-edit.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class GuestCalendarEditComponent implements OnInit {
  // Varriable Language

  flagState = "";
  model: GuestCalendar = new GuestCalendar();
  languages: any;
  selectedLanguage: any;
  editForm: FormGroup;

  // vi tri focus
  public query = new Query();
  public department_name = new String;
  public job_title_name = new String;
  public fields: FieldSettingsModel = { text: "name", value: "id" };
  // Toolbar Item
  public toolbar: ToolbarInterface[];
  @ViewChild("contentFull", { static: false })
  public contentFull: RichTextEditorComponent;

  public today: Date = new Date();
  public currentYear: number = this.today.getFullYear();
  public currentMonth: number = this.today.getMonth();
  public currentDay: number = this.today.getDate();

  public minDate: Object = new Date(this.currentYear, this.currentMonth, this.currentDay);


  lstOrgs = [];
  lstTitles = [];
  lstStatus = [];
  lstPersons = [];
  paramId: any;
  username: string;

  /**
   * Constructor
   *
   */
  constructor(
    private _coreService: CoreService,
    private _guestcalendarService: GuestCalendarService,
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
      // If status is "edit" => Get data
      if (paramId !== "new") {
        const objParam = window.atob(paramId);
        const paramUrl = JSON.parse(objParam);
        if (paramUrl && paramUrl.id) {
          this.paramId = paramUrl.id;
          this.flagState = paramUrl.type;
        } else {
          // redirect
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
      time_regist: [
        "",
        [
          Validators.required,
          this.dateValidation.bind(this)]
      ],
      invited_guest: [
        "",
        [
          Validators.required,
          Validators.maxLength(255),
          this.globals.noWhitespaceValidator,
        ],
      ],
      phone_number: [""],
      status: [""],
      invited_person:[
        "",
        [
          Validators.required,
          Validators.maxLength(255),
          this.globals.noWhitespaceValidator,
        ],
      ],
      department: [""],
      department_name: [""],
      job_title: [""],
      job_title_name: [""],
      job_description: [""],
      participant_information: [""],
    });

    // Set the private defaults
    L10n.load(this.configs.languageGrid);
  }

  dateValidation(control) {
    const selectedDatetime = control.value;
    const currentDatetime = new Date();

    if (selectedDatetime && selectedDatetime < currentDatetime) {
      return { invalidDate: true };
    }

    return null;
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
    this.getStatusComboBoxData();
    this.getPersonComboBoxData();
    this.getDetailListData();

    async.waterfall(
      [
        (cb) => {
          async.parallel([(cb1) => {
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
          }], (err, result) => {
            return cb();
          })
        },
        (cb) => {
          this._coreService
            .Get("/dropdown/title")
            .subscribe((res) => {
              if (res.code == "200") {
                this.lstTitles = res.data;
                return cb();
              }
            }, (err) => {
              return cb();
            });
        },(cb) => {
          if (this.flagState != "new") {
            this._coreService
              .Get("/guestcalendar/" + this.paramId)
              .subscribe((res) => {
                if (res.code == "200") {
                  this.model = res.data;
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

  getStatusComboBoxData = () => {
    async.parallel([(cb) => {
      this._coreService
      .Get("/dropdown/status")
        .subscribe((res) => {
          if (res.code == "200") {
            this.lstStatus = res.data;
            if(this.lstStatus){
              this.model.status = this.lstStatus[0].id
            }
            return cb();
          }
        }, (err) => {
          return cb();
        });
    }] )
  }

  getPersonComboBoxData = () => {
    async.parallel([(cb) => {
      this._coreService
      .Get("/dropdown/inforleavingbyemployee")
        .subscribe((res) => {
          if (res.code == "200") {
            this.lstPersons = res.data;
            return cb();
          }
        }, (err) => {
          return cb();
        });
    }] )
  }

  getDetailListData = () => {
    async.parallel([
      (cb) => {
        if (this.flagState != "new") {
          this._coreService
            .Get("/inforleaving/" + this.paramId)
            .subscribe((res) => {
              if (res.code == "200") {
                this.model = res.data[0];
                cb();
              }
            });
        } else {
          cb();
        }
      },] )
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
      
      //Create item
      if (this.flagState && this.flagState === "new")
      {
        this._guestcalendarService.create(modelRequest).subscribe(
          (res) => {
            if (res && res.code == "200") {
              this.notification.success("Cập nhật thành công!");
              this.router.navigate(["/cms/masterdata/guestcalendar"]);
            } else {
              this.notification.warning(`${res.error}!`);
            }
          },
          (error) => {
            this.notification.warning(`Lỗi hệ thống!`);
          }
        );

      }
       else {
        // Update item
        this._guestcalendarService.update(modelRequest).subscribe(
          (res) => {
            if (res && res.code == "200") {
              this.notification.success("Cập nhật thành công!");
              this.router.navigate(["/cms/masterdata/guestcalendar"]);
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
  }

  prepareModelBeforeSave = () => {
    let objAPI = Object.assign({}, this.model);
    if (objAPI.time_regist != null) {
      objAPI.time_regist = this.globals.convertDateStringFull(objAPI.time_regist);
    }
    Object.keys(objAPI).map(
      (k) =>
      (objAPI[k] =
        typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );

    return objAPI;
  };

  back = () => {
    this.router.navigate(["/cms/masterdata/guestcalendar"]);
  }

  changeModel = () => {
    setTimeout(() => {
      if (this.model.invited_person != null)
      {
        let person: any = this.lstPersons.filter(x => x.id.toString() === this.model.invited_person.toString())[0];
        if (person != null)
        {
          this.model.department = person.org_id;
          this.department_name =  person.org_name;
          this.model.job_title = person.title_id;
          this.job_title_name  = person.title_name;
        }
      }
    }, 100);
  };
  isFutureDate(dateTime: Date): boolean {
    if(dateTime != null){
      const currentDateTime = new Date();
      return dateTime < currentDateTime;
    }
    return false;
  }

  // filter status
  public onFiltering(e, lst) {
    e.preventDefaultProvince = true;
    const predicate = new Predicate("name", "contains", e.text, true, true);
    this.query = new Query();
    this.query = e.text !== "" ? this.query.where(predicate) : this.query;
    e.updateData(lst, this.query);
  }

  onlyNumberKey(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  
}


