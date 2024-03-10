import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  OnDestroy,
  ViewEncapsulation,
  Output,
  EventEmitter,
} from "@angular/core";
import { Subject } from "rxjs";
import { ModalService } from "src/app/_services/modal.service";
import {
  FilterService,
  GridComponent,
  VirtualScrollService,
} from "@syncfusion/ej2-angular-grids";

import { L10n } from "@syncfusion/ej2-base";
import * as _ from "lodash";
import * as async from "async";
import { CoreService } from "src/app/_services/core.service";
import { AccompanyingpersonmanageService } from "src/app/_services/accompanyingpersonmanage.service";
import { ConfigService } from "src/app/_services/config.service";
import { ToolbarItem, ToolbarInterface } from "src/app/_models/index";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Globals } from "src/app/common/globals";
import { Configs } from "src/app/common/configs";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import { AccompanyingPersonManage } from "src/app/_models/business/AccompanyingPersonManage";
import { Notification } from "src/app/common/notification";

@Component({
  selector: "accompanying-person-manage-modals",
  styleUrls: ["./accompanying-person-manage-modals.component.scss"],
  templateUrl: "./accompanying-person-manage-modals.component.html",
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class AccompanyingpersonmanageModalComponent
  implements OnInit, OnDestroy
{
  @Input() id: string;
  private element: any;
  flagState = "";
  flagStateItem = "new";
  public isDisable = false; 

  // Toolbar Item
  public toolbar: ToolbarInterface[];
  public toolbar2: ToolbarInterface[];
  public selectItem = null;
  public idClick = null;
  public modelDelete;

  isShow = false;
  editForm: FormGroup;
  model: AccompanyingPersonManage = new AccompanyingPersonManage();
  listAccompanyingPersonManage: Array<AccompanyingPersonManage>;
  public modelAdd: any;
  public fields: FieldSettingsModel = { text: "name", value: "id" };

  public data: any = [];
  public data_template: any = [];
  public data_delete: any = [];
  public ItemButtonText: string = "Thêm mới" 

  public lstAccompanyingpersonmanage: any = [];
  public lstDocumentType: any = [];
  public documenttypes: string[] = [];
  public lstGenders = [];
  public lstStatus = [];

  isShowDeleteModal: boolean = false;
  public isValidDate: boolean = true;

  //Capture
  public avatar = "/assets/images/addPicture_Vehicle.png";
  public avatar_back = "/assets/images/addPicture_Vehicle.png";
  public captureButtonText = "Chụp ảnh";

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
  isUpload: boolean;

  // Camera: phía sau : back
  captures_back: string[] = [];
  isCaptured_back: boolean;
  isCameraOn_back: boolean;
  src_avatar_back: string;
  isUpload_back: boolean;
  isError: boolean = false;

  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  @Input() dataFromParent: any;

  pageIndex = 0;
  isValue: boolean = false;

  // View child Grid
  @ViewChild("overviewgrid", { static: false })
  public gridInstance: GridComponent;

  constructor(
    private _coreService: CoreService,
    private _accompanyingpersonmanageService: AccompanyingpersonmanageService,
    private modalService: ModalService,
    private el: ElementRef,
    private _formBuilder: FormBuilder,
    private globals: Globals,
    public configs: Configs,
    private notification: Notification,
    private _configService: ConfigService
  ) {
    this.element = el.nativeElement;
    this.data = _accompanyingpersonmanageService;

    this.editForm = this._formBuilder.group({
      gender: [""],
      full_name: ["", [Validators.required]],
      address: [""],
      employee_type: [""],
      job_title: [""],
      department: [""],
      phone_number: [""],
      email: [""],
      document_type: [""],
      document_number: ["", [Validators.required]],
      portrait_photo: [""],
      front_photo: [""],
      back_photo: [""],
      time_in: [""],
      time_out: [""],
      status: [""],
    });

    // Set the private defaults
    L10n.load(this.configs.languageGrid);
  }

  ngOnInit(): void {
    // Build toolbar
    this.getDocumenttypeComboBoxData();
    this.getGenderComboBoxData();
    this.getStatusComboBoxData();
    this.buildToolbar();
    setTimeout(() => {
      this.setDataInModal();
      this.captureButtonText = "Chụp ảnh";
      this.isUpload = false;
      this.setupDevices();

      localStorage.setItem("avatar", "");
      localStorage.setItem("avatar_back", "");
      this.createModel();
      this.model.document_type = "CCCD";
    }, 100);

    this.data_template = [];
    setTimeout(() => {
      this.error = null;
      this.isError = false;
      this.isCameraOn = false;
      this.isCaptured = true;

      this.isCameraOn_back = false;
      this.isCaptured_back = true;
      if (this.dataFromParent[0].listaccompanyingpersonManage != null) {
        this.data_template = this.dataFromParent[0].listaccompanyingpersonManage;
        this.data_delete =[];
        
        this.data_template.forEach(item => {
          item.isNew = item.isNew == null? false: item.isNew;
          item.isChange = item.isChange == null? false: item.isChange;
          item.isDelete = item.isDelete == null? false: item.isDelete;
          item.time_in = this.globals.convertDateStringFull(item.time_in);
          item.time_out = this.globals.convertDateStringFull(item.time_out);
          if (item.isDelete) this.data_delete.push(item);
        });

        let data = this.data_template.filter(x => x.isDelete == false);
        this.data_template = data;

      }
      if(this.flagState !== "view")
      {
        this.model.time_in = this.globals.convertDateStringFull(new Date());
        this.model.time_out = this.globals.convertDateStringFull(new Date());
      }
    }, 200);

    this.modalService.add(this);
  }
  async setupDevices() {
    this.isError = false;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Phía trước
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
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

    let capturedPhoto = <HTMLImageElement>(
      document.getElementById("captured-photo")
    );
    capturedPhoto.style.display = "none";

    let originimg = <HTMLVideoElement>document.getElementById("origin-img");
    if (originimg != null) {
      originimg.style.display = "none";
    }
  }

  async capture() {
    if (this.isError) {
      alert("Không thể kết nối đến camera!");
    } else {
      if (!this.isCameraOn) {
        this.isCameraOn = true;
        this.isCaptured = false;
        await this.startCamera();
        let capturedPhoto = <HTMLImageElement>(
          document.getElementById("captured-photo")
        );
        capturedPhoto.style.display = "none";
      } else {
        this.isCameraOn = false;
        await this.capturePhoto();
        this.isCaptured = true;
        this.src_avatar = "";
      }
      this.error = null;
      this.isError = false;
    }
  }

  async startCamera() {
    let cameraPreview = <HTMLVideoElement>(
      document.getElementById("camera-preview")
    );
    navigator.mediaDevices
      .getUserMedia({ video: true })
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
    let cameraPreview = <HTMLVideoElement>(
      document.getElementById("camera-preview")
    );
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = cameraPreview.videoWidth;
    canvas.height = cameraPreview.videoHeight;
    const context: CanvasRenderingContext2D = canvas.getContext("2d")!;

    if (context) {
      context.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);

      let capturedPhoto = <HTMLImageElement>(
        document.getElementById("captured-photo")
      );
      // Hiển thị ảnh đã chụp
      cameraPreview.style.display = "none";
      capturedPhoto.style.display = "block";

      // Chuyển canvas thành dữ liệu URL
      var dataUrl = canvas.toDataURL("image/png");

      capturedPhoto.src =
        dataUrl == "data:," ? "/assets/images/addPicture_Vehicle.png" : dataUrl;
      // Chuyển dữ liệu URL thành Blob
      var blob = this.dataURLtoBlob(dataUrl);

      // Tạo đối tượng File từ Blob
      let file_fe = "front_end.png";
      var file = new File([blob], file_fe, {
        type: "image/png",
      });
      // Tạo một đối tượng FormData và thêm các file vào đó
      var formData = new FormData();
      formData.append("files", file, file_fe);

      this.uploadAPI("avatar", formData, true);
      this.isCameraOn = false;
      this.isCaptured = true;
    }
  }

  // Phía sau
  show_capture_back_default() {
    this.isCaptured_back = true;
    let capturedPhoto_back = <HTMLImageElement>(
      document.getElementById("captured-photo_back")
    );
    capturedPhoto_back.style.display = "block";
    this.src_avatar_back = "/assets/images/addPicture_Vehicle.png";
  }

  async capture_back() {
    if (this.isError) {
      alert("Không thể kết nối đến camera!");
    } else {
      if (!this.isCameraOn_back) {
        this.isCameraOn_back = true;
        this.isCaptured_back = false;
        await this.startCamera_back();
        let capturedPhoto_back = <HTMLImageElement>(
          document.getElementById("captured-photo_back")
        );
        capturedPhoto_back.style.display = "none";
      } else {
        this.isCameraOn_back = false;
        await this.capturePhoto_back();
        this.isCaptured_back = true;
        this.src_avatar_back = "";
      }
      this.error = null;
      this.isError = false;
    }
  }

  async startCamera_back() {
    let cameraPreview_back = <HTMLVideoElement>(
      document.getElementById("camera-preview_back")
    );
    navigator.mediaDevices
      .getUserMedia({ video: true })
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
    let cameraPreview_back = <HTMLVideoElement>(
      document.getElementById("camera-preview_back")
    );
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = cameraPreview_back.videoWidth;
    canvas.height = cameraPreview_back.videoHeight;
    const context: CanvasRenderingContext2D = canvas.getContext("2d")!;

    if (context) {
      context.drawImage(cameraPreview_back, 0, 0, canvas.width, canvas.height);

      let capturedPhoto_back = <HTMLImageElement>(
        document.getElementById("captured-photo_back")
      );
      // Hiển thị ảnh đã chụp
      cameraPreview_back.style.display = "none";
      capturedPhoto_back.style.display = "block";

      // Chuyển canvas thành dữ liệu URL
      var dataUrl = canvas.toDataURL("image/png");
      capturedPhoto_back.src =
        dataUrl == "data:," ? "/assets/images/addPicture_Vehicle.png" : dataUrl;
      // Chuyển dữ liệu URL thành Blob
      var blob = this.dataURLtoBlob(dataUrl);

      // Tạo đối tượng File từ Blob
      let file_be = "back_end.png";
      var file = new File([blob], file_be, {
        type: "image/png",
      });

      // Tạo một đối tượng FormData và thêm các file vào đó
      var formData = new FormData();
      formData.append("files", file, file_be);
      this.uploadAPI("avatar_back", formData, true);
      this.isCameraOn_back = false;
      this.isCaptured_back = true;
    }
  }

  dataURLtoBlob(dataURL) {
    var arr = dataURL.split(",");
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
    const canvas: any = document.getElementById("canvas");
    let img = canvas.toDataURL("image/png");
    this.src_avatar = img;
    setTimeout(() => {
      this.captureButtonText = "Chụp ảnh";
      this.isCaptured = false;
    }, 100);
  }

  uploadFile(key: string) {
    let data = new FormData();
    data.append("files", this.src_avatar);

    this._coreService.UploadFileImg(data).subscribe(
      (res) => {
        if (res && res.status && res.status == 200) {
          this.notification.warning("Tải ảnh không thành công");
          // Ảnh phía trước
          if (key == "avatar") {
            this.avatar = res.data[0].url;
            localStorage.setItem("avatar", this.avatar);
            //this.model.front_photo = this.avatar;
            localStorage.setItem("avatar_back", this.avatar_back);
          } else {
            // Ảnh phía sau
            this.avatar_back = res.data[0].url;
            localStorage.setItem("avatar_back", this.avatar_back);
            //this.model.back_photo = this.avatar_back;
            localStorage.setItem("avatar", this.avatar);
          }
          this._configService.loadingSubject.next("false");
          this.notification.success("Tải ảnh thành công");
        } else {
          this._configService.loadingSubject.next("false");
        }
      },
      (err) => {
        this._configService.loadingSubject.next("false");
        this.notification.warning("Tải ảnh không thành công");
      }
    );
  }

  uploadAPI = (key: string, data: FormData, isCapture: boolean) => {
    this._coreService.uploadFile(data).subscribe(
      (res) => {
        if (res && res.status && res.status == 200) {
          this.notification.success("Tải ảnh thành công");
          // Ảnh phía trước
          if (key == "avatar") {
            let capturedPhoto = <HTMLImageElement>(
              document.getElementById("captured-photo")
            );
            capturedPhoto.style.display = "block";

            let originimg = <HTMLImageElement>(
              document.getElementById("origin-img")
            );
            if (originimg != null) originimg.style.display = "none";

            if (isCapture) {
              capturedPhoto.src = res.data[0].url;
            } else {
              this.src_avatar = res.data[0].url;
            }

            this.avatar = res.data[0].url;
            localStorage.setItem("avatar", this.avatar);
            //this.model.front_photo = this.avatar;
            localStorage.setItem("avatar_back", this.avatar_back);
          } else {
            // Ảnh phía sau
            let capturedPhoto_back = <HTMLImageElement>(
              document.getElementById("captured-photo_back")
            );
            capturedPhoto_back.style.display = "block";

            let originimgback = <HTMLImageElement>(
              document.getElementById("origin-img_back")
            );
            if (originimgback != null) originimgback.style.display = "none";

            if (isCapture) {
              capturedPhoto_back.src = res.data[0].url;
            } else {
              this.src_avatar_back = res.data[0].url;
            }
            this.avatar_back = res.data[0].url;
            localStorage.setItem("avatar_back", this.avatar_back);
            //this.model.back_photo = this.avatar_back;
            localStorage.setItem("avatar", this.avatar);
          }
          this._configService.loadingSubject.next("false");
        } else {
          this._configService.loadingSubject.next("false");
          this.notification.warning("Tải ảnh không thành công");
        }
      },
      (err) => {
        this._configService.loadingSubject.next("false");
        this.notification.warning("Tải ảnh không thành công");
      }
    );
  };

  // Build Toolbar
  buildToolbar = () => {
    let toolbarList = [];
    toolbarList = [ToolbarItem.ADD];
    this.toolbar = this.globals.buildToolbar(
      "cms_masterdata_client",
      toolbarList
    );

    let toolbarList2 = [];
    toolbarList2 = [ToolbarItem.EDIT, ToolbarItem.DELETE, ToolbarItem.VIEW];
    this.toolbar2 = this.globals.buildToolbar(
      "cms_masterdata_client",
      toolbarList2
    );
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
  };
  
  clickRecord = (data, status) => {
    this.createModel();
    this.idClick = data.id;
    if (this.isDisable) 
    {
      this.flagStateItem = "view";
      this.getPrimaryKey(data.id);
      this.ItemButtonText ="Cập nhật";
      this.editForm.disable();
    } else 
    {
      if (data && status === "view") {
        this.flagStateItem = "view";
        this.getPrimaryKey(data.id);
        this.ItemButtonText ="Cập nhật";
        this.editForm.disable();
      }
      if (data && status === "edit") {
        this.flagStateItem = "edit";
        this.getPrimaryKey(data.id);
        this.ItemButtonText ="Cập nhật";
        this.editForm.enable();
      }
      if (data && status === "delete") {
        this.isShowDeleteModal = true;
        this.modelDelete = data;
        this.modalService.open("confirm-delete-p-one-modal");
      }
    }
  };

  confirmDeleteOne = (status): void => {
    if (status === "cancel") {
      this.modalService.close("confirm-delete-p-one-modal");
    } else {
      // gọi API xóa ở đây
      if (this.modelDelete) {
        if (!this.modelDelete.isNew) this.data_delete.push(this.modelDelete);
        this.listAccompanyingPersonManage = [];
        let data = this.data_template.filter(x => x.id != this.modelDelete.id);
        data.forEach(item => {
          this.listAccompanyingPersonManage.push(item);
        });
        this.convertModelToAny(this.listAccompanyingPersonManage);
      }
      this.modalService.close("confirm-delete-p-one-modal");
    }
  };

  getPrimaryKey = (paramId: any): void => {
    let result   =  this.data_template.filter(x => x.id == paramId)[0];
    if (result != null)
    {
      let  data = Object.assign({}, result);
      this.model =data;
      let  item  =  this.lstDocumentType.filter(x => x.id == this.model.document_type)[0];
      this.model.document_type = item != null ?  item.name : "CCCD";
      //Ảnh phía trước
      //this.avatar = this.model.front_photo == "" ? "/assets/images/addPicture_Vehicle.png": this.model.front_photo ;
      localStorage.setItem('avatar', this.avatar);
      //Ảnh phía sau
      //this.avatar_back = this.model.back_photo =="" ? "/assets/images/addPicture_Vehicle.png": this.model.back_photo ;
      localStorage.setItem('avatar_back', this.avatar_back);
      this.error  = null;
      this.isError = false;
      this.isCameraOn  = false;
      this.isCaptured  = true; 
      this.isCameraOn_back  = false;
      this.isCaptured_back  = true; 
    }
  };

  getListData = (): void => {
    const state = { take: 1000, skip: 0 };
    let extraParams = [];

    extraParams.push({
      field: "infoinout_id",
      value: this.dataFromParent[0].infoinout_id,
    });

    const url = "/accompanyingpersonmanage/list";
    this._accompanyingpersonmanageService
      .getall(state, "/accompanyingpersonmanage/list", extraParams)
      .subscribe((res) => {
        this.data = res;
      });
  };

  getStatusComboBoxData = () => {
    async.parallel([
      (cb) => {
        this._coreService
          .Get("/dropdown/otherListByCode/status_in_and_out")
          .subscribe(
            (res) => {
              if (res.code == "200") {
                this.lstStatus = res.data;
                setTimeout(() => {
                  if(this.lstStatus[0] && this.lstStatus[0] !== undefined && this.flagState !== "view")
                  {
                    this.model.status = this.lstStatus[0].id;
                  }
                }, 200);
                return cb();
              }
            },
            (err) => {
              return cb();
            }
          );
      },
    ]);
  };

  getGenderComboBoxData = () => {
    async.parallel([
      (cb) => {
        this._coreService.Get("/dropdown/otherListByCode/gender").subscribe(
          (res) => {
            if (res.code == "200") {
              this.lstGenders = res.data;
              return cb();
            }
          },
          (err) => {
            return cb();
          }
        );
      },
    ]);
  };

  getDocumenttypeComboBoxData = () => {
    async.parallel([
      (cb) => {
        this._coreService.Get("/dropdown/documenttype/document_type").subscribe(
          (res) => {
            if (res.code == "200") {
              this.lstDocumentType = res.data;
              this.documenttypes =[];
              this.lstDocumentType.forEach((element) => {
                this.documenttypes.push(element.name);
              });
              return cb();
            }
          },
          (err) => {
            return cb();
          }
        );
      },
    ]);
  };

  // Remove self from modal service when component is destroyed
  ngOnDestroy(): void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  // open modal
  open(): void {
    this.element.style.display = "block";
    document.body.classList.add("app-modal-open");

    this.getDocumenttypeComboBoxData();
    this.getGenderComboBoxData();
    this.getStatusComboBoxData();
    this.buildToolbar();
    setTimeout(() => {
      this.setDataInModal();
      this.captureButtonText = "Chụp ảnh";
      this.isUpload = false;
      this.setupDevices();

      localStorage.setItem("avatar", "");
      localStorage.setItem("avatar_back", "");
      this.createModel();
      this.model.document_type = "CCCD";
    }, 100);

    this.data_template = [];
    setTimeout(() => {
      this.error = null;
      this.isError = false;
      this.isCameraOn = false;
      this.isCaptured = true;

      this.isCameraOn_back = false;
      this.isCaptured_back = true;
      if (this.dataFromParent[0].listaccompanyingpersonManage != null) {
        this.data_template = this.dataFromParent[0].listaccompanyingpersonManage;
        
        this.data_delete =[];
        this.data_template.forEach(item => {
          item.isNew = item.isNew == null? false: item.isNew;
          item.isChange = item.isChange == null? false: item.isChange;
          item.isDelete = item.isDelete == null? false: item.isDelete;
          if (item.isDelete) this.data_delete.push(item);
        });

        let data = this.data_template.filter(x => x.isDelete == false);
        this.data_template = data;
      }
      if(this.flagState !== "view")
      {
        this.model.time_in = this.globals.convertDateStringFull(new Date());
        this.model.time_out = this.globals.convertDateStringFull(new Date());
      }
    }, 200);

    this.modalService.add(this);
  }

  // Close modal
  close(): void {
    this.sendDataBack(null);
    this.element.style.display = "none";
    document.body.classList.remove("app-modal-open");
    this.modalService.modalStatus.next({
      id: this.id,
      type: "close",
    });
  }
  backData(): void {
    this.createModel();
    this.editForm.enable();
  }

  createModel() {
    this.model = new AccompanyingPersonManage();
    this.model.id = this._accompanyingpersonmanageService.GetNewGuid();
    this.model.full_name = null;
    this.model.gender = null;
    this.model.address = "";
    this.model.document_type = "CCCD";
    this.model.document_number = null;
    if(this.flagState !== "view")
    {
      this.model.time_in = this.globals.convertDateStringFull(new Date());
      this.model.time_out = this.globals.convertDateStringFull(new Date());
      this.model.status = this.lstStatus[0].id;
    }
    else
    {
      this.model.time_in = "";
      this.model.time_in = "";
      this.model.status = null;
    }
    this.model.infoinout_id = this.dataFromParent[0].infoinout_id;
    this.model.isNew = true;
    this.model.isChange = false;
    this.model.isDelete = false;
    this.flagStateItem = "new";
    this.isValidDate = true;
    this.isError = false;
    this.isCaptured = true;
    this.isCaptured_back = true;
    this.editForm.enable();
    localStorage.setItem("avatar", "");
    localStorage.setItem("avatar_back", "");
    this.show_capture_default();
    this.show_capture_back_default();

    let capturedPhoto = <HTMLImageElement>(
      document.getElementById("captured-photo")
    );
    capturedPhoto.style.display = "block";
    this.src_avatar = "/assets/images/addPicture_Vehicle.png";

    let cameraPreview = <HTMLVideoElement>(
      document.getElementById("camera-preview")
    );
    if (cameraPreview != null) cameraPreview.style.display = "none";

    let originimg = <HTMLVideoElement>document.getElementById("origin-img");
    if (originimg != null) originimg.style.display = "none";

    let capturedPhoto_back = <HTMLImageElement>(
      document.getElementById("captured-photo_back")
    );
    capturedPhoto_back.style.display = "block";
    this.src_avatar_back = "/assets/images/addPicture_Vehicle.png";

    let cameraPreview_back = <HTMLVideoElement>(
      document.getElementById("camera-preview_back")
    );
    if (cameraPreview_back != null) cameraPreview_back.style.display = "none";
    this.ItemButtonText = "Thêm mới";

    if (this.isDisable) 
    {
      this.flagStateItem = "view";
      this.editForm.disable();
    }
  }
  prepareModelBeforeSave = () => {
    let objAPI = Object.assign({}, this.model);

    //objAPI.front_photo = this.avatar;
    //objAPI.back_photo = this.avatar_back;

    let item = this.lstDocumentType.filter(
      (x) => x.name == objAPI.document_type
    )[0];
    objAPI.document_type = item != null ? item.id : "0";

    if (objAPI.time_in != null) {
      objAPI.time_in = this.globals.convertDateStringFull(objAPI.time_in);
    }

    if (objAPI.time_out != null) {
      objAPI.time_out = this.globals.convertDateStringFull(objAPI.time_out);
    }

    Object.keys(objAPI).map(
      (k) =>
        (objAPI[k] =
          typeof objAPI[k] == "string" ? objAPI[k].trim() : objAPI[k])
    );
    return objAPI;
  };

  setDataInModal() {
    this.editForm.reset();
    this.flagState = this.dataFromParent[0].flagState;
    this.isDisable = false;

    this.getListData();

    if (this.flagState == "edit") {
      this.editForm.enable();
    } else if  (this.flagState == "view")
    {
      this.flagStateItem = this.flagState;
      this.isDisable = true;
      this.editForm.disable();
    }
  }

  onDateBlur() {
    this.isValidDate = true;
    setTimeout(() => {
      const startDateString = this.model.time_in
        ? this.model.time_in.toString()
        : "";
      const endDateString = this.model.time_out
        ? this.model.time_out.toString()
        : "";

      const start_date = new Date(startDateString);
      const end_date = new Date(endDateString);
      if (start_date > end_date) {
        this.isValidDate = false;
      }
    }, 100);
  }
 
  convertItemModel() {
    let item = this.lstDocumentType.filter(
      (x) => x.name == this.model.document_type
    )[0];
    if (item != null) {
      this.model.document_type = item.id;
      this.model.document_type_name = item.name;
    } else {
      this.model.document_type = "0";
      this.model.document_type_name = "";
    }
    if (this.model.time_in != null) {
      this.model.time_in = this.globals.convertDateStringFull(
        this.model.time_in
      );
    }
    if (this.model.time_out != null) {
      this.model.time_out = this.globals.convertDateStringFull(
        this.model.time_out
      );
    }
    item = this.lstStatus.filter((x) => x.id == this.model.status)[0];
    this.model.status_name = item != null ? item.name : "";
    //this.model.front_photo = this.avatar;
    //this.model.back_photo = this.avatar_back;
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
      //Create item
      if (this.flagStateItem === "new") {
        this.listAccompanyingPersonManage = [];
        this.convertItemModel();
        this.listAccompanyingPersonManage.push(this.model)
        let data = this.data_template.filter(x => x.id != this.model.id);
        data.forEach(item => {
          item.isNew = item.isNew == null? false: item.isNew;
          item.isChange = item.isChange == null? false: item.isChange;
          item.isDelete = item.isDelete == null? false: item.isDelete;
          this.listAccompanyingPersonManage.push(item);
        });
        this.convertModelToAny(this.listAccompanyingPersonManage);
        this.createModel();
      } else if (this.flagStateItem === "edit") {
        // Update item
        this.listAccompanyingPersonManage = [];
        this.convertItemModel();
        this.model.isChange = true;
        this.listAccompanyingPersonManage.push(this.model);
        let data = this.data_template.filter(x => x.id != this.model.id);
        data.forEach(item => {
          item.isNew = item.isNew == null? false: item.isNew;
          item.isChange = item.isChange == null? false: item.isChange;
          item.isDelete = item.isDelete == null? false: item.isDelete;
          this.listAccompanyingPersonManage.push(item);
        });
        this.convertModelToAny(this.listAccompanyingPersonManage);
        this.createModel();
      }
    }
  }

  convertModelToAny(lst: Array<AccompanyingPersonManage>)
  {
    const newArray = lst
    .map(modal => ({
      id: modal.id, 
      infoinout_id: modal.infoinout_id, 
      full_name: modal.full_name, 
      gender: modal.gender, 
      address: modal.address, 
      document_type: modal.document_type, 
      document_type_name: modal.document_type_name, 
      document_number: modal.document_number, 
      time_in: modal.time_in, 
      time_out: modal.time_out, 
      status: modal.status, 
      status_name: modal.status_name, 
      isNew: modal.isNew != null ? modal.isNew : false, 
      isChange: modal.isChange != null?  modal.isChange: false, 
      isDelete: modal.isDelete  != null ? modal.isDelete : false
    }));

    this.data_template = newArray;
  }

  sendData() {
    this.data = this.data_template;
    this.data_delete.forEach(item => {
      item.isNew =  false;
      item.isChange = false;
      item.isDelete = true;
      this.data.push(item);
    });
    
    this.sendDataBack(this.data);
    this.element.style.display = "none";
    document.body.classList.remove("app-modal-open");
    this.modalService.modalStatus.next({
      id: this.id,
      type: "close",
    });
  }

  closeData() {
    this.editForm.enable();
    this.error = null;
    this.isError = false;
    this.isCameraOn = false;
    this.isCaptured = true;

    this.isCameraOn_back = false;
    this.isCaptured_back = true;
    
    this.createModel();
    this.setupDevices();

    if (this.isDisable)
    {
      this.flagState = "view";
      this.editForm.reset();
      this.editForm.disable();
    } 
  }

  chooseMember() {
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
      this.notification.warning("notify.ADD_EQUIPMENT_ERROR");
      this.editForm.markAllAsTouched();
      return;
    } else {
      this.sendDataBack(this.model);
    }
  }

  sendDataBack(data: any) {
    this.data.index = this.dataFromParent[0].index;
    this.closeModal.emit(data);
  }

  // Format stt (Sort index)
  formatStt = (index: string) => {
    return (
      this.pageIndex * this.gridInstance.pageSettings.pageSize +
      parseInt(index, 0) +
      1
    );
  };

  onActionComplete(args) {
    if(args.currentPage && args.currentPage !== undefined || this.isValue)
    {
      if(args.currentPage && args.currentPage !== undefined && this.isValue)
      {
        this.pageIndex = args.currentPage - 1;
      }
      if(args.rows.length == this.data_template.length)
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
}
