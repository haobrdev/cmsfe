import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { Subject } from "rxjs";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import * as $ from "jquery";

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
import * as async from "async";
import * as _ from "lodash";
import { L10n, setCulture } from "@syncfusion/ej2-base";
import {
  FilterService,
  GridComponent,
  EditSettingsModel,
  VirtualScrollService,
} from "@syncfusion/ej2-angular-grids";
import { DataStateChangeEventArgs } from "@syncfusion/ej2-grids";
import { ToolbarItem, ToolbarInterface } from "src/app/_models/index";
import { CoreService } from "src/app/_services/core.service";
import { ConfigService } from "src/app/_services/config.service";
import { ModalService } from "src/app/_services/modal.service";
import {
  ListBoxComponent,
  CheckBoxSelection,
} from "@syncfusion/ej2-angular-dropdowns";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Profile } from "src/app/_models/Profile";
ListBoxComponent.Inject(CheckBoxSelection);
setCulture("vi");

@Component({
  selector: "cms-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class AppProfileComponent implements OnInit {
  // Varriable Language
  model: Profile = new Profile();
  languages: any;
  selectedLanguage: any;
  userName;
  public profileId;
  public userInfo;
  public passFake;
  public avatar = "/assets/images/addPicture.png";

  //
  editForm: FormGroup;

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
    public el: ElementRef,
    private _formBuilder: FormBuilder,
    private _translateService: TranslateService,
    private _configService: ConfigService,
    private _tlaTranslationLoaderService: TranslationLoaderService
  ) {
    // Set language
    this.languages = this.globals.languages;

    this._configService._configSubject.next("true");
    // Load file language
    this._tlaTranslationLoaderService.loadTranslations(vietnam, english);
    L10n.load(this.configs.languageGrid);
    this.editForm = this._formBuilder.group({
      phone: ["", [Validators.required, Validators.maxLength(10)]],
      email: [
        "",
        [
          Validators.maxLength(255),
          Validators.pattern(
            /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
          ),
        ],
      ],
      full_name: ["", Validators.required],
      address: [""],
      username: [""]
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
    this.userName = localStorage.getItem("username");
    this.profileId = Number(localStorage.getItem("id"));
    this.getProfile();
  }

  getProfile = () => {
    async.parallel(
      [
        (cb) => {
          this._coreService
            .Get("/auth/adminGetUserInfo")
            .subscribe((res) => {
              this.model = res && res.data && res.code == "200" ? res.data : this.model;
              this.model.username = this.userName ? this.userName : null;
              this.avatar = res.data.avatar ? res.data.avatar : "/assets/images/user.jpg";
            });
        },
      ],
      (err, result) => { }
    );
  };

  saveData() {
    if (!this.avatar || this.avatar === "/assets/images/addPicture.png") {
      this.notification.warning("Bạn chưa chọn Ảnh đại diện!");
      return;
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
      const url = "/auth/adminUpdateUserInfo"
      this._coreService.Post(url, modelRequest).subscribe(
        (res) => {
          if (res && res.code == "200") {
            this.notification.success("Cập nhật thành công!");
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
    objAPI.avatar = this.avatar;
    Object.keys(objAPI).map(
      (k) =>
      (objAPI[k] =
        typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );

    return objAPI;
  };

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

  removeImage = (model) => {
    this.model[model] = "/assets/images/addPicture.png";
    if (model == "avatar") {
      this.avatar = "/assets/images/addPicture.png";
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
}
