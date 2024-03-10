import { Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NavigationService } from 'src/app/_services/navigation.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {
  navigation: any;
  _router: any;
  isToggleSideBar = false;

  /**
   * Constructor
   */
  constructor(
    private navigationService: NavigationService,
    private router: Router
  ) {
    this._router = router;
    let navigations = this.navigationService.getCurrentNavigation();

    let isAdmin: any = localStorage.getItem('isAdmin');
    let mainNavigation = [];
    let username: any = localStorage.getItem("username");
    for (let i = 0; i < navigations.length; i++) {
      mainNavigation.push(navigations[i]);
    }

    // if (isAdmin == "1") {
    //   this.navigation = mainNavigation;
    // } else {

    //   // Level 1
    //   for (let i = navigations.length - 1; i >= 0; i--) {
    //     // if (navigations[i].id === 'cms_dashboards') {
    //     //   continue;
    //     // }
        
    //     if (!this.checkContainParent(navigations[i].id)) {
    //       navigations.splice(i, 1);
    //     } else if (navigations[i].children && navigations[i].children.length) {
    //       // Level 2
    //       for (let j = navigations[i].children.length - 1; j >= 0; j--) {
    //         if (!this.checkContainParent(navigations[i].children[j].id)) {
    //           navigations[i].children.splice(j, 1);
    //         } else if (navigations[i].children[j].children && navigations[i].children[j].children.length) {
    //           // Level 3
    //           for (let k = navigations[i].children[j].children.length - 1; k >= 0; k--) {
    //             if (!this.checkContainParent(navigations[i].children[j].children[k].id) ) {
    //               navigations[i].children[j].children.splice(k, 1);
    //             } else if (navigations[i].children[j].children[k].children && navigations[i].children[j].children[k].children.length) {
    //               // Level 4
    //               for (let h = navigations[i].children[j].children[k].children.length - 1; h >= 0; h--) {
    //                 if (!this.checkContainParent(navigations[i].children[j].children[k].children[h].id) ) {
    //                   navigations[i].children[j].children[k].children.splice(h, 1);
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
      // this.navigation = navigations;

    // }
    this.navigation = navigations;
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

  addSidebarClass = () => {
    return {
      "hide-menu": this.isToggleSideBar,
      "show-menu-toggle": this.isToggleSideBar,
    };
  };
  addButtonClass = () => {
    return {
      click: this.isToggleSideBar,
    };
  };
  click = () => {
    this.isToggleSideBar = !this.isToggleSideBar;
    let appToolbar = document.getElementsByClassName("app-toolbar");
    let appMainContent = document.getElementsByClassName("app-main-content");
    let sideBar = document.getElementsByClassName("sidebar");
    // Set toggle padding app-toolbar
    for (let i = 0; i < appToolbar.length; i++) {
      if (this.isToggleSideBar == true) {
        appToolbar[i].classList.add("pd-100");
        appToolbar[i].classList.remove("ease-in-padding");
      } else {
        appToolbar[i].classList.remove("pd-100");
        appToolbar[i].classList.add("ease-in-padding");
      }
    }
    // Set toggle width app-main-content
    for (let i = 0; i < appMainContent.length; i++) {
      if (this.isToggleSideBar == true) {
        appMainContent[i].classList.add("full-screen");
        appMainContent[i].classList.remove("ease-in");
      } else {
        appMainContent[i].classList.remove("full-screen");
        appMainContent[i].classList.add("ease-in");
      }
    }
    // Set toggle width sidebar
    for (let i = 0; i < sideBar.length; i++) {
      // sideBar[s].classList.toggle("set-width-45");
      if (this.isToggleSideBar == true) {
        sideBar[i].classList.remove("ease-in-width");
        sideBar[i].classList.add("set-width-45");
      } else {
        sideBar[i].classList.add("ease-in-width");
        sideBar[i].classList.remove("set-width-45");
      }
    }
  };

  routerLink = (data) => {
    if (data && data.type === 'items' || data && data.type === 'item') {
      this.router.navigate([`${data.url}`]);
    }
  }
  openMenus: string[] = [];

  toggleSubMenu(id: string) {
    if (this.openMenus.includes(id)) {
      this.openMenus = this.openMenus.filter(menuId => menuId !== id);
    } else {
      this.openMenus.push(id);
    }
  }

  isSubMenuVisible(id: string) {
    return this.openMenus.includes(id);
  }
}
