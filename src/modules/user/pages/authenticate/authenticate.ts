import { Component } from '@angular/core';
import {ViewController, NavController, ModalController} from 'ionic-angular';
import { InAppBrowser } from 'ionic-native';

import { AppService } from '../../../common/services/app.service';
import { UserService} from '../../services/user.service';
import {BrowserPage} from "../../../common/pages/browser";
import {RoleSelectPage} from "./role-select";
import {MeProfilePage} from "../me/me-profile";
import {LocalStorageService} from "../../../common/services/localStorage.service";


@Component({
  selector: 'page-authenticate',
  templateUrl: 'authenticate.html'
})
export class AuthenticatePage {

  signUpModel: {phone?: number, verificationCode?: number} = {};

  getVerificationCodeBtnText: string;
  getVerificationCodeBtnDisabled: boolean = false;

  constructor(
    public heyApp: AppService,
    public userService: UserService,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public localStorageService: LocalStorageService,
    public navCtrl: NavController
  ) {

  }

  // cancel modal
  cancelModal() {
    this.viewCtrl.dismiss();
  }


  //
  // sign up handler
  signUpHandler(ngForm) {
    let data: Object = {
      phoneNum: this.signUpModel.phone,
      verifyCode: this.signUpModel.verificationCode
    };

    if (ngForm.valid) {
      this.heyApp.utilityComp.presentLoading();

      this.userService.signUp(data)
      .then(ret => {
        this.heyApp.authService.logIn(ret);
        this.viewCtrl.dismiss().then(() => {

          if(ret.firstFlag == 1){
            this.heyApp.utilityComp.dismissLoading();
            this.localStorageService.set("firstFlag", "1");
            this.heyApp.utilityComp.presentToast('请完善您的资料，以便更好的交流！');
            this.navCtrl.push(MeProfilePage);
          } else {
            this.heyApp.utilityComp.dismissLoading();
            this.heyApp.utilityComp.presentToast('验证成功, 欢迎你： ' + ret.nickname);
          }
        });
      }, (data) => {
        this.heyApp.utilityComp.dismissLoading().then(() => {
          this.heyApp.utilityComp.presentToast(data._body);
        });
      });
    }
  }


  // get verification code
  getVerificationCode() {
    this.userService.getVerificationCode({phoneNum: this.signUpModel.phone}).then((res) => {
      this.getVerificationCodeBtnText = '60s';
      this.getVerificationCodeBtnDisabled = true;

      let verificationCodeInterval = setInterval(() => {
        let t = this.getVerificationCodeBtnText.substr(0, this.getVerificationCodeBtnText.indexOf('s'));

        if (parseInt(t) > 1) {
          this.getVerificationCodeBtnText = parseInt(t) - 1 + 's';
        } else {
          clearInterval(verificationCodeInterval);
          this.getVerificationCodeBtnDisabled = false;
        }
      }, 1000);
    }, (res) => {
      this.heyApp.utilityComp.presentAlter({title: '提示', subTitle: res._body});
    });
  }

  // open terms page
  openTermsPage() {

    this.navCtrl.push(BrowserPage, {
      browser: {
        title: '用户协议',
        url: 'http://119.29.250.146:8900/docs/terms.html'
      }
    });
  }
}
