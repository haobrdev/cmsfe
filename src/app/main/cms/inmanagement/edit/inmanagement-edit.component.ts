import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
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
import { L10n, setCulture } from "@syncfusion/ej2-base";
import {
  FilterService,
  GridComponent,
  VirtualScrollService,
} from "@syncfusion/ej2-angular-grids";
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
import * as async from "async";
import * as _ from "lodash";
import { FormBuilder, FormGroup } from "@angular/forms";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import { Observable } from "rxjs";
import { DataStateChangeEventArgs } from "@syncfusion/ej2-grids";
import { ToolbarItem, ToolbarInterface } from "src/app/_models/index";
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ModalService } from "src/app/_services/modal.service";
import { InfoInOut } from "src/app/_models/masterdata/InfoInOut";
import { InfoInOutResponse } from "src/app/_models/masterdata/InfoInOutResponse";
import { Notification } from "src/app/common/notification";
import { GuestCalendar } from "src/app/_models/business/GuestCalendar";
import { Inforleaving } from "src/app/_models/masterdata/Inforleaving";
import { saveAs } from 'file-saver';
import { Car } from "src/app/_models/masterdata/Car";

setCulture("vi");

@Component({
  selector: "cms-inmanagement-edit",
  templateUrl: "./inmanagement-edit.component.html",
  styleUrls: ["./inmanagement-edit.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('collapseAnimation', [
      state('open', style({
        height: '*',
        opacity: 1,
        overflow: 'visible'
      })),
      state('closed', style({
        height: '0',
        opacity: 0,
        overflow: 'hidden'
      })),
      transition('open => closed', [
        animate('300ms ease-out')
      ]),
      transition('closed => open', [
        animate('300ms ease-in')
      ])
    ])
  ]
})
export class InManagementEditComponent implements OnInit {
  public identification_photo = "";
  public img_in_photo = "";
  public img_out_photo = "";
  public portrait_photo = "/assets/images/addPicture_Vehicle.png";
  // Varriable Language
  flagState = "";
  languages: any;
  selectedLanguage: any;
  paramId: any;
  pageIndex = 0;
  editForm: FormGroup;
  modelUpdate: InfoInOut = new InfoInOut();
  model: InfoInOutResponse = new InfoInOutResponse();
  // Search conditions
  public search = {
    checkpoint_name: "",
    port_name: "",
  };
  // View child Grid
  @ViewChild("overviewgrid", { static: false }) public gridInstance: GridComponent;
  public modelAdd: any;
  // List data
  public data: Observable<DataStateChangeEventArgs>;
  public state: DataStateChangeEventArgs;
  // Toolbar Item
  public toolbar: ToolbarInterface[];
  public toolbar2: ToolbarInterface[];
  // Dropdown list data
  public fields: FieldSettingsModel = { text: "name", value: "id" };
  public documenttypes: string[] = [];
  lstCheckpointName = [];
  lstPortName = [];
  lstDocumentType = [];
  lstEmployeeType = [];
  lstGuestcalendar = [];
  lstInviter
  // Show as guest flag
  isShowList : boolean = false;
  isActivated : boolean = true;
  isKeepCheck : boolean = false;
  isShowIconDelete : boolean = false;
  isShowIconUpload : boolean = true;
  imageDocumentReturnName: string;
  readonly DEFAULT_DOCUMENT_RETURN_NAME: string = 'hình_ảnh';

