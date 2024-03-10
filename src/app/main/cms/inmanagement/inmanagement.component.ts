import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
  ElementRef,
  QueryList,
  ViewChildren,
} from "@angular/core";

import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { TranslationLoaderService } from "src/app/common/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { locale as english } from "./i18n/en";
import { locale as vietnam } from "./i18n/vi";
import { Globals } from "src/app/common/globals";
import { Configs } from "src/app/common/configs";
import { Notification } from "src/app/common/notification";
import * as _ from "lodash";
import { L10n, setCulture } from "@syncfusion/ej2-base";
import {
  FilterService,
  GridComponent,
  VirtualScrollService,
} from "@syncfusion/ej2-angular-grids";
import { CoreService } from "src/app/_services/core.service";
import { ConfigService } from "src/app/_services/config.service";
import { ModalService } from "src/app/_services/modal.service";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import * as async from "async";
import { InfoInOut } from "src/app/_models/masterdata/InfoInOut";
import { FormBuilder, FormGroup, FormControl, FormArray } from "@angular/forms";
import { DataStateChangeEventArgs } from "@syncfusion/ej2-grids";
import { ToolbarItem, ToolbarInterface } from "src/app/_models/index";
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Inforleaving } from "src/app/_models/masterdata/Inforleaving";
import { GuestCalendar } from "src/app/_models/business/GuestCalendar";
import { Car } from "src/app/_models/masterdata/Car";
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';

