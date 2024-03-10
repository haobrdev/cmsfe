import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  Output,
  EventEmitter,
  HostListener,
  ViewChild
} from "@angular/core";

import { ModalService } from "src/app/_services/modal.service";
import {
  FilterService,
  VirtualScrollService,
} from "@syncfusion/ej2-angular-grids";
import * as _ from 'lodash';
import * as async from "async";
import { CoreService } from "src/app/_services/core.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Globals } from "src/app/common/globals";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import { EquipmentDetail } from "src/app/_models/masterdata/EquipmentDetail";
import { Notification } from "src/app/common/notification";

@Component({
  selector: "add-equipment-modals",
  styleUrls: ["./add-equipment-modals.component.scss"],
  templateUrl: "./add-equipment-modals.component.html",
  providers: [FilterService, VirtualScrollService],
  encapsulation: ViewEncapsulation.None,
})
export class AddEquipmentModalComponent implements OnInit, OnDestroy {
  @Input() id: string;
  private element: any;
  private dataBefore;
  flagState = "";
  flagStateEquipment = "";
  info_lane_type: number;
  lstEquipmentsType = [];
  lstEquipmentsName = [];
  lstLanesType = [];
  lstEquipmentsDetailType = [];
  lstLanesOfVehicleType = [];
  lstDetailEquipments = [];
  isShow = false;
  editForm: FormGroup;
  model: EquipmentDetail = new EquipmentDetail();
  public fields: FieldSettingsModel = { text: "name", value: "id" };

  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  @Input() dataFromParent: any;

  @ViewChild("addButton", { static: false })
  addButtonRef: ElementRef;
  
  constructor(
    private _coreService: CoreService,
    private modalService: ModalService, 
    private el: ElementRef,
    private _formBuilder: FormBuilder,
    private globals: Globals,
    private notification: Notification,
  ) {
    this.element = el.nativeElement;
    this.flagState = modalService.modals[0];
    this.flagStateEquipment = modalService.modals[1];

    this.editForm = this._formBuilder.group({
      equipment_type: [
        "",
        [
          Validators.required,
        ],
      ],
      equipment_id: [
        "",
        [
          Validators.required,
        ],
      ],
      description: [""],
      seri: [""],
      lane_type: [
        "",
        [
          Validators.required,
        ],
      ],
      vehicle_equipment_lane: [
        "",
        [
          Validators.required,
        ],
      ],
      is_prioritize: [""],
      is_active: [""],
      ip: [""],
      ip_port: [""],
      account: [""],
      pass: [""],
      extension: [""],
    });
  }

  ngOnInit(): void {
    // Ensure id attribute exists
    if (!this.id) {
      console.error("modal must have an id");
      return;
    }

    // Move element to bottom of page (just before </body>) so it can be displayed above everything else
    document.body.appendChild(this.element);
    
    // Add self (this modal instance) to the modal service so it's accessible from controllers
    this.modalService.add(this);

    this.model = new EquipmentDetail();
    this.GetEquipmentsType();
    this.GetLaneTypeEquipment();
    this.GetLanesOfVehicleType();
    this.setDataInModal();
  }

  // Remove self from modal service when component is destroyed
  ngOnDestroy(): void {
    this.modalService.remove(this.id);
    this.element.remove();
  }

  // Open modal
  openEquipment(): void {
    this.model = new EquipmentDetail();
    setTimeout(() => {
      this.GetEquipmentsType();
      this.GetLaneTypeEquipment();
      this.GetLanesOfVehicleType();
      this.setDataInModal();
      this.element.style.display = "block";
      document.body.classList.add("app-modal-open");
    }, 100);
  }

  GetEquipmentsType = () => {
    this._coreService
    .Get("/dropdown/otherListByCode/equipment_type")
      .subscribe((res) => {
        if (res.code == "200") {
          this.lstEquipmentsType = res.data;
          this.showAccountAndPass();
        }
      });
  };

  GetEquipmentsName = () => {
    this.lstEquipmentsName = [];
    if(this.model.equipment_type && this.model.equipment_type != undefined)
    {
      this.showAccountAndPass();
      this._coreService
      .Get("/dropdown/equipment/" + this.model.equipment_type)
      .subscribe((res) => {
        if (res.code == "200") {
            this.lstEquipmentsName = res.data;
          }
        });
    }
  };

  showAccountAndPass()
  {
    if(this.lstEquipmentsType && this.lstEquipmentsType.length > 0)
    {
      if(this.model.equipment_type == this.lstEquipmentsType[0].id)
      {
        this.isShow = true;
      }
      else
      {
        this.isShow = false;
      }
    }
  }

  GetDetailEquipments = () => {
    if(this.lstEquipmentsName && this.lstEquipmentsName.length > 0)
    {
      this.model.description = this.lstEquipmentsName.filter(item => item.id == this.model.equipment_id)[0].description;
      this.model.seri = this.lstEquipmentsName.filter(item => item.id == this.model.equipment_id)[0].seri;
    }
  };