  // Collapse button to shrink/open lane information.
  isCollapsed: boolean = false;
  isShowCollapsed: boolean = false;
  // Flag show modal
  equipmentDetailFlg : boolean = false;
  vehicleDetailFlg : boolean = false;
  // Data send to parent
  dataToModal: any;
  oldValue: number;
  // Configure to hide and show input and output information
  isShowAddress: boolean = true;
  isShowPhonenumber: boolean = true;
  isShowEmployeeType: boolean = true;
  isShowGuestcalendar: boolean = true;
  isShowInvitedPerson: boolean = true;
  // Show correct_information/ incorrect
  isCorrect: boolean = false;
  isIncorrect: boolean = false;
  // Show lane
  isCase1: boolean = false;
  isCase234: boolean = false;
  isLanein: boolean = false;
  isLaneout: boolean = false;
  // Fix car
  infoCarIn: Car;
  infoCarOut: Car;
  // Drag and drop camera
  private dragIndex: number | undefined;
  private dragStartStatus: string | undefined;

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
    private modalService: ModalService,
    private notification: Notification,

  ) {
    this.data = _coreService;
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
      document_type: [""],
      identification: [""],
      searchValue: [""],
      document_number: [""],
      full_name: [""],
      address: [""],
      phone_number: [""],
      employee_type: [""],
      invited_guest: [""],
      invited_person: [""],
      department: [""],
      job_title_name: [""],
      job_description: [""],
      participant_information: [""],
      document_keep: [""],
      document_return: [""],
      document_return_img: [""],
      license_in: [""],
      license_out: [""],
      overview_in_img: [""],
      identification_in_img: [""],
      detail_in_img: [""],
      overview_out_img: [""],
      identification_out_img: [""],
      detail_out_img: [""],
      overview_inout_img: [""],
      identification_inout_img: [""],
      detail_inout_img: [""],
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
            .Get("/dropdown/client")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstCheckpointName = res.data;
                  return cb1();
                }
              }, (err) => {
                return cb1();
              });
          }, (cb1) => {
            this._coreService
            .Get("/dropdown/port")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstPortName = res.data;
                  return cb1();
                }
              }, (err) => {
                return cb1();
              });
          }, (cb2) => {
            this._coreService
            .Get("/dropdown/documenttype/document_type")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstDocumentType = res.data;

                  this.lstDocumentType.forEach((element) => {
                    this.documenttypes.push(element.name);
                  });
                  return cb2();
                }
              }, (err) => {
                return cb2();
              });
          }, (cb3) => {
            this._coreService
            .Get("/dropdown/inforleaving/status_infor_leaving")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstEmployeeType = res.data;
                  return cb3();
                }
              }, (err) => {
                return cb3();
              });
          }, (cb4) => {
            this._coreService
            .Get("/dropdown/guestcalendar")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstGuestcalendar = res.data;
                  return cb4();
                }
              }, (err) => {
                return cb4();
              });
          }, (cb5) => {
            this._coreService
            .Get("/dropdown/inforleavingbyemployee")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstInviter = res.data;
                  return cb5();
                }
              }, (err) => {
                return cb5();
              });
          }], (err, result) => {
            return cb();
          })
        },
        (cb) => {
          if (this.flagState != "new") {
            this._coreService
              .Get("/inmanagement/" + this.paramId)
              .subscribe((res) => {
                if (res.code == "200") {
                  this.model = res.data;
                  this.identification_photo = res.data.identification,
                  this.img_in_photo = res.data.img_in,
                  this.img_out_photo = res.data.img_out,
                  this.search.checkpoint_name = res.data.checkpoint_name;
                  this.search.port_name = res.data.port_name;
                  this.oldValue = res.data.employee_type;
                  this.model && this.model !== undefined ? this.isShowCollapsed = true : this.isShowCollapsed = false;
                  // Only displayed if the entry type is a guest
                  if(res.data.employee_type == 45)
                  {
                    this.isShowList = true;
                  }
                  else
                  {
                    this.isShowList = false;
                  }
                  // Check mode lane
                  // TH1
                  if(this.model.listIn.length > 0 && this.model.listOut.length == 0 || this.model.listIn.length == 0 && this.model.listOut.length > 0)
                  {
                    // Show lane
                    this.isCase1 = true;
                    this.isCase234 = false;
                    this.model.listIn.length > 0 && this.model.listOut.length == 0 ? this.isLanein = true : this.isLanein = false;
                    this.model.listIn.length == 0 && this.model.listOut.length > 0 ? this.isLaneout = true : this.isLaneout = false;
                  }
                  // TH2,3,4
                  else
                  {
                    // Show lane
                    this.isCase1 = false;
                    this.isCase234 = true;
                    this.isLanein = true;
                    this.isLaneout = true;
                  }
                  // Ẩn hiển nội dung upload giấy tờ
                  if(res.data.document_keep)
                  {
                    this.isKeepCheck = true;
                    if(this.flagState == "view")
                    {
                      if(res.data.document_return)
                      {
                        this.isShowIconUpload = false;
                        this.isShowIconDelete = false
                        this.imageDocumentReturnName = res.data.document_return_img;
                      }
                      else
                      {
                        this.isShowIconUpload = true;
                        this.isShowIconDelete = false
                        this.imageDocumentReturnName = this.DEFAULT_DOCUMENT_RETURN_NAME;
                      }
                    }
                    else
                    {
                      if(res.data.document_return)
                      {
                        if(res.data.document_return_img && res.data.document_return_img !== undefined)
                        {
                          this.isShowIconUpload = false;
                          this.isShowIconDelete = true
                          this.imageDocumentReturnName = res.data.document_return_img;
                        }
                        else
                        {
                          this.isShowIconUpload = true;
                          this.isShowIconDelete = false;
                          this.imageDocumentReturnName = this.DEFAULT_DOCUMENT_RETURN_NAME;
                        }
                        
                      }
                      else
                      {
                        this.isShowIconUpload = true;
                        this.isShowIconDelete = false
                        this.imageDocumentReturnName = this.DEFAULT_DOCUMENT_RETURN_NAME;
                      }
                    }
                  }
                  else
                  {
                    this.isKeepCheck = false;
                    this.imageDocumentReturnName = this.DEFAULT_DOCUMENT_RETURN_NAME;
                  }
                  // Nếu đã có thông tin ra kiểm tra xem có đúng hay không
                  if(res.data.io_type)
                  {
                    if(res.data.license_in == res.data.license_out)
                    {
                      this.isCorrect = true;
                      this.isIncorrect = false;
                    }
                    else
                    {
                      this.isCorrect = false;
                      this.isIncorrect = true;
                    }
                  }
                  // Configure to hide and show input and output information
                  this.isShowAddress = res.data.lstToggleVisibilityInfoinout[0].address;
                  this.isShowPhonenumber = res.data.lstToggleVisibilityInfoinout[0].phone_number;
                  this.isShowEmployeeType = res.data.lstToggleVisibilityInfoinout[0].employee_type;
                  this.isShowGuestcalendar = res.data.lstToggleVisibilityInfoinout[0].guestcalendar;
                  this.isShowInvitedPerson = res.data.lstToggleVisibilityInfoinout[0].invited_person;
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

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  accompanying_person_manageShow(){
    this.equipmentDetailFlg = true;
    this.vehicleDetailFlg = false;
    this.dataToModal = [
      {
        flagState : this.flagState,
        infoinout_id: this.model.document_number,
        listaccompanyingpersonManage: this.model.listAccompanyingPersonManage,
      }
    ];
    
    this.modalService.open("accompanying-person-manage");
  }

  accompanying_vehicle_manageShow(){
    this.equipmentDetailFlg = false;
    this.vehicleDetailFlg = true;
    this.dataToModal = [
      {
        flagState : this.flagState,
        infoinout_id: this.model.document_number,
        listaccompanyingvehicleManage: this.model.listAccompanyingVehicleManage,
      }
    ];
    
    this.modalService.open("accompanying-vehicle-manage");
  }

  getInfoGuestsBookedAppointments(){
    if(this.model.invited_guest && this.model.invited_guest !== undefined)
    {
      // Nội dung làm việc
      this.model.job_description = this.lstGuestcalendar.filter(x => x.id === this.model.invited_guest)[0].job_description;
      this.model.participant_information = this.lstGuestcalendar.filter(x => x.id === this.model.invited_guest)[0].participant_information;
      if(this.isShowInvitedPerson && this.model.invited_person && this.model.invited_person !== undefined)
      {
        this.model.invited_person = this.lstGuestcalendar.filter(x => x.id === this.model.invited_guest)[0].invited_person;
        this.model.department = this.lstGuestcalendar.filter(x => x.id === this.model.invited_guest)[0].department;
        this.model.job_title_name = this.lstGuestcalendar.filter(x => x.id === this.model.invited_guest)[0].job_title;
        this.editForm.get('invited_person').disable();
      }
      else
      {
        this.model.invited_person = null;
        this.model.department = null;
        this.model.job_title_name = null;
      }
    }
    // If there is no guest scheduled, you are allowed to choose normally
    else
    {
      this.model.invited_person = null;
      this.model.department = null;
      this.model.job_title_name = null;
      this.model.job_description = null;
      this.model.participant_information = null;
      this.editForm.get('invited_person').enable();
    }
  }

  getInfoInvitedPerson(){
    if(this.model.invited_person && this.model.invited_person !== undefined)
    {
      let inviterInfo: any = this.lstInviter.filter(x => x.id.toString() === this.model.invited_person)[0];
      this.model.department = inviterInfo.org_name;
      this.model.job_title_name = inviterInfo.title_name;
    }
    else
    {
      this.model.department = null;
      this.model.job_title_name = null;
    }
  }

  changeEmployeeType(newValue: number){
    if (newValue !== this.oldValue)
    {
      //Clear data when change employee type
      this.editForm.get('invited_guest').reset();
      this.editForm.get('document_keep').reset();
      this.editForm.get('document_return').reset();
      this.editForm.get('document_return_img').reset();
      this.model.document_return_img = "";
      this.imageDocumentReturnName = this.DEFAULT_DOCUMENT_RETURN_NAME;
      this.isShowIconUpload = true;
      this.isShowIconDelete = false
      this.isKeepCheck = false;
      // Set data for oldValue
      this.oldValue = newValue
      //Only displayed if the entry type is a guest
      if(this.model.employee_type == 45)
      {
        this.isShowList = true;
      }
      else
      {
        this.isShowList = false;
      }
    }
  }

  prepareModelBeforeSave = () => {
    // Set data for table info in/ out
    this.modelUpdate.id = this.model.id;
    this.modelUpdate.io_type = false;

    // Update document id by searchvalue
    this.modelUpdate.inforleaving = this.model.inforleaving_id;
    this.modelUpdate.license_in = "17B4-51405";
    this.modelUpdate.license_out = "17B4-51405";
    this.modelUpdate.guestcalendar = this.model.invited_guest;
    this.modelUpdate.invited_person = this.model.invited_person;
    this.modelUpdate.img_in = this.img_in_photo;
    this.modelUpdate.img_out = this.img_out_photo;
    this.modelUpdate.time_in = new Date();
    this.modelUpdate.time_out = new Date();
    this.modelUpdate.lane_id = this.model.lane_id;
    this.modelUpdate.document_keep = this.model.document_keep;
    this.modelUpdate.document_return = this.model.document_return;
    this.modelUpdate.document_return_img = this.model.document_return_img;
    // Init Inforleaving
    this.modelUpdate.inforLeavingRequestInfo = new Inforleaving();
    this.modelUpdate.inforLeavingRequestInfo.employee_type = this.model.employee_type;
    this.modelUpdate.inforLeavingRequestInfo.phone_number = this.model.phone_number;
    this.modelUpdate.inforLeavingRequestInfo.document_type = this.model.document_type;
    this.modelUpdate.inforLeavingRequestInfo.front_photo = this.identification_photo;
    // Init GuestCalendar
    this.modelUpdate.guestCalendarInfo = new GuestCalendar();
    this.modelUpdate.guestCalendarInfo.job_description = this.model.job_description;
    this.modelUpdate.guestCalendarInfo.participant_information = this.model.participant_information;
    // People come with you, cars go with you
    this.modelUpdate.lstAccompanyingPersonManage = this.model.listAccompanyingPersonManage;
    this.modelUpdate.lstAccompanyingVehicleManage = this.model.listAccompanyingVehicleManage;

    let objAPI = Object.assign({}, this.modelUpdate);

    Object.keys(objAPI).map(
      (k) =>
      (objAPI[k] =
        typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );

    return objAPI;
  };

  // Upload avatar for front photo
  uploadIdentificationPhoto(files: FileList) {
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
            let x: any = document.getElementById("identification_photo");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            this.identification_photo = res.data[0].url;
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

  // Upload avatar for img_in_photo
  uploadImgInPhoto(files: FileList) {
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
            let x: any = document.getElementById("img_in_photo");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            this.img_in_photo = res.data[0].url;
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

  // Upload avatar for img_out_photo
  uploadImgOutPhoto(files: FileList) {
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
            let x: any = document.getElementById("img_out_photo");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            this.img_out_photo = res.data[0].url;
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

  // Upload image document_return_img
  uploadDocumentReturn(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    // Xử lý tệp đã chọn ở đây
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
            let x: any = document.getElementById("document_return_img");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            this.model.document_return_img = res.data[0].url;
            this._configService.loadingSubject.next("false");
            this.isShowIconUpload = false;
            this.isShowIconDelete = true;
            this.imageDocumentReturnName = res.data[0].url;
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

  // Xóa giấy tờ tùy thân
  removeImage = (strImg: string) => {
    if (strImg == 'identification_photo') {
      this.identification_photo = "";
    } else if(strImg == 'img_in_photo') {
      this.img_in_photo = "";
    }else if(strImg == "img_out_photo"){
      this.img_out_photo = "";
    }else{
      this.isShowIconUpload = true;
      this.isShowIconDelete = false;
      this.model.document_return_img = "";
      this.imageDocumentReturnName = this.DEFAULT_DOCUMENT_RETURN_NAME;
    }
  };

  receiveData(data: any, key: string) {
    this.equipmentDetailFlg = false;
    this.vehicleDetailFlg = false;
    if (key =='person' && data != null)
    {
      this.model.listAccompanyingPersonManage = data;
    } else if (key =='vehicle' && data != null) {
      this.model.listAccompanyingVehicleManage = data;
    }
  }

  // Hàm cập nhật dữ liệu
  saveData(): void {
    // Code để cập nhật dữ liệu ở đây
    const modelRequest = this.prepareModelBeforeSave();
    const url = "/inmanagement/update";
    this._coreService.Post(url, modelRequest).subscribe(
      (res) => {
        if (res && res.code == "200") {
          this.notification.success("Cập nhật thành công!");
          this.back();
        } else {
          this.notification.warning(`${res.error}!`);
        }
      },
      (error) => {
        this.notification.warning(`Lỗi hệ thống!`);
      }
    );
  }

  back(): void {
    // Đóng cửa sổ hiện tại
    window.close();

    // Quay lại trang trước đó và tải lại trang
    window.history.back();
    window.location.reload();
  }

  onCheckboxChange(event: any) {
    const checkedValue: boolean = event.checked; // Lấy giá trị checked từ sự kiện
    // Hiển thị nếu như “Giữ giấy tờ” được check. 
    // Check để đánh dấu là đã trả lại giấy tờ tuỳ thân của khách vào/ra.
    if(checkedValue)
    {
      this.isKeepCheck = true;
    }
    else
    {
      this.isKeepCheck = false;
    }
    // Clear StrImg
    this.model.document_return= false;
    this.isShowIconUpload = true;
    this.isShowIconDelete = false
    this.imageDocumentReturnName = this.DEFAULT_DOCUMENT_RETURN_NAME;
  }

  downloadImage(): void {
    const imageUrl = this.imageDocumentReturnName;
    if(imageUrl !== this.DEFAULT_DOCUMENT_RETURN_NAME)
    {
      fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, imageUrl); // Tên tập tin và loại tập tin
      });
    }
  }

  takePhotoLaneIn(index: number){
    var img = document.getElementById("cameralanein00");
    // Tạo một đối tượng Car mới
    this.createModalCarIn();
    this.model.license_in = this.infoCarIn.license_no;
  }

  takePhotoLaneOut(index: number){
    var img = document.getElementById("cameralanein10");
    // Tạo một đối tượng Car mới
    this.createModalCarOut();
    this.model.license_out = this.infoCarIn.license_no;
    // Những TH sai: 
    // TH1 - Xe ra không có thông tin trong CSDL
    // TH2 - Xe ra sai thông tin với xe vào.
    // Hiển thị text biển số xe được nhận diện.
    if(this.infoCarIn.license_no == this.infoCarOut.license_no)
    {
      this.isCorrect = true;
      this.isIncorrect = false;
    }
    else
    {
      this.isCorrect = false;
      this.isIncorrect = true;
    }
  }

  createModalCarIn(){
    // Tạo một đối tượng Car mới
    this.infoCarIn = {
      id: '',
      license_no: '17b4-10000',
      license_type: '32',
      vehicle: '42',
      range_of_vehicle: 39,
      color: 'Đỏ',
      car_owner: '91bccaf4-f8e6-4e6b-9267-f3bfb0c17b26',
      frontphoto_url: 'http://digiio.3sjsc.com/download/1_294311121220231.png',
      backphoto_url: 'http://digiio.3sjsc.com/download/3_314311121220231.png',
      note: 'Xe phích cứng',
      is_open_automatically: true
    };
  }

  createModalCarOut(){
    // Tạo một đối tượng Car mới
    this.infoCarOut = {
      id: '',
      license_no: '17b4-10000',
      license_type: '32',
      vehicle: '42',
      range_of_vehicle: 39,
      color: 'Đỏ',
      car_owner: '91bccaf4-f8e6-4e6b-9267-f3bfb0c17b26',
      frontphoto_url: 'http://digiio.3sjsc.com/download/1_294311121220231.png',
      backphoto_url: 'http://digiio.3sjsc.com/download/3_314311121220231.png',
      note: 'Xe phích cứng',
      is_open_automatically: true
    };
  }

  onDragStart(event: DragEvent, index: number, status: string) {
    this.dragIndex = index;
    this.dragStartStatus = status;
     // Thiết lập dữ liệu để kéo
    event.dataTransfer.setData('text/plain', '');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, index: number, status: string) {
    if(this.dragStartStatus == status)
    {
      if(status == "in")
      {
        event.preventDefault();
        if (this.dragIndex !== undefined) {
          const temp = this.model.listIn[this.dragIndex];
          this.model.listIn[this.dragIndex] = this.model.listIn[index];
          this.model.listIn[index] = temp;
          this.dragIndex = undefined;
        }
      }
      else
      {
        event.preventDefault();
        if (this.dragIndex !== undefined) {
          const temp = this.model.listOut[this.dragIndex];
          this.model.listOut[this.dragIndex] = this.model.listOut[index];
          this.model.listOut[index] = temp;
          this.dragIndex = undefined;
        }
      }
    }
    this.dragStartStatus = undefined;
  }
}
