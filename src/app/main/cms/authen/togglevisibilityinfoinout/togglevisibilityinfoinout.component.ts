import {
  Component,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
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
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  FilterService,
  VirtualScrollService,
} from "@syncfusion/ej2-angular-grids";
import { CoreService } from "src/app/_services/core.service";
import { ConfigService } from "src/app/_services/config.service";
import {
  ListBoxComponent,
  CheckBoxSelection,
} from "@syncfusion/ej2-angular-dropdowns";
import { ToggleVisibilityInfoinout } from "src/app/_models/masterdata/ToggleVisibilityInfoinout";
import * as async from "async";

ListBoxComponent.Inject(CheckBoxSelection);
setCulture("vi");

@Component({
  selector: "cms-togglevisibilityinfoinout",
  templateUrl: "./togglevisibilityinfoinout.component.html",
  styleUrls: ["./togglevisibilityinfoinout.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class AppToggleVisibilityInfoinoutComponent implements OnInit {
  // Varriable Language
  languages: any;
  selectedLanguage: any;
  editForm: FormGroup;
  model: ToggleVisibilityInfoinout = new ToggleVisibilityInfoinout();

  /**
   * Constructor
   *
   */
  constructor(
    private _coreService: CoreService,
    private globals: Globals,
    public configs: Configs,
    public router: Router,
    private _formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    private _translateService: TranslateService,
    private _configService: ConfigService,
    private _tlaTranslationLoaderService: TranslationLoaderService,
    private notification: Notification,
  ) {
    // Set language
    this.languages = this.globals.languages;

    this._configService._configSubject.next("true");
    // Load file language
    this._tlaTranslationLoaderService.loadTranslations(vietnam, english);

    this.editForm = this._formBuilder.group({
      address: [""],
      phone_number: [""],
      employee_type: [""],
      guestcalendar: [""],
      invited_person: [""],
      job_title: [""],
      department: [""],
      job_description: [""],
      participant_information: [""],
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
          this._coreService
          .Get("/togglevisibilityinfoinout/list/")
          .subscribe((res) => {
            if (res.code == "200") {
              this.model = res.data[0];
              cb();
            }
          });
        },
      ],
      (err, ok) => {
      }
    );
  }

  clear(){
    this.editForm.reset();
  }

  saveData(){
    const modelRequest = this.prepareModelBeforeSave();
    const url = "/togglevisibilityinfoinout/update";
    this._coreService.Post(url, modelRequest).subscribe(
      (res) => {
        if (res && res.code == "200") {
          this.notification.success("Cập nhật thành công!");
          this.router.navigate(["/cms/authen/togglevisibilityinfoinout"]);
        } else {
          this.notification.warning(`${res.error}!`);
        }
      },
      (error) => {
        this.notification.warning(`Lỗi hệ thống!`);
      }
    );
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

  onGuestcalendarChange(event: any) {
    const checkedValue: boolean = event.checked;
    if(checkedValue)
    {
      this.model.job_description = true;
      this.model.participant_information = true;
    }
    else
    {
      this.model.job_description = false;
      this.model.participant_information = false;
    }
  }

  onInvitedPersonChange(event: any) {
    const checkedValue: boolean = event.checked;
    if(checkedValue)
    {
      this.model.job_title = true;
      this.model.department = true;
    }
    else
    {
      this.model.job_title = false;
      this.model.department = false;
    }
  }
}