setCulture("vi");
@Component({
  selector: "app-cms-inmanagement",
  templateUrl: "./inmanagement.component.html",
  styleUrls: ["./inmanagement.component.scss"],
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

export class InManagementComponent implements OnInit {
  // Varriable Language
  languages: any;
  selectedLanguage: any;
  flagState = "";
  pageIndex = 0;
  // Toolbar Item
  public toolbar: ToolbarInterface[];
  public toolbar2: ToolbarInterface[];
  dataLists: any[] = [];
  // Dropdown list data
  public fields: FieldSettingsModel = { text: "name", value: "id" };
  lstCheckpointName = [];
  lstPortName = [];
  lstDocumentType = [];
  documenttypes: string[] = [];
  lstEmployeeType = [];
  lstGuestcalendar = [];
  lstInviter = [];
  lstLanes = [];
  model: InfoInOut = new InfoInOut();
  filteredResults: string[][] = [];

  // List data
  public data: Observable<DataStateChangeEventArgs>;
  public state: DataStateChangeEventArgs;

  // Data send to parent
  dataToModal: any;
  equipmentDetailFlg : boolean = false;
  vehicleDetailFlg : boolean = false;

  // Check flag is present in the system or not
  isSystem : boolean = false;

  // View child Grid
  @ViewChild("overviewgrid", { static: false }) public gridInstance: GridComponent;
  // Show choose image by id
  @ViewChildren('identification') identifications!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('imgin') imgins!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('imgout') imgouts!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('documentreturnimg') documentreturnimgs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild('searchFocus', { static: false }) searchFocus: ElementRef;

  // Search conditions
  public search = {
    checkpoint_name: "",
    port_name: "",
    license_no: "",
    full_name: "",
    employee_type: "",
  };

  // Form submit
  form: FormGroup;
  // Data in form submit
  searchResultsArray: { 
    id: string,
    infoinout_id: string,
    full_name: string,
    document_number: string,
    address: string,
    phone_number: string,
    employee_type: number,
    document_keep: boolean,
    document_return: boolean,
    invited_guest: number,
    invited_person: number,
    job_title_name: string,
    department: string,
    job_description: string,
    participant_information: string,
    document_type: number,
    identification: string,
    img_in: string,
    img_out: string,
    license_in: string,
    license_out: string,
    stringShowSuggest: string,
    listAccompanyingPersonManage: [],
    listAccompanyingVehicleManage: [],
    lstToggleVisibilityInfoinout: [],
  }[] = [];

  // Id document
  private documentId;
  // Show as guest flag
  private isShowList: { [key: number]: boolean } = {};
  private isActivated: { [key: number]: boolean } = {};
  private isMode: { [key: number]: boolean } = {};
  private isKeepCheck: { [key: number]: boolean } = {};
  private isShowIconDelete: { [key: number]: boolean } = {};
  private isShowIconUpload: { [key: number]: boolean } = {};
  private imageDocumentReturnName: { [key: number]: string } = {};
  readonly DEFAULT_DOCUMENT_RETURN_NAME: string = 'hình_ảnh';
  private licenseinout: { [key: number]: string } = {};
  // Show correct_information/ incorrect
  private isCorrect: { [key: number]: boolean } = {};
  private isIncorrect: { [key: number]: boolean } = {};
  // Show lane
  private isCase1: { [key: number]: boolean } = {};
  private isCase234: { [key: number]: boolean } = {};
  private isLanein: { [key: number]: boolean } = {};
  private isLaneout: { [key: number]: boolean } = {};
  // Check infoUpdate
  private isHasInformation: { [key: number]: boolean } = {};

  // Drag and drop camera
  private dragIndex: number | undefined;
  private dragStartStatus: string | undefined;

  public modelAdd: any;

  // Collapse button to shrink/open lane information.
  isCollapsedList: boolean[] = []; // Mảng lưu trạng thái collapse của từng item
  isShowCollapsed: boolean = false;
  // Configure to hide and show input and output information
  isShowAddress: boolean = true;
  isShowPhonenumber: boolean = true;
  isShowEmployeeType: boolean = true;
  isShowGuestcalendar: boolean = true;
  isShowInvitedPerson: boolean = true;
  // Show button save
  private isShowSave: { [key: number]: boolean } = {};
  private isClickTakePhoto: { [key: number]: boolean } = {};
  // Fix car
  infoCarIn: Car;
  infoCarOut: Car;

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
    private http: HttpClient,
    public router: Router,
    private _formBuilder: FormBuilder,
    private _translateService: TranslateService,
    private _configService: ConfigService,
    private _tlaTranslationLoaderService: TranslationLoaderService
  ) {
    // Set language
    this.data = _coreService;
    
    this.languages = this.globals.languages;

    this._configService._configSubject.next("true");
    // Load file language
    this._tlaTranslationLoaderService.loadTranslations(vietnam, english);

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

    this.createForm();

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
                  setTimeout(() => {
                    if(this.lstCheckpointName[0] && this.lstCheckpointName[0] !== undefined)
                    {
                      this.search.checkpoint_name = this.lstCheckpointName[0].id;
                      this._coreService
                        .Get("/dropdown/port/" + this.search.checkpoint_name)
                        .subscribe((res) => {
                          if (res.code == "200") {
                            this.lstPortName = res.data;
                            setTimeout(() => {
                              if(this.lstPortName[0] && this.lstPortName[0] !== undefined)
                              {
                                this.search.port_name = this.lstPortName[0].id;
                                this.searchAfterFocus();
                              }
                              else
                              {
                                this.search.port_name = "";
                                this.dataLists = null;
                              }
                            }, 0);
                          }
                        });
                    }
                  }, 0);
                  return cb1();
                }
              }, (err) => {
                return cb1();
              });
          }, (cb2) => {
            this._coreService
            .Get("/dropdown/inforleavingbyemployee")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstInviter = res.data;
                  return cb2();
                }
              }, (err) => {
                return cb2();
              });
          }, (cb3) => {
            this._coreService
            .Get("/dropdown/guestcalendar")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstGuestcalendar = res.data;
                  return cb3();
                }
              }, (err) => {
                return cb3();
              });
          }, (cb4) => {
            this._coreService
            .Get("/dropdown/documenttype/document_type")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstDocumentType = res.data;

                  this.lstDocumentType.forEach((element) => {
                    this.documenttypes.push(element.name);
                  });
                  return cb4();
                }
              }, (err) => {
                return cb4();
              });
          }, (cb5) => {
            this._coreService
            .Get("/dropdown/inforleaving/status_infor_leaving")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstEmployeeType = res.data;
                  return cb5();
                }
              }, (err) => {
                return cb5();
              });
          }, (cb6) => {
            this._coreService
            .Get("/dropdown/lane")
              .subscribe((res) => {
                if (res.code == "200") {
                  this.lstLanes = res.data;
                  return cb6();
                }
              }, (err) => {
                return cb6();
              });
          }], (err, result) => {
            return cb();
          })
        }
      ],
      (err, ok) => {
      }
    );

    this.buildToolbar();
    this.getListData();
    this.equipmentDetailFlg = false;
    this.vehicleDetailFlg = false;
  }

  // Build Toolbar
  buildToolbar = () => {
    let toolbarList = [];
    toolbarList = [ToolbarItem.ADD];
    this.toolbar = this.globals.buildToolbar("cms_inmanagement", toolbarList);


    let toolbarList2 = [];
    toolbarList2 = [ToolbarItem.VIEW, ToolbarItem.EDIT, ToolbarItem.DELETE];
    this.toolbar2 = this.globals.buildToolbar("cms_inmanagement", toolbarList2);
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

  getPortName(){
    this.lstPortName = [];
    this._coreService
    .Get("/dropdown/port/" + this.search.checkpoint_name)
    .subscribe((res) => {
      if (res.code == "200") {
        this.lstPortName = res.data;
        setTimeout(() => {
          if(this.lstPortName[0] && this.lstPortName[0] !== undefined)
          {
            this.search.port_name = this.lstPortName[0].id;
            this.searchAfterFocus();
          }
          else
          {
            this.search.port_name = "";
            this.dataLists = null;
          }
        }, 0);
      }
    });
  }

  searchAfterFocus() {
    if(this.search.checkpoint_name && this.search.checkpoint_name !== undefined && 
       this.search.port_name && this.search.port_name !== undefined)
    {
      var str = this.search.checkpoint_name + " " + this.search.port_name;

      this._coreService
      .Get("/inmanagement/listEquipment/" + str)
      .subscribe((res) => {
        if (res.code == "200") {
          this.dataLists = res.data;
          // Initialize activation status array based on the number of keys
          this.isActivated = Array.from({ length: this.dataLists.length }, () => false);
          this.isCollapsedList = new Array(this.dataLists.length).fill(false);
          this.isMode = Array.from({ length: this.dataLists.length }, () => true);
          this.isKeepCheck = Array.from({ length: this.dataLists.length }, () => false);
          this.isShowIconDelete = Array.from({ length: this.dataLists.length }, () => false);
          this.isShowIconUpload = Array.from({ length: this.dataLists.length }, () => true);
          this.imageDocumentReturnName = Array.from({ length: this.dataLists.length }, () => this.DEFAULT_DOCUMENT_RETURN_NAME);
          this.isShowSave = Array.from({ length: this.dataLists.length }, () => false);
          this.isClickTakePhoto = Array.from({ length: this.dataLists.length }, () => false);
          this.dataLists.length > 0 ? this.isShowCollapsed = true : this.isShowCollapsed = false;
          // Show correct_information/ incorrect
          this.isCorrect = Array.from({ length: this.dataLists.length }, () => false);
          this.isIncorrect = Array.from({ length: this.dataLists.length }, () => false);
          // Show lane
          this.isCase1 = Array.from({ length: this.dataLists.length }, () => false);
          this.isCase234 = Array.from({ length: this.dataLists.length }, () => false);
          this.isLanein = Array.from({ length: this.dataLists.length }, () => false);
          this.isLaneout = Array.from({ length: this.dataLists.length }, () => false);
          // Check infoUpdate
          this.isHasInformation = Array.from({ length: this.dataLists.length }, () => false);
          // Licensein of lane out
          this.licenseinout = Array.from({ length: this.dataLists.length }, () => '');
          // Check mode lane
          this.dataLists.forEach((item, index) => {
            // TH1
            if(item.listIn.length > 0 && item.listOut.length == 0 || item.listIn.length == 0 && item.listOut.length > 0)
            {
              // Show lane
              this.isCase1[index] = true;
              this.isCase234[index] = false;
              item.listIn.length > 0 && item.listOut.length == 0 ? this.isLanein[index] = true : this.isLanein[index] = false;
              item.listIn.length == 0 && item.listOut.length > 0 ? this.isLaneout[index] = true : this.isLaneout[index] = false;
            }
            // TH2,3,4
            else
            {
              // Show lane
              this.isCase1[index] = false;
              this.isCase234[index] = true;
              this.isLanein[index] = true;
              this.isLaneout[index] = true;
            }
          });
          // Create form
          this.createForm();
        }
      });
      
      this._coreService
      .Get("/dropdown/inforleavingwithinout")
      .subscribe((res) => {
        if (res.code == "200") {
          this.searchResultsArray = res.data;
          // Configure to hide and show input and output information
          this.isShowAddress = res.data[0].lstToggleVisibilityInfoinout[0].address;
          this.isShowPhonenumber = res.data[0].lstToggleVisibilityInfoinout[0].phone_number;
          this.isShowEmployeeType = res.data[0].lstToggleVisibilityInfoinout[0].employee_type;
          this.isShowGuestcalendar = res.data[0].lstToggleVisibilityInfoinout[0].guestcalendar;
          this.isShowInvitedPerson = res.data[0].lstToggleVisibilityInfoinout[0].invited_person;
        }
      });
    }
  };

  createForm() {
    const groups = this.dataLists.map(() =>
      this._formBuilder.group({
        documenttype: ['CCCD'],
        searchValue: [''],
        document_number: [''],
        full_name: [''],
        address: [''],
        phone_number: [''],
        employee_type: [''],
        document_keep: [new FormControl(false)],
        document_return: [new FormControl(false)],
        document_return_img: [''],
        invited_guest: [''],
        invited_person: [''],
        job_title_name: [''],
        department: [''],
        job_description: [''],
        participant_information: [''],
        identification: [''],
        img_in: [''],
        img_out: [''],
        license_in: [''],
        license_out: [''],
        isModode: [''],
        overview_in_img: [''],
        identification_in_img: [''],
        detail_in_img: [''],
        overview_out_img: [''],
        identification_out_img: [''],
        detail_out_img: [''],
        overview_inout_img: [''],
        identification_inout_img: [''],
        detail_inout_img: [''],
        searchResults: this._formBuilder.array([])
      })
    );

    this.form = this._formBuilder.group({
      groups: this._formBuilder.array(groups)
    });
  }

  onRadioButtonClick(value: string, index: number) {
    this.searchResultsArray[index].document_type = this.lstDocumentType.filter(x => x.name === value)[0].id;
  }

  selectSuggestion(suggestion: string, index: number) {
    let sugDocumentNumber = suggestion.split('-')[1].trim();
    const control = (this.form.get('groups') as FormArray).at(index).get('searchValue') as FormControl;
    if (control) {
      control.setValue(sugDocumentNumber);
    }
    this.clearSearchResults(index);
    this.documentId = this.searchResultsArray.filter(x => x.document_number === sugDocumentNumber)[0].id;
    this.searchByInputDocument(index, true);
  }

  clearSearchResults(index: number) {
    const searchResultsControl = (this.form.get('groups') as FormArray).at(index).get('searchResults') as FormArray;
    if (searchResultsControl) {
      searchResultsControl.clear();
    }
  }

  searchByInputDocument(index: number, status: boolean){
    // Update document id by searchvalue
    const control = (this.form.get('groups') as FormArray).at(index).get('searchValue') as FormControl;

    if(this.documentId == undefined && control.value == "")
    {
      this.isActivated[index] = false;
    }
    else
    {
      this.isActivated[index] = true;

      // Set mode update
      if(status)
      {
        if(this.searchResultsArray.filter(x => x.document_number === control.value)[0] &&
        this.searchResultsArray.filter(x => x.document_number === control.value)[0] !== undefined)
        {
          this.documentId = this.searchResultsArray.filter(x => x.document_number === control.value)[0].id;
        }
        else
        {
          this.clearData(index);
          return;
        }
        (this.form.get('groups') as FormArray).at(index).get('isModode').setValue("edit");
      }
      // Set info use in form info in/out
      const documenttype = (this.form.get('groups') as FormArray).at(index).get('documenttype') as FormControl;
      const document_number = (this.form.get('groups') as FormArray).at(index).get('document_number') as FormControl;
      const full_name = (this.form.get('groups') as FormArray).at(index).get('full_name') as FormControl;
      const address = (this.form.get('groups') as FormArray).at(index).get('address') as FormControl;
      const phone_number = (this.form.get('groups') as FormArray).at(index).get('phone_number') as FormControl;
      const employee_type = (this.form.get('groups') as FormArray).at(index).get('employee_type') as FormControl;
      const identification = (this.form.get('groups') as FormArray).at(index).get('identification');
      const img_in = (this.form.get('groups') as FormArray).at(index).get('img_in');
      const img_out = (this.form.get('groups') as FormArray).at(index).get('img_out');
      const license_in = (this.form.get('groups') as FormArray).at(index).get('license_in');
      const license_out = (this.form.get('groups') as FormArray).at(index).get('license_out');

      // Row Radio Button
      if (documenttype) {
        if(this.searchResultsArray.filter(x => x.id === this.documentId)[0].document_type != null)
        {
          documenttype.setValue(this.lstDocumentType.filter(x => x.id === this.searchResultsArray.filter(x => x.id === this.documentId)[0].document_type)[0].name);
        }
      }
      // Số giấy tờ
      if(status)
      {
        (this.form.get('groups') as FormArray).at(index).get('document_number').disable();
      }
      if (document_number) {
        document_number.setValue(this.searchResultsArray.filter(x => x.id === this.documentId)[0].document_number);
      }
      // Họ tên
      (this.form.get('groups') as FormArray).at(index).get('full_name').disable();
      if (full_name) {
        full_name.setValue(this.searchResultsArray.filter(x => x.id === this.documentId)[0].full_name);
      }
      // Địa chỉ
      if (address) {
        address.setValue(this.searchResultsArray.filter(x => x.id === this.documentId)[0].address);
      }
      // Điện thoại
      if (phone_number) {
        phone_number.setValue(this.searchResultsArray.filter(x => x.id === this.documentId)[0].phone_number);
      }
      // Loại ra vào
      if (employee_type) {
        employee_type.setValue(this.searchResultsArray.filter(x => x.id === this.documentId)[0].employee_type);
      }
      // Giấy tờ tùy thân
      if (identification) {
        identification.setValue(this.searchResultsArray.filter(x => x.id === this.documentId)[0].identification);
      }
      // Ảnh người vào
      if (img_in) {
        img_in.setValue(this.searchResultsArray.filter(x => x.id === this.documentId)[0].img_in);
      }
      // Ảnh người ra
      if (img_out) {
        img_out.setValue(this.searchResultsArray.filter(x => x.id === this.documentId)[0].img_out);
      }
      // Biển số xe vào
      if (license_in) {
        license_in.setValue(this.searchResultsArray.filter(x => x.id === this.documentId)[0].license_in);
      }
      // Biển số xe ra
      if (license_out) {
        license_out.setValue(this.searchResultsArray.filter(x => x.id === this.documentId)[0].license_out);
      }
      this.isMode[index] = false;
      (this.form.get('groups') as FormArray).at(index).get('documenttype').disable();
      (this.form.get('groups') as FormArray).at(index).get('address').disable();
      (this.form.get('groups') as FormArray).at(index).get('phone_number').disable();
      (this.form.get('groups') as FormArray).at(index).get('employee_type').disable();
      // Only displayed if the entry type is a guest
      if(this.searchResultsArray.filter(x => x.id === this.documentId)[0].employee_type == 45)
      {
        this.isShowList[index] = true;
        this.isShowIconUpload[index] = true;
        this.isKeepCheck[index] = false;
      }
      else
      {
        this.isShowList[index] = false;
      }
      // Show button save
      this.isShowSave[index] = true;
      
      // Clear data
      const searchResultsControl = (this.form.get('groups') as FormArray).at(index).get('searchResults') as FormArray;
      searchResultsControl.clear();
      this.documentId = "";
    }
  }

  clearData(index: number)
  {
    const searchResultsControl = (this.form.get('groups') as FormArray).at(index).get('searchResults') as FormArray;
      if (searchResultsControl) {
        searchResultsControl.clear();
      }

      this.isMode[index] = true;
      (this.form.get('groups') as FormArray).at(index).get('documenttype').enable();
      (this.form.get('groups') as FormArray).at(index).get('address').enable();
      (this.form.get('groups') as FormArray).at(index).get('phone_number').enable();
      (this.form.get('groups') as FormArray).at(index).get('employee_type').enable();

      const documenttype = (this.form.get('groups') as FormArray).at(index).get('documenttype') as FormControl;
      const document_number = (this.form.get('groups') as FormArray).at(index).get('document_number') as FormControl;
      const full_name = (this.form.get('groups') as FormArray).at(index).get('full_name') as FormControl;
      const address = (this.form.get('groups') as FormArray).at(index).get('address') as FormControl;
      const phone_number = (this.form.get('groups') as FormArray).at(index).get('phone_number') as FormControl;
      const employee_type = (this.form.get('groups') as FormArray).at(index).get('employee_type') as FormControl;
      const identification = (this.form.get('groups') as FormArray).at(index).get('identification');

      // Row Radio Button
      if (documenttype) {
        documenttype.setValue(null);
      }
      // Số giấy tờ
      (this.form.get('groups') as FormArray).at(index).get('document_number').enable();
      if (document_number) {
        document_number.setValue(null);
      }
      // Họ tên
      (this.form.get('groups') as FormArray).at(index).get('full_name').enable();
      if (full_name) {
        full_name.setValue(null);
      }
      // Địa chỉ
      if (address) {
        address.setValue(null);
      }
      // Điện thoại
      if (phone_number) {
        phone_number.setValue(null);
      }
      // Loại ra vào
      if (employee_type) {
        employee_type.setValue(null);
      }
      // Giấy tờ tùy thân
      if (identification) {
        identification.setValue(null);
      }
      // this.searchFocus.nativeElement.focus();
      this.isActivated[index] = false;
      // Show button save
      this.isShowSave[index] = false;
  }

  clearDataWhenSeachValueNull(document_number: string, index: number) {
    if(!(document_number && document_number !== undefined))
    {
      this.clearData(index);
    }
    else
    {
      const control = (this.form.get('groups') as FormArray).at(index).get('searchValue') as FormControl;
      if(this.searchResultsArray.filter(x => x.document_number === control.value)[0] && 
         this.searchResultsArray.filter(x => x.document_number === control.value)[0] !== undefined)
      {
        this.documentId = this.searchResultsArray.filter(x => x.document_number === control.value)[0].id;
        this.searchByInputDocument(index, true);
      }
      else
      {
        let searchResultsControl = (this.form.get('groups') as FormArray).at(index).get('searchResults') as FormArray;
        if(searchResultsControl.length == 0)
        {
          console.log("Clear");
          this.clearData(index);
        }
      }
    }
  }

  searchValueEnter = (event, index: number, status: boolean): void => {
    if (event.keyCode === 13) {
      this.searchByInputDocument(index, status);
    }
  };

  onSuggestId(document_number: string, index: number) {
    const searchResultsControl = (this.form.get('groups') as FormArray).at(index).get('searchResults') as FormArray;
    if (searchResultsControl) {
      searchResultsControl.clear();
      this.searchResultsArray.forEach(result => {
        if(result.document_number && result.document_number !== undefined)
        {
          if (result.document_number.toLowerCase().includes(document_number.toLowerCase()) && document_number !== "") {
            searchResultsControl.push(new FormControl(result.stringShowSuggest));
          }
        }
      });
    }
  }

  changeEmployeeType(index: number){
    const employee_type = (this.form.get('groups') as FormArray).at(index).get('employee_type') as FormControl;
    (this.form.get('groups') as FormArray).at(index).get('invited_guest').reset();
    (this.form.get('groups') as FormArray).at(index).get('document_keep').reset();
    (this.form.get('groups') as FormArray).at(index).get('document_return').reset();
    (this.form.get('groups') as FormArray).at(index).get('document_return_img').reset();
    this.imageDocumentReturnName[index] = this.DEFAULT_DOCUMENT_RETURN_NAME;
    this.isShowIconUpload[index] = true;
    this.isShowIconDelete[index] = false
    this.isKeepCheck[index] = false;
    // Only displayed if the entry type is a guest
    if(employee_type.value == 45)
    {
      this.isShowList[index] = true;
    }
    else
    {
      this.isShowList[index] = false;
    }
  }

  getInfoGuestsBookedAppointments(index: number){
    const invited_guest_id = (this.form.get('groups') as FormArray).at(index).get('invited_guest') as FormArray;
    const job_description = (this.form.get('groups') as FormArray).at(index).get('job_description') as FormControl;
    const participant_information = (this.form.get('groups') as FormArray).at(index).get('participant_information') as FormControl;
    const invited_person = (this.form.get('groups') as FormArray).at(index).get('invited_person') as FormControl;
    const department = (this.form.get('groups') as FormArray).at(index).get('department') as FormControl;
    const job_title_name = (this.form.get('groups') as FormArray).at(index).get('job_title_name') as FormControl;
    // If there is information in the guest calendar:
    if(invited_guest_id.value && invited_guest_id.value !== undefined)
    {
      // Nội dung làm việc
      if (job_description) {
        job_description.setValue(this.lstGuestcalendar.filter(x => x.id === invited_guest_id.value)[0].job_description);
      }
      // Thông tin đi cùng
      if (participant_information) {
        participant_information.setValue(this.lstGuestcalendar.filter(x => x.id === invited_guest_id.value)[0].participant_information);
      }
      if(this.isShowInvitedPerson)
      {
        // Người mời
        if (invited_person) {
          invited_person.setValue(this.lstGuestcalendar.filter(x => x.id === invited_guest_id.value)[0].invited_person);
        }
        // Phòng ban
        if (department) {
          department.setValue(this.lstGuestcalendar.filter(x => x.id === invited_guest_id.value)[0].department);
        }
        // Chức vụ
        if (job_title_name) {
          job_title_name.setValue(this.lstGuestcalendar.filter(x => x.id === invited_guest_id.value)[0].job_title);
        }
        (this.form.get('groups') as FormArray).at(index).get('invited_person').disable();
      }
      else
      {
        (this.form.get('groups') as FormArray).at(index).get('invited_person').enable();
        // Người mời
        if (invited_person) {
          invited_person.setValue(null);
        }
        // Phòng ban
        if (department) {
          department.setValue(null);
        }
        // Chức vụ
        if (job_title_name) {
          job_title_name.setValue(null);
        }
      }
    }
    // If there is no guest scheduled, you are allowed to choose normally
    else
    {
      (this.form.get('groups') as FormArray).at(index).get('invited_person').enable();
      // Người mời
      if (invited_person) {
        invited_person.setValue(null);
      }
      // Phòng ban
      if (department) {
        department.setValue(null);
      }
      // Chức vụ
      if (job_title_name) {
        job_title_name.setValue(null);
      }
      // Nội dung làm việc
      if (job_description) {
        job_description.setValue(null);
      }
      // Thông tin đi cùng
      if (participant_information) {
        participant_information.setValue(null);
      }
    }
  }

  getInfoInvitedPerson(invitedPersonId: any, index: number){
    let inviterInfo: any = this.lstInviter.filter(x => x.id.toString() === invitedPersonId)[0];
    const job_title_name = (this.form.get('groups') as FormArray).at(index).get('job_title_name') as FormControl;
    const department = (this.form.get('groups') as FormArray).at(index).get('department') as FormControl;
    if (inviterInfo != null)
    {
      // Chức vụ
      if (job_title_name) {
        job_title_name.setValue(inviterInfo.title_name);
      }
      // Phòng ban
      if (department) {
        department.setValue(inviterInfo.org_name);
      }
    }
    else
    {
      // Chức vụ
      if (job_title_name) {
        job_title_name.setValue(null);
      }
      // Phòng ban
      if (department) {
        department.setValue(null);
      }
    }
  }

  createModalDefault()
  {
    return {
      id: "",
      infoinout_id: "",
      full_name: "",
      document_number: "",
      address: "",
      phone_number: "",
      employee_type: null,
      document_keep: false,
      document_return: false,
      invited_guest: null,
      invited_person: null,
      job_title_name: "",
      department: "",
      job_description: "",
      participant_information: "",
      document_type: null,
      identification: "",
      img_in: "",
      img_out: "",
      license_in: "",
      license_out: "",
      stringShowSuggest: "",
      listAccompanyingPersonManage: null,
      listAccompanyingVehicleManage: null,
      lstToggleVisibilityInfoinout: null,
    }
  }

  checkInSystem(document_number: string, index: number) {
    const isTrue = this.searchResultsArray.some(x => x.document_number === document_number && x.id !== '');
    const control = (this.form.get('groups') as FormArray).at(index).get('searchValue') as FormControl;
    if (control) {
      control.setValue(null);
    }
    if (isTrue) {
      this.documentId = this.searchResultsArray.filter(x => x.document_number === document_number)[0].id;
      this.searchByInputDocument(index, false);
    } else {
      if(document_number == "")
      {
        // Show button save
        this.isShowSave[index] = false;
        (this.form.get('groups') as FormArray).at(index).reset();
        (this.form.get('groups') as FormArray).at(index).enable();
      }
      else
      {
        const isModode = (this.form.get('groups') as FormArray).at(index).get('isModode') as FormControl;
        const document_number = (this.form.get('groups') as FormArray).at(index).get('document_number') as FormArray;
        if (isModode) {
          isModode.setValue("new");
          this.searchResultsArray = this.searchResultsArray.filter(item => item.id !== '');
          this.searchResultsArray.push(this.createModalDefault());
          this.searchResultsArray[this.searchResultsArray.length - 1].document_number = document_number.value;
          this.isShowSave[index] = true;
          this.isActivated[index] = true;
        }
        (this.form.get('groups') as FormArray).at(index).enable();
      }
    }
  }

  // GetListData
  getListData = (): void => {
    const state = { take: 20, skip: 0 };
    if (this.state && this.state.take) {
      this.state.skip = this.state.skip;
      this.state.take = this.state.take;
      this.pageIndex = Math.floor(this.state.skip / this.state.take);
    } else {
      this.state = state;
      this.pageIndex = 0;
    }
    let extraParams = [];

    // Xét có điều kiện tìm kiếm
    if (this.search.license_no) {
      extraParams.push({
        field: "license_no",
        value: this.search.license_no.trim(),
      });
    }
    if (this.search.full_name) {
      extraParams.push({
        field: "full_name",
        value: this.search.full_name.trim(),
      });
    }
    if (this.search.employee_type) {
      extraParams.push({
        field: "employee_type",
        value: this.search.employee_type,
      });
    }

    this._coreService.execute(state, "/inmanagement/list", extraParams);
  };

  // Format stt (Sort index)
  formatStt = (index: string) => {
    return (
      this.pageIndex * this.gridInstance.pageSettings.pageSize +
      parseInt(index, 0) +
      1
    );
  };

   // Set DataChange OnInit
   dataStateChange(state: DataStateChangeEventArgs): void {
    this.state = state;
    this.pageIndex = Math.floor(state.skip / state.take);
    let extraParams = [];
    // Consider search conditions
    if (this.search.checkpoint_name) {
      extraParams.push({
        field: "checkpoint_name",
        value: this.search.checkpoint_name,
      });
    }

    if (this.search.port_name) {
      extraParams.push({
        field: "port_name",
        value: this.search.port_name
      });
    }

    this._coreService.execute(state, "/inmanagement/list", extraParams);
  }

  // Xóa giấy tờ tùy thân
  removeImage = (model: string, index: number) => {
    if(this.isMode[index])
    {
      const identification = (this.form.get('groups') as FormArray).at(index).get(model);
      if(model !== "document_return_img")
      {
        identification.setValue(null);
      }
    }

    if(model == "document_return_img")
    {
      const identification = (this.form.get('groups') as FormArray).at(index).get(model);
      identification.setValue(null);
      this.isShowIconUpload[index] = true;
      this.isShowIconDelete[index] = false;
      this.imageDocumentReturnName[index] = this.DEFAULT_DOCUMENT_RETURN_NAME;
    }
  };

  accompanying_person_manageShow(index: number){
    const control = (this.form.get('groups') as FormArray).at(index).get('searchValue') as FormControl;
    const document_number = (this.form.get('groups') as FormArray).at(index).get('document_number') as FormControl;
    let infoinoutIdValue: any;
    let lstPerson : any;
    if(this.searchResultsArray.filter(x => x.document_number === control.value)[0] && this.searchResultsArray.filter(x => x.document_number === control.value)[0] != undefined)
    {
      infoinoutIdValue = this.searchResultsArray.filter(x => x.document_number === control.value)[0].id;
      lstPerson = this.searchResultsArray.filter(x => x.document_number === control.value)[0].listAccompanyingPersonManage;
    }
    if(control.value == "" && document_number.value && document_number.value !== undefined )
    {
      infoinoutIdValue = "";
      lstPerson = this.searchResultsArray.filter(x => x.document_number === document_number.value)[0].listAccompanyingPersonManage;
    }

    this.equipmentDetailFlg = true;
    this.vehicleDetailFlg = false;
    this.dataToModal = [
      {
        index: index,
        infoinout_id: infoinoutIdValue,
        listaccompanyingpersonManage: lstPerson
      }
    ];
    
    this.modalService.open("accompanying-person-manage");
  }

  accompanying_vehicle_manageShow(index: number){
    const control = (this.form.get('groups') as FormArray).at(index).get('searchValue') as FormControl;
    const document_number = (this.form.get('groups') as FormArray).at(index).get('document_number') as FormControl;
    let infoinoutIdValue: any;
    let lstVehicle : any;
    if(this.searchResultsArray.filter(x => x.document_number === control.value)[0] && this.searchResultsArray.filter(x => x.document_number === control.value)[0] != undefined)
    {
      infoinoutIdValue = this.searchResultsArray.filter(x => x.document_number === control.value)[0].id;
      lstVehicle = this.searchResultsArray.filter(x => x.document_number === control.value)[0].listAccompanyingVehicleManage;
    }
    if(control.value == "" && document_number.value && document_number.value !== undefined )
    {
      infoinoutIdValue = "";
      lstVehicle = this.searchResultsArray.filter(x => x.document_number === document_number.value)[0].listAccompanyingVehicleManage;
    }

    this.equipmentDetailFlg = false;
    this.vehicleDetailFlg = true;
    this.dataToModal = [
      {
        index: index,
        infoinout_id: infoinoutIdValue,
        listaccompanyingvehicleManage: lstVehicle
      }
    ];
    
    this.modalService.open("accompanying-vehicle-manage");
  }

  // Click button take a photo
  takeAPhotoForIdentification(index: number) {
    if(this.isMode[index])
    {
      const inputElements = this.identifications.toArray();
      if (inputElements.length > index) {
        inputElements[index].nativeElement.click();
      }
    }
  }

  // Click button take a photo
  takeAPhotoForImgIn(index: number) {
    const inputElements = this.imgins.toArray();
    if (inputElements.length > index) {
      inputElements[index].nativeElement.click();
    }
  }

  // Click button take a photo
  takeAPhotoForImgOut(index: number) {
    const inputElements = this.imgouts.toArray();
    if (inputElements.length > index) {
      inputElements[index].nativeElement.click();
    }
  }

  // Click button take a photo
  takeAPhotoForDocumentReturn(index: number) {
    const inputElements = this.documentreturnimgs.toArray();
    if (inputElements.length > index) {
      inputElements[index].nativeElement.click();
    }
  }

  // Upload image identification
  uploadIdentification(event: Event, index: number) {
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
            let x: any = document.getElementById("identification");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            const identification = (this.form.get('groups') as FormArray).at(index).get('identification');
            identification.setValue(res.data[0].url);
            // For cases where person information is not in the database, performing OCR will disable the document number, full name,.. fields.
            if(!this.isSystem)
            {
              const document_number = (this.form.get('groups') as FormArray).at(index).get('document_number') as FormControl;
              const full_name = (this.form.get('groups') as FormArray).at(index).get('full_name') as FormControl;
              const address = (this.form.get('groups') as FormArray).at(index).get('address') as FormControl;
              // Số giấy tờ
              if (document_number) {
                document_number.setValue("Test_0011004449316");
              }
              // Họ tên
              if (full_name) {
                full_name.setValue("Test_DungNT");
              }
              // Địa chỉ
              if (address) {
                address.setValue("Test_HH-TB");
              }
            }
            // If data exists in the system, fill in automatically.
            else
            {
              // TODO
            }
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

  // Upload image img_in
  uploadImgIn(event: Event, index: number) {
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
            let x: any = document.getElementById("img_in");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            const img_in = (this.form.get('groups') as FormArray).at(index).get('img_in');
            img_in.setValue(res.data[0].url);
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

  // Upload image img_out
  uploadImgOut(event: Event, index: number) {
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
            let x: any = document.getElementById("img_out");
            x.value = null;
            return;
          }
        }
        let data = new FormData();
        data.append("files", files[0]);
        this._coreService.uploadFile(data).subscribe((res) => {
          if (res && res.status && res.status == 200) {
            const img_out = (this.form.get('groups') as FormArray).at(index).get('img_out');
            img_out.setValue(res.data[0].url);
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
            const document_return_img = (this.form.get('groups') as FormArray).at(index).get('document_return_img');
            document_return_img.setValue(res.data[0].url);
            this.isShowIconUpload[index] = false;
            this.isShowIconDelete[index] = true;
            this.imageDocumentReturnName[index] = res.data[0].url;
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

  searchListEnter = (event): void => {
    if (event.keyCode === 13) {
      this.getListData();
    }
  };

  employeeTypeChange(){
    this.getListData();
  }

  clear (index: number): void {
    (this.form.get('groups') as FormArray).at(index).reset();
    (this.form.get('groups') as FormArray).at(index).enable();
  }

  saveData(index: number) {
    const modelRequest = this.prepareModelBeforeSave(index);
    const url = "/inmanagement/create";
    this._coreService.Post(url, modelRequest).subscribe(
      (res) => {
        if (res && res.code == "200") {
          this.notification.success("Cập nhật thành công!");
          (this.form.get('groups') as FormArray).at(index).reset();
          (this.form.get('groups') as FormArray).at(index).enable();
          this.searchAfterFocus();
          this.getListData();
        } else {
          this.notification.warning(`${res.error}!`);
        }
      },
      (error) => {
        this.notification.warning(`Lỗi hệ thống!`);
      }
    );
  }

  prepareModelBeforeSave = (index: number) => {
    // Set data for table info in/ out
    this.isHasInformation[index] == true ? this.model.io_type = true : this.model.io_type = false;
    // Is mode
    this.model.isModode = (this.form.get('groups') as FormArray).at(index).get('isModode').value;
    // Update document id by searchvalue
    const control = (this.form.get('groups') as FormArray).at(index).get('searchValue') as FormControl;
    if(this.model.isModode != "new")
    {
      this.model.inforleaving = this.searchResultsArray.filter(x => x.document_number === control.value)[0].id;
    }
    this.model.license_in = (this.form.get('groups') as FormArray).at(index).get('license_in').value;
    this.model.guestcalendar = (this.form.get('groups') as FormArray).at(index).get('invited_guest').value;
    this.model.invited_person = (this.form.get('groups') as FormArray).at(index).get('invited_person').value;
    this.model.img_in = (this.form.get('groups') as FormArray).at(index).get('img_in').value;
    this.model.time_in = new Date();
    if(this.isHasInformation[index])
    {
      this.model.license_out = (this.form.get('groups') as FormArray).at(index).get('license_out').value;
      this.model.img_out = (this.form.get('groups') as FormArray).at(index).get('img_out').value;
      this.model.time_out = new Date();
    }
    this.model.lane_id = this.dataLists[index].id;
    this.model.document_keep = (this.form.get('groups') as FormArray).at(index).get('document_keep').value;
    this.model.document_return = (this.form.get('groups') as FormArray).at(index).get('document_return').value;

    const overviewFormGroup = (this.form.get('groups') as FormArray).at(index) as FormGroup;

    //Out
    this.model.overview_out_img= overviewFormGroup.value.overview_out_img;
    this.model.identification_out_img= overviewFormGroup.value.identification_out_img;
    this.model.detail_out_img  = overviewFormGroup.value.detail_out_img;

    //In
    this.model.overview_in_img = overviewFormGroup.value.overview_in_img;
    this.model.identification_in_img = overviewFormGroup.value.identification_in_img;
    this.model.detail_in_img = overviewFormGroup.value.detail_in_img;
    

    //In
    // this.model.overview_in_img = (this.form.get('groups') as FormArray).at(index).get('overview_in_img' ).value;
    // this.model.identification_in_img = (this.form.get('groups') as FormArray).at(index).get('identification_in_img').value;
    // this.model.detail_in_img = (this.form.get('groups') as FormArray).at(index).get('detail_in_img').value;


    // //Out
    // this.model.overview_out_img = (this.form.get('groups') as FormArray).at(index).get('overview_out_img').value;
    // this.model.identification_out_img = (this.form.get('groups') as FormArray).at(index).get('identification_out_img').value;
    // this.model.detail_out_img = (this.form.get('groups') as FormArray).at(index).get('detail_out_img').value;

    this.model.document_return_img = (this.form.get('groups') as FormArray).at(index).get('document_return_img').value;



    // Init Inforleaving
    this.model.inforLeavingRequestInfo = new Inforleaving();
    this.model.inforLeavingRequestInfo.document_number = (this.form.get('groups') as FormArray).at(index).get('document_number').value;
    this.model.inforLeavingRequestInfo.full_name = (this.form.get('groups') as FormArray).at(index).get('full_name').value;
    this.model.inforLeavingRequestInfo.address = (this.form.get('groups') as FormArray).at(index).get('address').value;
    this.model.inforLeavingRequestInfo.phone_number = (this.form.get('groups') as FormArray).at(index).get('phone_number').value;
    this.model.inforLeavingRequestInfo.employee_type = (this.form.get('groups') as FormArray).at(index).get('employee_type').value;
    this.model.inforLeavingRequestInfo.document_type = (this.form.get('groups') as FormArray).at(index).get('documenttype').value;
    this.model.inforLeavingRequestInfo.front_photo = (this.form.get('groups') as FormArray).at(index).get('identification').value;
    // Init GuestCalendar
    this.model.guestCalendarInfo = new GuestCalendar();
    this.model.guestCalendarInfo.job_description = (this.form.get('groups') as FormArray).at(index).get('job_description').value;
    this.model.guestCalendarInfo.participant_information = (this.form.get('groups') as FormArray).at(index).get('participant_information').value;
    // Info Car
    this.model.infoCar = this.infoCarIn || this.infoCarOut;
    // People come with you, cars go with you
    if(this.model.isModode != "new")
    {
      let indexValue = this.searchResultsArray.findIndex(x => x.document_number === control.value);
      this.model.lstAccompanyingPersonManage = this.searchResultsArray[indexValue].listAccompanyingPersonManage;
      this.model.lstAccompanyingVehicleManage = this.searchResultsArray[indexValue].listAccompanyingVehicleManage;
    }
    else
    {
      this.model.lstAccompanyingPersonManage = this.searchResultsArray[this.searchResultsArray.length - 1].listAccompanyingPersonManage;
      this.model.lstAccompanyingVehicleManage = this.searchResultsArray[this.searchResultsArray.length - 1].listAccompanyingVehicleManage;
    }
    let objAPI = Object.assign({}, this.model);

    Object.keys(objAPI).map(
      (k) =>
      (objAPI[k] =
        typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );

    return objAPI;
  };

  onDragStart(event: DragEvent, index: number, status: string) {
    this.dragIndex = index;
    this.dragStartStatus = status;
     // Thiết lập dữ liệu để kéo
    event.dataTransfer.setData('text/plain', '');
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, indexFirst:number, index: number, status: string) {
    if(this.dragStartStatus == status)
    {
      if(status == "in")
      {
        event.preventDefault();
        if (this.dragIndex !== undefined) {
          const temp = this.dataLists[indexFirst].listIn[this.dragIndex];
          this.dataLists[indexFirst].listIn[this.dragIndex] = this.dataLists[indexFirst].listIn[index];
          this.dataLists[indexFirst].listIn[index] = temp;
          this.dragIndex = undefined;
        }
      }
      else
      {
        event.preventDefault();
        if (this.dragIndex !== undefined) {
          const temp = this.dataLists[indexFirst].listOut[this.dragIndex];
          this.dataLists[indexFirst].listOut[this.dragIndex] = this.dataLists[indexFirst].listOut[index];
          this.dataLists[indexFirst].listOut[index] = temp;
          this.dragIndex = undefined;
        }
      }
    }
    this.dragStartStatus = undefined;
  }

  receiveData(data: any, key: string) {
    const control = (this.form.get('groups') as FormArray).at(data.index).get('searchValue') as FormControl;

    let index = this.searchResultsArray.findIndex(x => x.document_number === control.value);

    if(index < 0)
    {
      this.equipmentDetailFlg = false;
      this.vehicleDetailFlg = false;
      if (key =='person' && data != null)
      {
        this.searchResultsArray[this.searchResultsArray.length - 1].listAccompanyingPersonManage = data;
      } else if (key =='vehicle' && data != null) {
        this.searchResultsArray[this.searchResultsArray.length - 1].listAccompanyingVehicleManage = data;
      }
    }
    else
    {
      this.equipmentDetailFlg = false;
      this.vehicleDetailFlg = false;
      if (key =='person' && data != null)
      {
        this.searchResultsArray[index].listAccompanyingPersonManage = data;
      } else if (key =='vehicle' && data != null) {
        this.searchResultsArray[index].listAccompanyingVehicleManage = data;
      }
    }
  }

  clickRecord = (data, status) => {
    if (data && status === "view") {
      this.modelAdd = data; // Giả sử this.modelAdd đã có dữ liệu từ nơi khác
      const objParamAdd = { id: this.modelAdd.id, type: "view" };
      const paramAdd = window.btoa(JSON.stringify(objParamAdd));
      const url = `/cms/inmanagement/${paramAdd}`; // Tạo URL với tham số đã mã hóa
      const newWindow = window.open('', '_blank'); // Mở cửa sổ mới trống
      if (newWindow) {
        newWindow.location.href = url; // Đổi route trong cửa sổ mới
      } else {
        console.error('Không thể mở cửa sổ mới. Vui lòng kiểm tra cài đặt trình duyệt của bạn.');
      }
    }
    
    if (data && status === "edit") {
      this.modelAdd = data; // Giả sử this.modelAdd đã có dữ liệu từ nơi khác
      const objParamAdd = { id: this.modelAdd.id, type: "edit" };
      const paramAdd = window.btoa(JSON.stringify(objParamAdd));
      const url = `/cms/inmanagement/${paramAdd}`; // Tạo URL với tham số đã mã hóa
      const newWindow = window.open('', '_blank'); // Mở cửa sổ mới trống
      if (newWindow) {
        newWindow.location.href = url; // Đổi route trong cửa sổ mới
      } else {
        console.error('Không thể mở cửa sổ mới. Vui lòng kiểm tra cài đặt trình duyệt của bạn.');
      }
    }
  };

  toggleCollapse(index: number) {
    this.isCollapsedList[index] = !this.isCollapsedList[index];
  }

  onCheckboxChange(event: any, index: number) {
    const checkedValue: boolean = event.checked; // Lấy giá trị checked từ sự kiện
    // Hiển thị nếu như “Giữ giấy tờ” được check. 
    // Check để đánh dấu là đã trả lại giấy tờ tuỳ thân của khách vào/ra.
    if(checkedValue)
    {
      this.isKeepCheck[index] = true;
    }
    else
    {
      this.isKeepCheck[index] = false;
    }

    // Clear StrImg
    const document_return = (this.form.get('groups') as FormArray).at(index).get('document_return');
    document_return.setValue(false);
    this.isShowIconUpload[index] = true;
    this.isShowIconDelete[index] = false
    this.imageDocumentReturnName[index] = this.DEFAULT_DOCUMENT_RETURN_NAME;
  }

  downloadImage(index: number): void {
    const imageUrl = this.imageDocumentReturnName[index];
    if(imageUrl !== this.DEFAULT_DOCUMENT_RETURN_NAME)
    {
      fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => {
        saveAs(blob, imageUrl); // Tên tập tin và loại tập tin
      });
    }
  }

  getImage(rtspLink: string) {

    const payload = {
      rtsp_link: rtspLink
    };
    
    const headers = {
      'Content-Type': 'application/json'
    };

    return this.http.post('http://camerasocket.3sjsc.com:5000/api/capture_image', payload, { headers });
  }

  takePhotoLaneIn(indexFirst: number){
    var numCamera =0;
    this.isHasInformation[indexFirst] = false;
    // Giá trị từ API nhận diện biển số trả về
    var licenseInValue = "17B4-51405";
    

    this.dataLists[indexFirst].listIn.forEach((element, index)  => {
      this.getImage(element.rtsp_link).subscribe((data: any) => {
        if(index == 0)
        {
          // Sau đó, gán URL hình ảnh vào giá trị của FormControl hoặc FormArray
          const overviewFormGroup = (this.form.get('groups') as FormArray).at(indexFirst) as FormGroup;
          const overview_in_img = overviewFormGroup.get('overview_in_img') as FormControl;

          // Gán URL hình ảnh vào FormControl
          this.uploadAPI( "overview_in_img.png", data.image , overview_in_img)
          numCamera++;
        }
        
        if(index == 1)
        {
          // Sau đó, gán URL hình ảnh vào giá trị của FormControl hoặc FormArray
          const identificationFormGroup = (this.form.get('groups') as FormArray).at(indexFirst) as FormGroup;
          const identification_in_img = identificationFormGroup.get('identification_in_img') as FormControl;

          // Gán URL hình ảnh vào FormControl
          this.uploadAPI( "identification_in_img.png", data.image , identification_in_img)

          // Sau đó, gán URL hình ảnh vào giá trị của FormControl hoặc FormArray
          const detail_in_imgFormGroup = (this.form.get('groups') as FormArray).at(indexFirst) as FormGroup;
          const detail_in_img = detail_in_imgFormGroup.get('detail_in_img') as FormControl;

          // Gán URL hình ảnh vào FormControl
          this.uploadAPI( "detail_in_img.png", data.image , detail_in_img)
          numCamera++;
        }

        // Last Index
        if(index == this.dataLists[indexFirst].listOut.length - 1){
          // Kiểm tra xem camera có hoạt động bình thường không
          if(numCamera == 2)
          {
            this.isClickTakePhoto[indexFirst] = true
          }
          else
          {
            this.isClickTakePhoto[indexFirst] = false;
            this.notification.warning(`Camera không hoạt động!`);
            return;
          }
        }
      });
    });

    // Tạo một đối tượng Car mới
    this.createModalCarIn();
    const license_in = (this.form.get('groups') as FormArray).at(indexFirst).get('license_in');
    license_in.setValue(licenseInValue);
  }

  // Function to convert base64 to blob
  dataURItoBlob(base64) {
    var binaryString = window.atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);

    for (var i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return new Blob([bytes], { type: 'image/png' });
  }

   uploadAPI = async ( file_fe: string, dataImg: any,img: FormControl) => {
    // Chuyển dữ liệu URL thành Blob
    var blob = this.dataURItoBlob(dataImg);
    var file = new File([blob], file_fe, {
      type: "image/png",
    });
    // Tạo một đối tượng FormData và thêm các file vào đó
    var formData = new FormData();
    formData.append('files', file, file_fe);
    this._coreService.uploadFile(formData).subscribe((res) => {
      if (res && res.status && res.status == 200) {
        this.notification.success("Chụp ảnh thành công");

        img.setValue(res.data[0].url);
      } else {
        this._configService.loadingSubject.next("false");
        this.notification.warning("Chụp ảnh không thành công");
      }
    }, (err) => {
      this._configService.loadingSubject.next("false");
      this.notification.warning("Chụp ảnh không thành công");
    });
  }

  takePhotoLaneOut = async (indexFirst: number) => {
    var numCamera =0;
    // List car lấy theo thông tin biển số vào
    var infoCar = [];
    // Giá trị từ API nhận diện biển số trả về
    var licenseOutValue = "17B4-51405";
    // Kiểm tra xem có thông tin xe vào trong hệ thống hay không
    this._coreService
    .Get("/inmanagement/licensevalue/" + licenseOutValue)
    .subscribe((res) => {
      if (res.code == "200") {
        infoCar = res.data;
        if(infoCar && infoCar.length == 1)
        {
          this.dataLists[indexFirst].listOut.forEach((element, index) => {
            this.getImage(element.rtsp_link).subscribe((data: any) => {
              if(index == 0)
              {
                // Sau đó, gán URL hình ảnh vào giá trị của FormControl hoặc FormArray
                const overviewFormGroup = (this.form.get('groups') as FormArray).at(indexFirst) as FormGroup;
                const overview_out_img = overviewFormGroup.get('overview_out_img') as FormControl;
                // Gán URL hình ảnh vào FormControl
                this.uploadAPI( "overview_out_img.png", data.image , overview_out_img)

                numCamera++;
              }
              
              if(index == 1)
              {
                // Sau đó, gán URL hình ảnh vào giá trị của FormControl hoặc FormArray
                const identificationFormGroup = (this.form.get('groups') as FormArray).at(indexFirst) as FormGroup;
                const identification_out_img = identificationFormGroup.get('identification_out_img') as FormControl;
              
                // Gán URL hình ảnh vào FormControl
                this.uploadAPI( "identification_out_img.png", data.image , identification_out_img)


                // Sau đó, gán URL hình ảnh vào giá trị của FormControl hoặc FormArray
                const detail_out_imgFormGroup = (this.form.get('groups') as FormArray).at(indexFirst) as FormGroup;
                const detail_out_img = detail_out_imgFormGroup.get('detail_out_img') as FormControl;

                // Gán URL hình ảnh vào FormControl
                this.uploadAPI( "detail_out_img.png", data.image , detail_out_img)
                numCamera++;
              }

              // Last Index
              if(index == this.dataLists[indexFirst].listOut.length - 1){
                  // Kiểm tra xem camera có hoạt động bình thường không
                  if(numCamera == 2)
                  {
                    this.isClickTakePhoto[indexFirst] = true
                  }
                  else
                  {
                    this.isClickTakePhoto[indexFirst] = false;
                    this.notification.warning(`Camera không hoạt động!`);
                    return;
                  }
              }
            });
          });

          // Set giá trị biển số ra
          const license_out = (this.form.get('groups') as FormArray).at(indexFirst).get('license_out');
          license_out.setValue(licenseOutValue);

          // Fill Url info in
          const overview_inout_imgFormGroup = (this.form.get('groups') as FormArray).at(indexFirst) as FormGroup;
          const overview_inout_img = overview_inout_imgFormGroup.get('overview_inout_img') as FormControl;
          const identification_inout_imgFormGroup = (this.form.get('groups') as FormArray).at(indexFirst) as FormGroup;
          const identification_inout_img = identification_inout_imgFormGroup.get('identification_inout_img') as FormControl;
          const detail_inout_imgFormGroup = (this.form.get('groups') as FormArray).at(indexFirst) as FormGroup;
          const detail_inout_img = detail_inout_imgFormGroup.get('detail_inout_img') as FormControl;
          overview_inout_img.setValue(infoCar[0].overview_in_img);
          identification_inout_img.setValue(infoCar[0].identification_in_img);
          detail_inout_img.setValue(infoCar[0].detail_in_img);
        
          // Tạo một đối tượng Car mới
          this.createModalCarOut();
          // Set giá trị biển số vào
          this.licenseinout[indexFirst] = infoCar[0].license_in;
          // TH Đúng thông tin
          this.isCorrect[indexFirst] = true;
          this.isIncorrect[indexFirst] = false;
          this.isHasInformation[indexFirst] = true;
        }
        else
        {
          // Những TH sai: 
          // Xe ra không có thông tin trong CSDL
          // Hiển thị text biển số xe được nhận diện.
          this.licenseinout[indexFirst] = '';
          this.isCorrect[indexFirst] = false;
          this.isIncorrect[indexFirst] = true;
          this.isHasInformation[indexFirst] = false;
        }
      }
    });
  }

  createModalCarIn(){
    // Tạo một đối tượng Car mới
    this.infoCarIn = {
      id: '',
      license_no: '17B4-51405',
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
      license_no: '17B4-51405',
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
}