  GetLaneTypeEquipment = () => {
    this.lstEquipmentsDetailType = [];
    this._coreService
    .Get("/dropdown/otherListByCode/lane_type")
      .subscribe((res) => {
        if (res.code == "200") {
          this.lstLanesType = res.data;

          if(this.model.lane_type_header && this.model.lane_type_header !== undefined)
          {
            this.changeLaneType(this.model.lane_type_header);
          }
          else
          {
            this.lstEquipmentsDetailType = this.lstLanesType;
          }
        }
      });
  };

  changeLaneType(lane_type_header: number){
    if(this.lstLanesType && this.lstLanesType.length > 0)
    {
      if(lane_type_header == this.lstLanesType[0].id)
      {
        this.lstEquipmentsDetailType = this.lstLanesType.filter(item => item.name == this.lstLanesType[0].name);
      }
      else if(lane_type_header == this.lstLanesType[1].id)
      {
        this.lstEquipmentsDetailType = this.lstLanesType.filter(item => item.name == this.lstLanesType[1].name);
      }
      else
      {
        this.lstEquipmentsDetailType = this.lstLanesType.filter(item => item.name != this.lstLanesType[2].name);
      }

      if(lane_type_header !== 55)
      {
        if(this.model.lane_type !== lane_type_header)
        {
          this.info_lane_type = null;
        }
        else
        {
          this.info_lane_type = this.dataFromParent.lane_type;
        }
      }
      else
      {
        this.info_lane_type = this.dataFromParent.lane_type;
      }
    }
  }

  GetLanesOfVehicleType = () => {
    this._coreService
    .Get("/dropdown/otherListByCode/vehicle_eqiupment_lane")
      .subscribe((res) => {
        if (res.code == "200") {
          this.lstLanesOfVehicleType = res.data;
        }
      });
  };

  // Close modal
  close(): void {
    this.element.style.display = "none";
    document.body.classList.remove("app-modal-open");
    this.modalService.modalStatus.next({
      id: this.id,
      type: "close",
    });

    this.model = this.dataBefore;
    this.dataFromParent = this.dataBefore;
  }

  setDataInModal(){
    this.editForm.reset();
    this.dataBefore = JSON.parse(JSON.stringify(this.dataFromParent));
    if(this.dataBefore.equipment_id && this.dataBefore.equipment_id !== undefined)
    {
      this.dataBefore.equipment_id = this.dataBefore.equipment_id.trim();
    }
    if(this.flagState == 'new')
    {
      if(this.flagStateEquipment == 'add_equipment')
      {
        this.editForm.enable();
        this.model.description = "";
        this.model.seri = "";
        this.model.is_active = true;
        this.model.lane_type_header = this.dataFromParent[0].lane_type_header;
      }
      else if(this.flagStateEquipment == 'edit_equipment')
      {
        this.editForm.enable();
        this.model = this.dataFromParent;
        this.GetEquipmentsName();
        setTimeout(() => {
          this.model.equipment_id = this.dataFromParent.equipment_id.trim();
        }, 100);
      }
      else
      {
        this.editForm.disable();
        this.model = this.dataFromParent;
        this.GetEquipmentsName();
        setTimeout(() => {
          this.model.equipment_id = this.dataFromParent.equipment_id.trim();
        }, 100);
      }
      this.model.is_mode = 'new';
    }
    else if(this.flagState == 'edit'){
      if(this.flagStateEquipment == 'add_equipment')
      {
        this.editForm.enable();
        this.model.description = "";
        this.model.seri = "";
        this.model.is_mode = 'new';
        this.model.is_active = true;
        this.model.lane_type_header = this.dataFromParent[0].lane_type_header;
      }
      else if(this.flagStateEquipment == 'edit_equipment')
      {
        this.editForm.enable();
        this.model = this.dataFromParent;
        this.model.is_mode = 'edit';
        this.GetEquipmentsName();
        setTimeout(() => {
          this.model.equipment_id = this.dataFromParent.equipment_id.trim();
        }, 100);
      }
      else
      {
        this.editForm.disable();
        this.model = this.dataFromParent;
        this.GetEquipmentsName();
        setTimeout(() => {
          this.model.equipment_id = this.dataFromParent.equipment_id.trim();
        }, 100);
      }
    }
    else
    {
      this.editForm.disable();
      this.model = this.dataFromParent;
      this.GetEquipmentsName();
      setTimeout(() => {
        this.model.equipment_id = this.dataFromParent.equipment_id.trim();
      }, 100);
    }
  }

  chooseMember(){
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
      this.model.equipment_name = this.lstEquipmentsName.filter(item => item.id == this.model.equipment_id)[0].name;
      this.model.equipment_typename = this.lstEquipmentsType.filter(item => item.id == this.model.equipment_type)[0].name;
      this.model.lane_name = this.lstEquipmentsDetailType.filter(item => item.id == this.info_lane_type)[0].name;
      this.model.lane_type = this.info_lane_type;
      this.dataBefore = JSON.parse(JSON.stringify(this.dataFromParent));
      var profile = this.model.extension == "" ? "" : "/" + this.model.extension;
      this.model.rtsp_link = "rtsp://" + this.model.account + ":" + this.model.pass + "@" + this.model.ip + ":" + this.model.ip_port + profile;
      this.sendDataBack(this.model);
    }
  }

  sendDataBack(data: any) {
    this.closeModal.emit(data);
    this.close();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.chooseMember();
    }
  }
}
