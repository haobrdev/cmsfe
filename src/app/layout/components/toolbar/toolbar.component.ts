import { Component, ViewEncapsulation } from "@angular/core";
import { AuthService } from "src/app/common/auth.service";
import { Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CoreService } from "src/app/_services/core.service";
import { Globals } from "src/app/common/globals";
import { ModalService } from "src/app/_services/modal.service";
import { Notification } from "src/app/common/notification";
import * as $ from "jquery";
import * as async from "async";
import { NavigationService } from "src/app/_services/navigation.service";
import * as _ from 'lodash';

@Component({
  selector: "app-toolbar",
  templateUrl: "./toolbar.component.html",
  styleUrls: ["./toolbar.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ToolbarComponent {
  navigation: any;
  subNavigation: any;
  _router: any;

  username = "";
  position = "";
  profileId: any;
  avatar: any;
  //eye
  tooglePassWord1 = false;
  tooglePassWord2 = false;
  tooglePassWord3 = false;
  passwordForm: FormGroup;
  model: ChangePassword = new ChangePassword();
  confirmFlag = false;
  flagOldPassword = false;

  // biến hoàn thểm --start
  isShowModalRePassWord = true;
  // end

  /**
   * Constructor
   */
  constructor(
    private _authService: AuthService,
    private router: Router,
    private _coreService: CoreService,
    private modalService: ModalService,
    private globals: Globals,
    private _formBuilder: FormBuilder,
    private navigationService: NavigationService,
    private notification: Notification
  ) {
    this._router = router;
    let isAdmin: any = localStorage.getItem('isAdmin');
    let navigations = this.navigationService.getCurrentNavigation();
    let mainNavigation = [];
    let username: any = localStorage.getItem("username");
    for (let i = 0; i < navigations.length; i++) {
      mainNavigation.push(navigations[i]);
    }

    // Change Password Form
    this.passwordForm = _formBuilder.group({
      ip_address: [""],
      channel_code: [],
      username: [""],
      old_password: [
        "",
        [
          Validators.required,
          this.globals.noWhitespaceValidator,
          Validators.maxLength(255),
        ],
      ],
      new_password: [
        "",
        [
          Validators.required,
          this.globals.noWhitespaceValidator,
          Validators.maxLength(255),
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      confirmPassword: [
        "",
        [
          Validators.required,
          this.globals.noWhitespaceValidator,
          Validators.maxLength(255), 
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
    });
  }
  ngOnInit(): void {
    this.profileId = Number(localStorage.getItem("id"));
    this.getProfile();

    let index = _.findIndex(this.navigation, (item) => {
      return this._router.url.indexOf(item.url) === 0;
    });

    if (index > -1) {
      if (this.navigation[index].type === "group") {
        this.showSubNavigation(this.navigation[index]);
      }
    }
  }

  checkContainParent = (function_code) => {
    let permissions = localStorage.getItem('permissions');

    permissions = JSON.parse(permissions);
    let lstFunctionCodes = _.map(permissions, 'function_code');

    var index = _.findIndex(lstFunctionCodes, (item) => {
      return item.indexOf(function_code) > -1;
    });

    if (index > -1) {
      return true;
    } else {
      return false;
    }
  }

  showSubNavigation = (item: any) => {
    this.subNavigation = item.children;
  }

  getProfile = () => {
    async.parallel(
      [
        (cb) => {
          this._coreService
            .Get("/auth/adminGetUserInfo")
            .subscribe((res) => {
              this.model = res && res.data && res.code == "200" ? res.data : this.model;
              this.avatar = res.data.avatar ? res.data.avatar : "/assets/images/avatar.jpg";
              this.username = res && res.data && res.data.full_name ? res.data.full_name : "Admin";
              this.position = res && res.data && res.data.title_name ? res.data.title_name : "Quản trị viên";
            });
        },
      ],
      (err, result) => { }
    );
  };
  // Show profile
  showProfile = (): void => {
    this.router.navigate(["/cms/profile"]);
  };

  // Sign Out App
  signOut = (): void => {
    this._authService.logout();
  };
  // Change Password
  changePassword = () => {
    this.isShowModalRePassWord=true;
    this.modalService.open("open-change-pasword");
    // Reset form khi chọn nút X ở Modal
    $(".btn-remove").click(() => {
      this.passwordForm.reset();
    });
  };
  checkPass = () => {
    if (this.model.new_password == this.model.confirmPassword) {
      this.passwordForm.get("confirmPassword").setErrors({ incorrect: true });
      return;
    }
  };

  // set default validate khi thay doi
  changeOldPass() {
    this.flagOldPassword = false;
    this.confirmFlag = false;
  }
  // Xác nhận đổi mật khẩu or không đổi mật khẩu
  confirmChoose(status) {
    if (status == "cancel") {
      // Reset trạng thái của mắt
      this.tooglePassWord3 = false;
      this.tooglePassWord2 = false;
      this.tooglePassWord1 = false;
      this.flagOldPassword = false;
      // Bỏ check không trùng mật khẩu
      this.confirmFlag = false;
      // Reset Form
      this.passwordForm.reset();
      this.modalService.close("open-change-pasword");
    } else {
      if (!this.passwordForm.valid) {
        this.passwordForm.markAsUntouched();
        this.passwordForm.markAsPristine();
        this.passwordForm.markAllAsTouched();
      } else {
        if (this.model.new_password !== this.model.confirmPassword) {
          this.confirmFlag = true;
        } else {
          this.saveData();
        }
      }
    }
  }
  // Lưu dữ liệu
  saveData() {
    this.model.username = localStorage.getItem("username");
    setTimeout(() => {
      this._coreService.Post("/auth/adminChangePass", this.model).subscribe(
        (res: any) => {
          if (res && res.code == "200") {
            this.notification.success("Đổi mật khẩu thành công!");
            this.modalService.close("open-change-pasword");
            this.signOut();

          } else {
            this.notification.warning("notify." + res.error);
          }
        },
        (error) => {
          // Lỗi mạng
          if (error.code !== "200") {
            this.notification.warning("Đổi mật khẩu thất bại!");
          }
        }
      );
    }, 200);
  }

  returnDashboard = () => {
    this.router.navigate(["/cms/dashboard"]);
  }
}

export class ChangePassword {
  username?: string;
  old_password?: string;
  password?: string;
  confirmPassword?: string;
  new_password?: string
}
