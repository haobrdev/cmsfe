import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  ElementRef,
  Input,
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
  GridComponent,
  VirtualScrollService,
} from "@syncfusion/ej2-angular-grids";
import { ToolbarItem, ToolbarInterface } from "src/app/_models/index";
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
import { Lane } from "src/app/_models/masterdata/Lane";
import { EquipmentDetail } from "src/app/_models/masterdata/EquipmentDetail";
import { uploadFileLane } from "src/app/_models/masterdata/uploadFileLane";
import * as async from "async";
import * as _ from "lodash";
import { DataStateChangeEventArgs } from "@syncfusion/ej2-grids";
import { ModalService } from "src/app/_services/modal.service";
import { BehaviorSubject } from 'rxjs';

setCulture("vi");

@Component({
  selector: "cms-entryexitlane-edit",
  templateUrl: "./entryexitlane-edit.component.html",
  styleUrls: ["./entryexitlane-edit.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class EntryExitLaneEditComponent implements OnInit {
  // Varriable Language
  flagState = "";
  flagStateEquipment = "";
  portBefore = "";
  detailIndex: number;
  model: Lane = new Lane();
  modelBefore: Lane = new Lane();
  listEquipment: EquipmentDetail = new EquipmentDetail();
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
  lstLanesType = [];
  lstLanesOfVehicleType = [];
  lstPortType = [];
  data = [];
  uploadfile_data = [];

  paramId: any;
  deleteFlag : boolean = false;
  equipmentDetailFlg : boolean = false;
  receivedData: any;
  dataToModal: any;

  // List data
  public state: DataStateChangeEventArgs;
  pageIndex = 0;
  isValue: boolean = false;

  // View child Grid
  @ViewChild("overviewgrid", { static: false })
  public gridInstance: GridComponent;

  // Toolbar Item
  public toolbar2: ToolbarInterface[];
  public modelAdd: any;
  public equipment_id: any;
  public modelDelete;
  public modelEquipmentname;

  @Input() dataFromParent: any; // Biến để nhận dữ liệu từ cha
  modalDataSubject = new BehaviorSubject<any>({});
  
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
      lane_name: [
        "",
        [
          Validators.required,
          Validators.maxLength(255),
          this.globals.noWhitespaceValidator,
        ],
      ],
      lane_type: [
        "",
        [
          Validators.required,
        ],
      ],
      lane_of_vehicle: [""],
      port: [
        "",
        [
          Validators.required,
        ],
      ],
      description: [""],
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
    this.model.listEquipment = [];
    this.model.listUploadfileLane = [];

    this.buildToolbar();

    // Build toolbar
    async.waterfall(
      [
        (cb) => {
          async.parallel([(cb1) => {
            this._coreService
            .Get("/dropdown/otherListByCode/lane_type")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstLanesType = res.data;
                  return cb1();
                }
              }, (err) => {
                return cb1();
              });
          }, (cb1) => {
            this._coreService
            .Get("/dropdown/otherListByCode/lane_of_vehicle")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstLanesOfVehicleType = res.data;
                  return cb1();
                }
              }, (err) => {
                return cb1();
              });
          }, (cb2) => {
            this._coreService
            .Get("/dropdown/checkpointandportname")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstPortType = res.data;
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
              .Get("/entryexitlane/" + this.paramId)
              .subscribe((res) => {
                if (res.code == "200") {
                  this.model = res.data;
                  this.model.listEquipment.forEach((element) => {
                    element.is_mode = 'edit'
                  });

                  this.model.listUploadfileLane.forEach((element) => {
                    element.is_mode = 'edit'
                    element.key = element.filename;
                  });

                  this.data = this.model.listEquipment;
                  this.uploadfile_data = this.model.listUploadfileLane;
                  this.modelBefore = JSON.parse(JSON.stringify(this.model));
                  this.showuploadFileLane();

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

  // Build Toolbar
  buildToolbar = () => {
    let toolbarList2 = [];
    toolbarList2 = [ToolbarItem.VIEW, ToolbarItem.EDIT, ToolbarItem.DELETE];
    this.toolbar2 = this.globals.buildToolbar("cms_masterdata_entryexitlane", toolbarList2);
  };

  checkToolbar = (action: string) => {
    var indexToolbar = _.findIndex(this.toolbar2, (item) => {
      return item.id.toLowerCase() == action.toLowerCase();
    });

    if (indexToolbar > -1) {
      return true;
    } else {
      return false;
    }
  }

  onActionComplete(args) {
    if(args.currentPage && args.currentPage !== undefined || this.isValue)
    {
      if(args.currentPage && args.currentPage !== undefined && this.isValue)
      {
        this.pageIndex = args.currentPage - 1;
      }
      if(args.rows.length == this.model.listEquipment.length)
      {
        this.pageIndex = 0;
      }
    }
    else
    {
      this.pageIndex = 0;
    }
    this.isValue = true;
  } 

  // Format stt (Sort index)
  formatStt = (index: string) => {
    return (
      this.pageIndex * this.gridInstance.pageSettings.pageSize +
      parseInt(index, 0) +
      1
    );
  };

  newEquipment(){
    this.equipmentDetailFlg = true;
    this.dataToModal = [
      {lane_type_header: this.model.lane_type}
    ];
    this.flagStateEquipment = 'add_equipment';
    this.modalService.modals[0] = this.flagState;
    this.modalService.modals[1] = "add_equipment";
    this.modalService.openEquipment("add-edit-equipment", this.flagState, "add_equipment");
  }

  clickRecord = (data, status) => {
    data.lane_type_header = this.model.lane_type;
    this.modelAdd = data;
    this.flagStateEquipment = status;
    this.detailIndex = data.index;
    this.equipment_id = this.modelAdd.id;

    this.modalService.modals.splice(0, 0, this.flagState); 
    this.modalService.modals.splice(1, 0, status); 

    if (data && status === "view_equipment") {
      this.equipmentDetailFlg = true;
      this.dataToModal = JSON.parse(JSON.stringify(data));
      this.dataToModal.id = this.model.listEquipment[data.index].id;
      this.dataToModal.lane_type = data.lane_type;
      this.dataToModal.equipment_id = data.equipment_id + " ";
      this.modalService.openEquipment("add-edit-equipment", this.flagState, status);
    }
    if (data && status === "edit_equipment") {
      this.equipmentDetailFlg = true;
      this.dataToModal = JSON.parse(JSON.stringify(data));
      this.dataToModal.id = this.model.listEquipment[data.index].id;
      this.dataToModal.lane_type = data.lane_type;
      this.dataToModal.equipment_id = data.equipment_id + " ";
      this.modalService.openEquipment("add-edit-equipment", this.flagState, status);
    }
    if (data && status === "delete_equipment") {
      this.deleteFlag = true;
      if(data.is_mode == 'new')
      {
        this.modelDelete = (this.pageIndex * this.gridInstance.pageSettings.pageSize) + parseInt(data.index);
      }
      else
      {
        this.modelDelete = data.id;
      }
      this.modelEquipmentname = data.equipment_name;
      this.modalService.open("confirm-delete-one-modal");
    }
  };

  confirmDeleteOne = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-delete-one-modal");
    } else {
      // Call the delete API here
      if (this.modelDelete || this.modelDelete == 0) {
        this.model.listEquipment.forEach((element) => {
          if(element.id == this.modelDelete)
          {
            element.is_mode = 'delete';
          }
        });

        if(this.model.listEquipment[this.modelDelete] && this.model.listEquipment[this.modelDelete] != undefined)
        {
          this.model.listEquipment[this.modelDelete].is_mode = 'delete';
        }
      }

      this.data = [];
      this.model.listEquipment.forEach((element) => {
        if(element.is_mode != 'delete')
        {
          this.data.push(element);
        }
      });

      this.modalService.close("confirm-delete-one-modal");
    }
  };

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
      this.model.port = this.portBefore;
      const url =
        this.flagState && this.flagState === "new"
          ? "/entryexitlane/create"
          : "/entryexitlane/update";
      this._coreService.Post(url, modelRequest).subscribe(
        (res) => {
          if (res && res.code == "200") {
            this.notification.success("Cập nhật thành công!");
            this.router.navigate(["/cms/masterdata/entryexitlane"]);
          } else {
            if(res.error == "ERROR_CLIENT_ID_MISSING")
            {
              this.notification.warning("notify.ERROR_CLIENT_ID_MISSING");
            }
            else if(res.error == "ERROR_PORT_ID_MISSING")
            {
              this.notification.warning("notify.ERROR_PORT_ID_MISSING");
            }
            else
            {
              this.notification.warning(`${res.error}!`);
            }
          }
        },
        (error) => {
          this.notification.warning(`Lỗi hệ thống!`);
        }
      );
    }
  }

  prepareModelBeforeSave = () => {
    this.portBefore = this.model.port;
    this.model.client_id = this.model.port.split('/')[0].trim();;
    this.model.port = this.model.port.split('/')[1].trim();
    
    let objAPI = Object.assign({}, this.model);
    Object.keys(objAPI).map(
      (k) =>
      (objAPI[k] =
        typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );

    return objAPI;
  };

  back = () => {
    const isDataChanged = JSON.stringify(this.modelBefore) !== JSON.stringify(this.model);

    if(this.flagState == "new")
    {
      if(this.model.description == undefined &&
         this.model.lane_name == undefined &&
         this.model.lane_of_vehicle == undefined &&
         this.model.lane_type == undefined &&
         this.model.port == undefined &&
         this.model.listEquipment.length == 0)
      {
        this.router.navigate(["/cms/masterdata/entryexitlane"]);
      }
      else
      {
        this.modalService.open("confirm-back-modal");
      }
    }
    else
    {
      if(!isDataChanged)
      {
        this.router.navigate(["/cms/masterdata/entryexitlane"]);
      }
      else
      {
        this.modalService.open("confirm-back-modal");
      }
    }
  }

  confirmBackModal = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-back-modal");
    } else {
      this.router.navigate(["/cms/masterdata/entryexitlane"]);
    }
  };

  convertDataToListEquipment(lst: EquipmentDetail, data: any)
  {
    lst.equipment_id = data.equipment_id
    lst.equipment_name = data.equipment_name;
    lst.equipment_type = data.equipment_type;
    lst.equipment_typename = data.equipment_typename;
    lst.lane_type = data.lane_type;
    lst.lane_name = data.lane_name;
    lst.vehicle_equipment_lane = data.vehicle_equipment_lane;
    lst.is_prioritize = data.is_prioritize;
    lst.is_active = data.is_active;
    lst.seri = data.seri;
    lst.lane_id = "";
    lst.description = data.description;
    lst.ip = data.ip;
    lst.ip_port = data.ip_port;
    lst.account = data.account;
    lst.pass = data.pass;
    lst.extension = data.extension;
    lst.rtsp_link = data.rtsp_link;
    lst.is_mode = data.is_mode;
  }

  receiveData(data: any) {
    this.receivedData = data;
    this.listEquipment = new EquipmentDetail();
    if(this.flagStateEquipment == 'add_equipment')
    {
      this.convertDataToListEquipment(this.listEquipment, this.receivedData);
      this.model.listEquipment.push(this.listEquipment);
    }
    
    if(this.flagStateEquipment == 'edit_equipment')
    {
      if(this.receivedData.id && this.receivedData.id != undefined)
      {
        this.model.listEquipment.forEach((element) => {
          if(element.id == this.receivedData.id)
          {
            this.convertDataToListEquipment(element, this.receivedData);
          }
        });
      }
      else
      {
        for (let i = 0; i < this.model.listEquipment.length; i++) {
          if(this.detailIndex == i)
          {
            this.model.listEquipment[i] = this.receivedData;
          }
        }
      }
    }
    
    this.convertModelToAny(this.model.listEquipment);
  }

  convertModelToAny(lst: Array<EquipmentDetail>)
  {
    const newArray = lst
    .filter(item => item.is_mode !== 'delete')
    .map(modal => ({
      equipment_id: modal.equipment_id,
      equipment_name: modal.equipment_name,
      equipment_type: modal.equipment_type,
      equipment_typename : modal.equipment_typename,
      lane_type: modal.lane_type,
      lane_name : modal.lane_name,
      vehicle_equipment_lane: modal.vehicle_equipment_lane,
      is_prioritize: modal.is_prioritize,
      is_active: modal.is_active,
      seri: modal.seri,
      lane: modal.lane_id,
      description: modal.description,
      ip: modal.ip,
      ip_port: modal.ip_port,
      account: modal.account,
      pass: modal.pass,
      extension: modal.extension,
      rtsp_link: modal.rtsp_link,
      is_mode: modal.is_mode,
    }));

    this.data = newArray;
  }

  showuploadFileLane()
  {
    const displayElement = document.getElementById('fileNameDisplay');
    // Xóa nội dung hiện tại
    displayElement.innerHTML = '';

    if (this.model.listUploadfileLane.length >0)
    {
      for (let index = 0; index < this.model.listUploadfileLane.length; index++) {
        const element = this.model.listUploadfileLane[index];

        if (element.is_mode == "new" || element.is_mode == "edit")
        {
            const fileNameDiv = document.createElement('div');
            const fileName =  (element.is_mode == "new") ? element.key: element.filename;

            fileNameDiv.classList.add('col-sm-3');
            fileNameDiv.classList.add('div-cursor-pointer');
            
            const linkSpan = document.createElement('span');
            linkSpan.style.padding = '8px 0px 0px 8px';

            const linkIcon = document.createElement('i');
            linkIcon.setAttribute('aria-hidden', 'true');

            if (fileName.trim().length > 32)  
            {
              linkIcon.classList.add('fa', 'fa-link','icon-fa-link-uploadfile');
            } else {
              linkIcon.classList.add('fa', 'fa-link','icon-fa-link-uploadfile-short');
            }

            linkSpan.appendChild(linkIcon);
            fileNameDiv.appendChild(linkIcon);
            const filenameSpan = document.createElement('span');
            filenameSpan.classList.add('filename-span');
            filenameSpan.append(fileName);
            filenameSpan.setAttribute('title', fileName);
            fileNameDiv.appendChild(filenameSpan);
            filenameSpan.addEventListener('click', () => {
              this.redirectToLink(element.url);
            });

            if (this.flagState != 'view')
            {
                const deleteSpan = document.createElement('span');
                deleteSpan.id = 'delete';
                deleteSpan.addEventListener('click', () => {
                  this.onDeleteFile(element.id);
                });
                
                const deleteIcon = document.createElement('i');
                deleteIcon.setAttribute('aria-hidden', 'true');
                if (fileName.trim().length > 32)  
                {
                  deleteIcon.classList.add('fa', 'fa-trash', 'delete-file');
                } else {
                  deleteIcon.classList.add('fa', 'fa-trash', 'delete-file-short');
                }

                deleteSpan.appendChild(deleteIcon);
                fileNameDiv.appendChild(deleteSpan);
            }
            displayElement.appendChild(fileNameDiv);
        }
      }
    }
  }

  uploadFileLane(files: FileList) {
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
              let x: any =   document.getElementById("uploadfilelane") ;
              x.value = null;
              return;
            }
          }

          const displayElement = document.getElementById('fileNameDisplay');
          // Xóa nội dung hiện tại
          displayElement.innerHTML = '';

          this.showuploadFileLane();
          
          for (let i = 0; i < files.length; i++) {
            const fileName = files[i].name;
            const id = this.GetNewGuid();
            const fileNameDiv = document.createElement('div');
            fileNameDiv.classList.add('col-sm-3');
            fileNameDiv.classList.add('div-cursor-pointer');

            const linkSpan = document.createElement('span');
            linkSpan.style.padding = '8px 0px 0px 8px';

            const linkIcon = document.createElement('i');
            linkIcon.setAttribute('aria-hidden', 'true');

            if (fileName.trim().length > 32)  
            {
              linkIcon.classList.add('fa', 'fa-link','icon-fa-link-uploadfile');  
            } else {
              linkIcon.classList.add('fa', 'fa-link','icon-fa-link-uploadfile-short');
            }

            linkSpan.appendChild(linkIcon);
            fileNameDiv.appendChild(linkIcon);
            const filenameSpan = document.createElement('span');
            filenameSpan.classList.add('filename-span');
            filenameSpan.append(fileName);
            filenameSpan.setAttribute('title', fileName);
            fileNameDiv.appendChild(filenameSpan);

            if (this.flagState != 'view')
            {
              const deleteSpan = document.createElement('span');
              deleteSpan.id = 'delete';
              deleteSpan.addEventListener('click', () => {
                this.onDeleteFile(id);
              });
              const deleteIcon = document.createElement('i');
              deleteIcon.setAttribute('aria-hidden', 'true');

              if (fileName.trim().length > 32)  
              {
                deleteIcon.classList.add('fa', 'fa-trash', 'delete-file');
              } else {
                deleteIcon.classList.add('fa', 'fa-trash', 'delete-file-short');
              } 
              
              deleteSpan.appendChild(deleteIcon);
              fileNameDiv.appendChild(deleteSpan);

            }
            displayElement.appendChild(fileNameDiv);
            let data = new FormData();
            data.append("files", files[i]);
            this.uploadFileLaneAPI(id,fileName,data);
          }
          this._configService.loadingSubject.next("false");
        }
      }, 1);
  }

  uploadFileLaneAPI = (id: string,key: string, data: FormData) => {
    this._coreService.uploadFile(data).subscribe((res) => {
      if (res && res.status && res.status == 200) {

        var filename = new uploadFileLane();    
        filename.id = id;
        filename.key = key;
        filename.is_mode ="new";
        filename.filename = res.data[0].name;
        filename.url = res.data[0].url;
        this.model.listUploadfileLane.push(filename);
        this.notification.success("Tải ảnh thành công");
      } else {
        this._configService.loadingSubject.next("false");
        this.notification.warning("Tải ảnh không thành công");
      }
    }, (err) => {
      this._configService.loadingSubject.next("false");
      this.notification.warning("Tải ảnh không thành công");
    });
  }

  GetNewGuid(): string {
    // Có thể thay đổi logic tạo số tùy ý ở đây
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
  }

  redirectToLink(link: string)
  {
    window.open(link, '_blank');
  }
  onDeleteFile(id: string)
  {
    let itemToDelete  =this.model.listUploadfileLane.find(item => item.id === id);
    if (itemToDelete != null ) {
      itemToDelete.id =  itemToDelete.is_mode=="edit" ? itemToDelete.id : null;
      itemToDelete.is_mode ="delete";
      this.showuploadFileLane();
    } else {
      this.notification.warning("Không tìm thấy file upload");
    }
  }
}
