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
  QuickToolbar
} from "@syncfusion/ej2-richtexteditor";
RichTextEditor.Inject(Toolbar, Table, Image, Link, HtmlEditor, QuickToolbar);
import { CoreService } from "src/app/_services/core.service";
import { CarService } from "src/app/_services/car.service";
import { ConfigService } from "src/app/_services/config.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Query, Predicate } from "@syncfusion/ej2-data";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import * as async from "async";
import * as _ from "lodash";
 import { Car } from "src/app/_models/masterdata/Car";

setCulture("vi");
@Component({
  selector: "app-car-edit",
  templateUrl: "./car-edit.component.html",
  styleUrls: ["./car-edit.component.scss"],
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class CarEditComponent implements OnInit  {
  // Varriable Language
  flagState = "";
  public avatar = "/assets/images/addPicture_Vehicle.png";
  public avatar_back = "/assets/images/addPicture_Vehicle.png";
  model: Car = new Car();
  languages: any;
  selectedLanguage: any;
  editForm: FormGroup;
  lstLicenseTypes = [];
  lstVehicles = [];
  lstRangeOfVehicles= [];
  lstCarOwners= [];
  // vi tri focus
  public query = new Query();
  public fields: FieldSettingsModel = { text: "name", value: "id" };
  // Toolbar Item
  public toolbar: ToolbarInterface[];
  @ViewChild("contentFull", { static: false })
  // public isCameraOn = false;
  public captureButtonText = 'Chụp ảnh';
  WIDTH = 640;
  HEIGHT = 480;
  @ViewChild("video", { static: true })
  public video: ElementRef;
  @ViewChild("video_back", { static: true })
  public video_back: ElementRef;
  @ViewChild("canvas", { static: true })
  public canvas: ElementRef;
  @ViewChild("canvas_back", { static: true })
  public canvas_back: ElementRef;

  // Camera: phía trước 
  captures: string[] = [];
  error: any = null;
  isCaptured: boolean;
  isCameraOn: boolean;
  src_avatar: string;
  isUpload:boolean;
  // Camera: phía sau : back 
  captures_back: string[] = [];
  isCaptured_back: boolean;
  isCameraOn_back: boolean;
  src_avatar_back: string;
  isUpload_back:boolean;
  isError: boolean = false;
  public contentFull: RichTextEditorComponent;
  paramId: any;
  username: string;
  oldValue: number;

  /**npm run
   * Constructor
   *
   */
  constructor(
    private _coreService: CoreService,
    private _carService: CarService,
    private notification: Notification,
    private globals: Globals,
    public configs: Configs,
    public router: Router,
    private _formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    private _translateService: TranslateService,
    private _configService: ConfigService,
    private _tlaTranslationLoaderService: TranslationLoaderService,
    private el: ElementRef,

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
      license_no: [
        "",
        [
          Validators.required,
          Validators.maxLength(255),
          this.globals.noWhitespaceValidator,
        ],
      ],
      license_type: ["", Validators.required],
      vehicle: ["", Validators.required],
      range_of_vehicle: ["", Validators.required],
      color: [""],
      car_owner: [""],
      note: [""],
      is_open_automatically: [""],
      frontphoto_url: [""],
      backphoto_url: [""]
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
    this.getLicenseTypeComboBoxData(); // Danh mục loại biển
    this.getVehicleComboBoxData(); // Danh mục Phương tiện
    this.getRangeOfVehicleComboBoxData(); // Danh mục Loại xe
    // this.getCarOwnerComboBoxData(); // Danh mục chủ xe
    
    this.error  = null;
    this.isError = false;
    this.isCameraOn  = false;
    this.isCaptured  = false; 
    // Build toolbar
    async.waterfall(
      [
        (cb) => {
          if (this.flagState != "new") {
            this._carService
              .getprimaryKey(this.paramId)
              .subscribe((res) => {
                if (res.code == "200") {
                   this.model = res.data;
                   //Ảnh phía trước
                   this.avatar = this.model.frontphoto_url;
                   this.src_avatar = this.model.frontphoto_url;
                   localStorage.setItem('avatar', this.avatar);
                   //Ảnh phía sau
                   this.avatar_back = this.model.backphoto_url;
                   this.src_avatar_back= this.model.backphoto_url;
                   localStorage.setItem('avatar_back', this.avatar_back);
                   this.error  = null;
                   this.isError = false;
                   this.isCameraOn  = false;
                   this.isCaptured  = false; 
                   // Set data before
                   this.oldValue = this.model.range_of_vehicle;
                   cb();
                }
              });
          } else {
            // Ảnh phía trước
            this.avatar = localStorage.getItem('avatar') == 'null' ? "/assets/images/addPicture_Vehicle.png": localStorage.getItem('avatar');
            this.model.frontphoto_url = this.avatar ;
            localStorage.setItem('avatar', this.avatar);
            //Ảnh phía sau
            this.avatar_back = localStorage.getItem('avatar_back') == 'null' ? "/assets/images/addPicture_Vehicle.png": localStorage.getItem('avatar_back');
            this.model.backphoto_url = this.avatar_back ;
            localStorage.setItem('avatar_back', this.avatar_back);
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
    setTimeout(() => {
      this.captureButtonText ="Chụp ảnh";
      this.isUpload = false;
      this.setupDevices();
    }, 5);
    
    let capturedPhoto_back  = <HTMLImageElement>document.getElementById("captured-photo_back");
    capturedPhoto_back.style.display = "none";
  }

  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Phía trước
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        if (stream) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
          this.isError = false;
        } else {
          this.error = "You have no output video device";
          this.isError = true;
          this.show_capture_default();
          this.show_capture_back_default();
        }
      } catch (e) {
        this.error = e;
        this.isError = true;
      }
    }
  }

  drawImageToCanvas(image: any) {
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  }

  // Phía trước
  show_capture_default() {
    // this.origin_img = true;
    this.src_avatar = "/assets/images/addPicture_Vehicle.png";
    this.isCaptured = true;
    let capturedPhoto  = <HTMLImageElement>document.getElementById("captured-photo");
    capturedPhoto.style.display = "block";
    this.error = "Không thể kết nối đến camera!";
    this.isError = true;
  }

  async capture() {
    if (this.isError)
    {
      alert("Không thể kết nối đến camera!");
    } else 
    {
      if (!this.isCameraOn) {
        this.isCameraOn = true;
        this.isCaptured = false;
        await this.startCamera();
        let capturedPhoto  = <HTMLImageElement>document.getElementById("captured-photo");
        capturedPhoto.style.display = "none";
    } else {
      this.isCameraOn = false;
      await this.capturePhoto();
      this.isCaptured = true;
      this.src_avatar ="";
      }
      this.error = null;
      this.isError = false;
    }
  }

  async startCamera() {
    let cameraPreview  = <HTMLVideoElement> document.getElementById("camera-preview")
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            cameraPreview.srcObject = stream;
            cameraPreview.play();
            cameraPreview.style.display = "block";
            this.error = null;
            this.isError = false;
        })
        .catch(function (error) {
            // alert("Không thể kết nối đến camera!");
        });
  }
  async capturePhoto() {
    let cameraPreview = <HTMLVideoElement> document.getElementById("camera-preview")
      const canvas: HTMLCanvasElement = document.createElement("canvas");
      canvas.width = cameraPreview.videoWidth;
      canvas.height = cameraPreview.videoHeight;
      const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
    if (context) {
      context.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);
      let capturedPhoto  = <HTMLImageElement>document.getElementById("captured-photo");
      // Hiển thị ảnh đã chụp
      cameraPreview.style.display = "none";
      capturedPhoto.style.display = "block";
      // Chuyển canvas thành dữ liệu URL
      var dataUrl = canvas.toDataURL('image/png');
      capturedPhoto.src = dataUrl == "data:," ? "/assets/images/addPicture_Vehicle.png": dataUrl;
      // Chuyển dữ liệu URL thành Blob
      var blob = this.dataURLtoBlob(dataUrl);
      // Tạo đối tượng File từ Blob
      let file_fe = "front_end.png";  
      var file = new File([blob], file_fe, {
        type: "image/png",
      });
      // Tạo một đối tượng FormData và thêm các file vào đó
      var formData = new FormData();
      formData.append('files', file, file_fe);
      this.uploadAPI('avatar',formData, true)
      this.isCameraOn = false;
      this.isCaptured = true;
    }
  }

   // Phía sau
   show_capture_back_default() {
    // this.origin_img_back = true;
    this.avatar_back = "/assets/images/addPicture_Vehicle.png";
    this.isCaptured_back = true;

    let capturedPhoto_back  = <HTMLImageElement>document.getElementById("captured-photo_back");
    capturedPhoto_back.style.display = "none";

    this.error = "Không thể kết nối đến camera!";
    this.isError = true;
  }

  async capture_back() {
    if (this.isError)
    {
      alert("Không thể kết nối đến camera!");
    } else 
    {
      if (!this.isCameraOn_back) {
        this.isCameraOn_back = true;
        this.isCaptured_back = false;
        await this.startCamera_back();
        let capturedPhoto_back  = <HTMLImageElement>document.getElementById("captured-photo_back");
        capturedPhoto_back.style.display = "none";
    } else {
      this.isCameraOn_back = false;
      await this.capturePhoto_back();
      this.isCaptured_back = true;
      this.src_avatar_back ="";
      }
      this.error = null;
      this.isError = false;
    }
  }

  async startCamera_back() {
    let cameraPreview_back  = <HTMLVideoElement> document.getElementById("camera-preview_back")
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            cameraPreview_back.srcObject = stream;
            cameraPreview_back.play();
            cameraPreview_back.style.display = "block";
        })
        .catch(function (error) {
          alert("Không thể kết nối đến camera!");
          this.error = "You have no output video device";
          this.isError = true;
        });
  }

  async capturePhoto_back() {
    let cameraPreview_back = <HTMLVideoElement> document.getElementById("camera-preview_back")
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = cameraPreview_back.videoWidth;
    canvas.height = cameraPreview_back.videoHeight;
    const context: CanvasRenderingContext2D = canvas.getContext("2d")!;
    if (context) {
      context.drawImage(cameraPreview_back, 0, 0, canvas.width, canvas.height);
      let capturedPhoto_back  = <HTMLImageElement>document.getElementById("captured-photo_back");
      // Hiển thị ảnh đã chụp
      cameraPreview_back.style.display = "none";
      capturedPhoto_back.style.display = "block";
      // Chuyển canvas thành dữ liệu URL
      var dataUrl = canvas.toDataURL('image/png');
      capturedPhoto_back.src = dataUrl == "data:," ? "/assets/images/addPicture_Vehicle.png": dataUrl;
      // Chuyển dữ liệu URL thành Blob
      var blob = this.dataURLtoBlob(dataUrl);
      // Tạo đối tượng File từ Blob
      let file_be = "back_end.png"  
      var file = new File([blob], file_be, {
        type: "image/png",
      });
      // Tạo một đối tượng FormData và thêm các file vào đó
      var formData = new FormData();
      formData.append('files', file, file_be);
      this.uploadAPI('avatar_back',formData, true)
      this.isCameraOn_back = false;
      this.isCaptured_back = true;
    }
  }

  dataURLtoBlob(dataURL) {
    var arr = dataURL.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  setPhoto(key: string) {
    const canvas: any = document.getElementById('canvas');
    let img = canvas.toDataURL('image/png');
    this.src_avatar = img;
    setTimeout(() => {
      this.captureButtonText ="Chụp ảnh";
      this.isCaptured = false;  

    }, 100);

  }

  uploadFile(key: string)
  {
    let data = new FormData();
    data.append("files", this.src_avatar);
    
    this._coreService.UploadFileImg(data).subscribe((res) => {
      if (res && res.status && res.status == 200) {
        this.notification.warning("Tải ảnh không thành công");
        // Ảnh phía trước
        if (key == 'avatar')
        {
          this.avatar = res.data[0].url;
          localStorage.setItem('avatar', this.avatar);
          this.model.frontphoto_url = this.avatar ;
          localStorage.setItem('avatar_back', this.avatar_back);
        } else {
          // Ảnh phía sau
          this.avatar_back = res.data[0].url;
          localStorage.setItem('avatar_back', this.avatar_back);
          this.model.backphoto_url = this.avatar_back;
          localStorage.setItem('avatar', this.avatar);
        }
        this._configService.loadingSubject.next("false");
        this.notification.success("Tải ảnh thành công");
      } else {
        this._configService.loadingSubject.next("false");
      }
    }, (err) => {
      this._configService.loadingSubject.next("false");
      this.notification.warning("Tải ảnh không thành công");
    });
  }

  getLicenseTypeComboBoxData = () => {
      async.parallel([(cb) => {
        this._coreService
          .Get("/dropdown/licensetype")
          .subscribe((res) => {
            if (res.code == "200") {
              this.lstLicenseTypes = res.data;
              return cb();
            }
          }, (err) => {
            return cb();
          });
      }], (err, result) => {
      })
  }

  getVehicleComboBoxData = () => {
      async.parallel([(cb) => {
        this._coreService
          .Get("/dropdown/vehicle")
          .subscribe((res) => {
            if (res.code == "200") {
              this.lstVehicles = res.data;
              return cb();
            }
          }, (err) => {
            return cb();
          });
      }], (err, result) => {
      })
  }

  getRangeOfVehicleComboBoxData = () => {
      async.parallel([(cb) => {
        this._coreService
          .Get("/dropdown/rangeofvehicle")
          .subscribe((res) => {
            if (res.code == "200") {
              this.lstRangeOfVehicles = res.data;
              return cb();
            }
          }, (err) => {
            return cb();
          });
      }], (err, result) => {
      })
  }

  getCarOwnerComboBoxData = () => {
    async.parallel([(cb) => {
      this._coreService
        .Get("/dropdown/inforleavingbyCar/" + this.model.range_of_vehicle)
        .subscribe((res) => {
          if (res.code == "200") {
            this.lstCarOwners = res.data;
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
          this._carService.create(modelRequest).subscribe(
            (res) => {
              localStorage.setItem('avatar', null);
              if (res && res.code == "200") {
                this.notification.success("Cập nhật thành công!");
                this.router.navigate(["/cms/masterdata/car"]);
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
          this._carService.update(modelRequest).subscribe(
            (res) => {
              localStorage.setItem('avatar', null);
              if (res && res.code == "200") {
                this.notification.success("Cập nhật thành công!");
                this.router.navigate(["/cms/masterdata/car"]);
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

  uploadAvatar(key: string,files: FileList) {
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
              let x: any = key == 'avatar' ?  document.getElementById("avatar") : document.getElementById("avatar_back") ;
              x.value = null;
              return;
            }
          }
          let data = new FormData();
          data.append("files", files[0]);
          this.uploadAPI(key,data,false);
        }
      }, 1);
  }

  uploadAPI = (key: string, data: FormData, isCapture: boolean) => {
    this._coreService.uploadFile(data).subscribe((res) => {
      if (res && res.status && res.status == 200) {
        this.notification.success("Tải ảnh thành công");
        // Ảnh phía trước
        if (key == 'avatar')
        {
          let capturedPhoto  = <HTMLImageElement>document.getElementById("captured-photo");
          capturedPhoto.style.display = "block";
          let errorimg  = <HTMLImageElement>document.getElementById("error-img");
          if (errorimg != null) errorimg.style.display = "none";
          let originimg  = <HTMLImageElement>document.getElementById("origin-img");
          if (originimg != null) originimg.style.display = "none";
          if(isCapture){
            capturedPhoto.src = res.data[0].url;
          } else {
            this.src_avatar = res.data[0].url;
          }  
          this.avatar = res.data[0].url;
          localStorage.setItem('avatar', this.avatar);
          this.model.frontphoto_url = this.avatar ;
          localStorage.setItem('avatar_back', this.avatar_back);  

        } else {
          // Ảnh phía sau
          let capturedPhoto_back  = <HTMLImageElement>document.getElementById("captured-photo_back");
            capturedPhoto_back.style.display = "block";
            let errorimgback  = <HTMLImageElement>document.getElementById("error-img_back");
            if (errorimgback != null) errorimgback.style.display = "none";
            let originimgback  = <HTMLImageElement>document.getElementById("origin-img_back");
            if (originimgback != null) originimgback.style.display = "none";
          if(isCapture){
            
            capturedPhoto_back.src = res.data[0].url;
          } else {
            this.src_avatar_back = res.data[0].url;
          }
          this.avatar_back = res.data[0].url;
          localStorage.setItem('avatar_back', this.avatar_back);
          this.model.backphoto_url = this.avatar_back;
          localStorage.setItem('avatar', this.avatar);
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

  // xóa avatar
  removeImage = (model) => {
    this.model[model] = "";
    if (model == 'avatar') {
      this.avatar = "/assets/images/addPicture_Vehicle.png";
      let capturedPhoto  = <HTMLImageElement>document.getElementById("captured-photo");
      let originImg  = <HTMLImageElement>document.getElementById("origin-img");
      capturedPhoto.style.display = "none";
      originImg.style.display = "block";
      this.isCameraOn = false;
      this.isCaptured = false;
      originImg.src = this.avatar;
      localStorage.setItem('avatar', this.avatar);
    } else {
      this.avatar_back = "";
      localStorage.setItem('avatar_back', this.avatar_back);
    }
  };

  prepareModelBeforeSave = () => {
    let objAPI = Object.assign({}, this.model);
    
    objAPI.frontphoto_url = this.avatar;
    objAPI.backphoto_url = this.avatar_back;

    Object.keys(objAPI).map(
      (k) =>
      (objAPI[k] =
        typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );
    return objAPI;
  };

  back = () => {
    localStorage.setItem('avatar', null);
    localStorage.setItem('avatar_back', null);
    this.router.navigate(["/cms/masterdata/car"]);
  }
  
  // filter status
  public onFiltering(e, lst) {
    e.preventDefaultProvince = true;
    const predicate = new Predicate("name", "contains", e.text, true, true);
    this.query = new Query();
    this.query = e.text !== "" ? this.query.where(predicate) : this.query;
    e.updateData(lst, this.query);
  }

  onChangeRangeOfVehicle(newValue: number){
    if (newValue !== this.oldValue){
      this.model.range_of_vehicle == 38 ? this.model.is_open_automatically = true : this.model.is_open_automatically = false;
      // Set data for oldValue
      this.oldValue = newValue
      this.getCarOwnerComboBoxData();
    }

    if(!(this.model.range_of_vehicle && this.model.range_of_vehicle !== undefined))
    {
      this.model.car_owner = "";
      this.lstCarOwners = [];
    }
  }
}
  