import {
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
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
    QuickToolbar
  } from "@syncfusion/ej2-richtexteditor";
  RichTextEditor.Inject(Toolbar, Table, Image, Link, HtmlEditor, QuickToolbar);
  import { CoreService } from "src/app/_services/core.service";
  import { EquipmentService } from "src/app/_services/equipment.service";
  import { ConfigService } from "src/app/_services/config.service";
  import { FormBuilder, FormGroup, Validators } from "@angular/forms";
  import { ModalService } from "src/app/_services/modal.service";
  import { Query, Predicate, DataManager } from "@syncfusion/ej2-data";
  import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
  import { Equipment } from "src/app/_models/masterdata/Equipment";
  
  import * as async from "async";
  import * as _ from "lodash";
  
  setCulture("vi");
  
  @Component({
    selector: "app-equipment-edit",
    templateUrl: "./equipment-edit.component.html",
    styleUrls: ["./equipment-edit.component.scss"],
    providers: [FilterService, VirtualScrollService],
    encapsulation: ViewEncapsulation.None,
  })
  export class EquipmentEditComponent implements OnInit {
    // Varriable Language
    flagState = "";
    public avatar = "/assets/images/addPicture_Vehicle.png";
    public avatar_back = "/assets/images/addPicture_Vehicle.png";
    
    model: Equipment = new Equipment();
    languages: any;
    selectedLanguage: any;
    editForm: FormGroup;

    lstEquipmentTypes = [];
    lstLanes= [];

  
    // vi tri focus
    public query = new Query();
    public fields: FieldSettingsModel = { text: "name", value: "id" };
    // Toolbar Item
    public toolbar: ToolbarInterface[];
    @ViewChild("contentFull", { static: false })
    

    public contentFull: RichTextEditorComponent;
    private _unsubscribeAll: Subject<any>;
    paramId: any;
    username: string;

  
    /**npm run
     * Constructor
     *
     */
    constructor(
      private _coreService: CoreService,
      private _equipmentService: EquipmentService,
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
        ;
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
        equipment_name: [
          "",
          [
            Validators.required,
            Validators.maxLength(255),
            this.globals.noWhitespaceValidator,
          ],
        ],
        equipment_type: ["", Validators.required],
        seri: [""],
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
      this.getEquipmentTypeComboBoxData(); // Danh mục loại thiết bị 

      // Build toolbar
      async.waterfall(
        [
          (cb) => {
            if (this.flagState != "new") {
              this._equipmentService
                .getprimaryKey(this.paramId)
                .subscribe((res) => {
                  if (res.code == "200") {
                     if (res.data.port != null  && res.data.port != undefined)
                     {
                      this.getLaneComboBoxData( res.data.port);
                      setTimeout(() => {
                        this.model = res.data;
                      }, 100);
                     } else {
                      this.model = res.data;
                     }
                      
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
    getEquipmentTypeComboBoxData = () => {
      async.parallel([(cb) => {
        this._coreService
          .Get("/dropdown/equipmenttype")
          .subscribe((res) => {
            if (res.code == "200") {
              this.lstEquipmentTypes = res.data;
              return cb();
            }
          }, (err) => {
            return cb();
          });
      }], (err, result) => {
  
      })
  }

  getLaneComboBoxData = (port) => {
      async.parallel([(cb) => {
        this._coreService
          .Get("/dropdown/laneby/" + port)
          .subscribe((res) => {
            if (res.code == "200") {
              this.lstLanes = res.data;
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
        
        //Create item
        if (this.flagState && this.flagState === "new")
        {
          this._equipmentService.create(modelRequest).subscribe(
            (res) => {
              if (res && res.code == "200") {
                this.notification.success("Cập nhật thành công!");
                this.router.navigate(["/cms/masterdata/equipment"]);
              } else {
                this.notification.warning(`${res.error}!`);
              }
            },
            (error) => {
              this.notification.warning(`Lỗi hệ thống!`);
            }
          );

        } else {
          // Update item
          this._equipmentService.update(modelRequest).subscribe(
            (res) => {
              if (res && res.code == "200") {
                this.notification.success("Cập nhật thành công!");
                this.router.navigate(["/cms/masterdata/equipment"]);
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
      Object.keys(objAPI).map(
        (k) =>
        (objAPI[k] =
          typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
      );
      return objAPI;
    };
  
    back = () => {
      this.router.navigate(["/cms/masterdata/equipment"]);
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
  