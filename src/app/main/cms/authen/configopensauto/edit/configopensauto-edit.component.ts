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
import { ModalService } from "src/app/_services/modal.service";
import { Query, Predicate, DataManager } from "@syncfusion/ej2-data";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import { ConfigOpensAuto } from "src/app/_models/authen/ConfigOpensAuto";
import { ConfigOpensAutoService } from "src/app/_services/configopensauto.service";
import * as async from "async";
import * as _ from "lodash";

setCulture("vi");

@Component({
  selector: "app-configopensauto-edit",
  templateUrl: "./configopensauto-edit.component.html",
  styleUrls: ["./configopensauto-edit.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class ConfigOpensAutoEditComponent implements OnInit {
  // Varriable Language
  flagState = "";
  public avatar = "/assets/images/addPicture.png";
  model: ConfigOpensAuto = new ConfigOpensAuto();
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
  lstValues = [];
  lstDataField = [];
  lstRequirements = [];

  isloading: boolean= false;  

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
    private _configopensautoService: ConfigOpensAutoService,
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
      data_field: ["", Validators.required],
      value: ["", Validators.required],
      requirement: ["", Validators.required],
      is_active: ["true"]
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

    this.model.is_active = true;
    this.isloading = true;
    
    // Build toolbar
    async.waterfall(
      [
        (cb) => {
          this._coreService
            .Get("/dropdown/Condition")
            .subscribe((res) => {
              if (res.code == "200") {
                this.lstRequirements = res.data;
                return cb();
              }
            }, (err) => {
              return cb();
            });
        },
        // (cb) => {
        //   this._coreService
        //     .Get("/dropdown/otherListByCode/CAR_TYPE")
        //     .subscribe((res) => {
        //       if (res.code == "200") {
        //         this.lstDataField = res.data;
        //         return cb();
        //       }
        //     }, (err) => {
        //       return cb();
        //     });
        // },
        // (cb) => {
        //   this._coreService
        //     .Get("/dropdown/otherListByCode/REQUIREMENT_OPENING_AUTOMATIC")
        //     .subscribe((res) => {
        //       if (res.code == "200") {
        //         this.lstValues = res.data;
        //         return cb();
        //       }
        //     }, (err) => {
        //       return cb();
        //     });
        // },
        (cb) => {
          if (this.flagState != "new") {
            this._coreService
              .Get("/openingautomaticsetting/" + this.paramId)
              .subscribe((res) => {
                if (res.code == "200") {

                  let data = res.data;
                  
                  this.getConditionByComboBoxData( 'DataField',data.requirement.toString());
                  this.getConditionByComboBoxData( 'Value',data.data_field.toString());
                  setTimeout(() => {
                    this.model = data;  
                  }, 100);

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

    setTimeout(() => {
      this.isloading = false;
    }, 500);



    if (this.flagState == "view") {
      this.editForm.disable();
    }
  }


  changeModel = (key) => {

    if (!this.isloading)
    {
      setTimeout(() => {
        if (key =='requirement')
        {
          if (this.model.requirement != null  && this.model.requirement != undefined)  this.getConditionByComboBoxData( 'DataField',this.model.requirement.toString());
        } else if (key =='data_field')
        {
          if (this.model.data_field != null  && this.model.data_field != undefined)  this.getConditionByComboBoxData( 'Value',this.model.data_field.toString());
        }
        
      }, 10);

    }  

   
  };

  getConditionByComboBoxData = (key,type) => {
    let url ="";
    if (key =='DataField') 
    {
      this.lstDataField =[];
      url=  "conditionby/" + type
    } else {
      url=  "datafieldby/" + type
      
    }
    
    this.lstValues =[];

      async.parallel([(cb) => {
        this._coreService
          .Get("/dropdown/" + url)
          .subscribe((res) => {
            if (res.code == "200") {
              if (key =='DataField') 
              {
                this.lstDataField = res.data;
              } else {
                this.lstValues = res.data;
              }
              
              return cb();
            }
          }, (err) => {
            return cb();
          });
      }], (err, result) => {
  
      })
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
          ? "/openingautomaticsetting/create"
          : "/openingautomaticsetting/update";
      this._configopensautoService.Post(url, modelRequest).subscribe(
        (res) => {
          if (res && res.code == "200") {
            this.notification.success("Cập nhật thành công!");
            this.router.navigate(["/cms/authen/configopensauto"]);
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
      this.checkWarn = true;
      this.modalService.open("confirm-back-modal");
    } else {
    this.router.navigate(["/cms/authen/configopensauto"]);
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


  changeAcctive = () => {
    
    this.model.is_active =  !this.model.is_active
      // if (this.model.is_active) {

      //   this.model.is_active = false;
      // } else {
      //   this.model.is_active = 2;
      // }
  }

  confirmBack = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-back-modal");
    } else {
      this.modalService.close("confirm-back-modal");
    this.router.navigate(["/cms/authen/configopensauto"]);
    }
  };
}
