import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from 'src/app/_services/config.service';
import { Globals } from 'src/app/common/globals';
import { Notification } from "../../common/notification";
import { CoreService } from 'src/app/_services/core.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ForgotPasswordComponent implements OnInit {
    forgotPasswordForm: FormGroup;
    step = 1;
    togglePassword1 = false;
    togglePassword2 = false;
    model = {
        username: "",
        otp_code: "",
        password: "",
        confirm_password: "",
    }

    /**
     * Constructor
     *
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _notification: Notification,
        private _configService: ConfigService,
        private el: ElementRef,
        private _coreService: CoreService,
        private router: Router,
        private globals: Globals,
    ) {

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.forgotPasswordForm = this._formBuilder.group({
            username: [
                "",
                [
                    Validators.required,
                    Validators.maxLength(255),
                    Validators.email
                ]],
            otp_code: ["", [Validators.required]],
            password: ["", [Validators.required,
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
            confirm_password: ["", [Validators.required,
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
        });
    }

    continue(status: boolean) {
        if (!this.forgotPasswordForm.valid && status) {
          for (const key of Object.keys(this.forgotPasswordForm.controls)) {
            if (this.forgotPasswordForm.controls[key].invalid) {
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
          this._notification.warning("notify.EDIT_ERROR");
          this.forgotPasswordForm.markAllAsTouched();
          return;
        } else {
            if (this.step == 1) {
                if (!this.model.username) {
                    this._notification.warning("Bạn chưa nhập email!");
                    return;
                }
    
                this._coreService.Post("/auth/sendCodeForgetAdmin", {
                    email: this.model.username
                }).subscribe((res) => {
                    if (res && res.code && res.code === "200") {
                        this.step = 2;
                        this._notification.success("Mã OTP đã được gửi qua Email của quý khách!");
                    } else {
                        this._notification.warning("Email không tồn tại trong hệ thống!");
                    }
                })
            } else if (this.step == 2) {
                if (!this.model.otp_code) {
                    this._notification.warning("Bạn chưa nhập mã OTP!");
                    return;
                }
                this._coreService.Post("/auth/confirmCodeForgetAdmin", {
                    email: this.model.username,
                    otp_code: this.model.otp_code
                }).subscribe((res) => {
                    if (res && res.code && res.code === "200") {
                        this.step = 3;
                        this._notification.success("Xác nhận OTP thành công!");
                    } else {
                        this._notification.warning("Mã OTP không chính xác!");
                    }
                })
            } else if (this.step == 3) {
                if (!this.model.password) {
                    this._notification.warning("Bạn chưa nhập mật khẩu!");
                    return;
                }
    
                if (!this.model.confirm_password) {
                    this._notification.warning("Bạn chưa nhập xác nhận mật khẩu!");
                    return;
                }
    
                if (this.model.password != this.model.confirm_password) {
                    this._notification.warning("Xác nhận mật khẩu không trùng khớp với mật khẩu!");
                    return;
                }
                this._coreService.Post("/auth/changePassForgetAdmin", {
                    email: this.model.username,
                    otp_code: this.model.otp_code,
                    new_password: this.model.password
                }).subscribe((res) => {
                    if (res && res.code && res.code === "200") {
                        this._notification.success("Đổi mật khẩu thành công!");
                        this.router.navigate(["/auth/login"]);
                    } else {
                        this._notification.warning("Đổi mật khẩu thất bại!");
                    }
                })
            }
        }
    }

    resendOtp = () => {
        this._coreService.Post("/auth/sendCodeForgetAdmin", {
            email: this.model.username
        }).subscribe((res) => {
            if (res && res.code && res.code === "200") {
                this._notification.success("Mã OTP đã được gửi qua Email của quý khách!");
            } else {
                this._notification.warning("Gửi lại OTP thất bại!");
            }
        })
    }

    checkConfirmPassword = () => {
        setTimeout(() => {
            if (this.model.confirm_password) {
                if (this.model.confirm_password !== this.model.password) {
                    this.forgotPasswordForm.get("confirm_password").setErrors({ incorrect: true });
                } else {
                    this.forgotPasswordForm.get("confirm_password").setErrors(null);
                }
            } else {
                this.forgotPasswordForm.get("confirm_password").setErrors({ required: true });
            }
        }, 100);
    }
}
