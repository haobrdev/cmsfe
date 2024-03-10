import { Component, ElementRef, OnInit, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup,  Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { LoginInterface } from "./login.interface";
import { AuthService } from "../../common/auth.service";
import { Notification } from "../../common/notification";
import { Globals } from "../../common/globals";
import { ConfigService } from "src/app/_services/config.service";
import { ModalService } from 'src/app/_services/modal.service';
import { CoreService } from 'src/app/_services/core.service';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  model: LoginInterface = new LoginInterface();

  showPassword = false;
  profileData: any;
  modelConfirmPassword: any;
  modelPassword: any;
  constructor(
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _notification: Notification,
    private _configService: ConfigService,
    private el: ElementRef,
    private router: Router,
    private globals: Globals,
    private modalService: ModalService,
    private _coreService: CoreService,
  ) {
    this._configService._configSubject.next("false");
    this.loginForm = this._formBuilder.group({
      username: [
        "",
        [
          Validators.required,
          this.globals.noWhitespaceValidator,
          Validators.maxLength(20)
        ]
      ],
      password: [
        "",
        [
          Validators.required,
          this.globals.noWhitespaceValidator,
          Validators.maxLength(20)
        ]
      ]
    });
  }
  
  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    const isAuthen = this._authService.isAuthenticate();
    if (isAuthen) {
      this.router.navigate(["/cms/dashboard"]);
    }
    //this.router.navigate(["/cms/dashboard"]);
  }

  // SignIn
  signIn = (): void => {
    this.model = this.loginForm.value;
    if (this.loginForm.valid) {
      this._authService
        .signin(this.model.username, this.model.password)
        .subscribe(
          res => {
            if (res.code == "200") {
              // Lưu token
              this._authService.saveToken(
                res.data.token,
                this.model.username,
                res.data.user_id ? res.data.user_id : null,
                res.data.user_permissions ? JSON.stringify(res.data.user_permissions) : null,
                res.data.is_sysadmin ? "1" : "0"
              );
              this.profileData = res.data;
              if (this.profileData) {
                this._configService.loadingSubject.next("false");
                this._notification.success("Đăng nhập thành công!");
                this.router.navigate(["/cms/dashboard"]);
              } else {
                this._configService.loadingSubject.next("false");
              }
            }
            else if (res.code !== "200") {
              if (res.error =="ERROR_USER_LOCKED")
              {
                this._notification.error("notify." + res.error);

              } else {
                this._notification.warning("notify." + res.error);
            }
            }
          },
          error => {
            if (error.status == 500) {
              this._notification.error(
                error,
                null,
                "Lỗi kết nỗi với server!"
              );
            } else {
              this._notification.warning(
                "Tên đăng nhập và mật khẩu không đúng. Vui lòng kiểm tra lại!"
              );
            }
          }
        );
    } else {
      this.loginForm.markAllAsTouched();
      for (const key of Object.keys(this.loginForm.controls)) {
        if (this.loginForm.controls[key].invalid) {
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
    }
  };

  // enter signin
  enterSignIn = (e: any): void => {
    setTimeout(() => {
      if (
        e.keyCode === 13 && this.model.username && this.model.password &&
        this.model.username.length > 0 &&
        this.model.password.length > 0
      ) {
        this.signIn();
      }
    }, 0);
  };
}
