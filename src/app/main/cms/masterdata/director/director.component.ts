import {
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import { Subject } from "rxjs";
import { Observable } from "rxjs";
import { Router, ActivatedRoute, Params } from "@angular/router";
import {
    DataStateChangeEventArgs,
    FilterService,
    GridComponent,
    VirtualScrollService
} from "@syncfusion/ej2-angular-grids";
// Globals File
import { Globals } from "src/app/common/globals";
import { Configs } from "src/app/common/configs";
import { Notification } from "src/app/common/notification";
import * as _ from "lodash";

import { CoreService } from "src/app/_services/core.service";
import { ConfigService } from "src/app/_services/config.service";
import { ModalService } from "src/app/_services/modal.service";
import { FieldSettingsModel } from "@syncfusion/ej2-dropdowns";
import {
    ListBoxComponent,
    CheckBoxSelection
} from "@syncfusion/ej2-angular-dropdowns";
import { DirectorSerivce } from "src/app/_services/director.service";

@Component({
    selector: "cms-director",
    templateUrl: "./director.component.html",
    styleUrls: ["./director.component.scss"],
    providers: [FilterService, VirtualScrollService],
    encapsulation: ViewEncapsulation.None,
})
export class DirectorComponent implements OnInit {
    // variables
    @ViewChild("datagrid", { static: false })
    public dataGrid: GridComponent;

    public data: Observable<DataStateChangeEventArgs>; //table data
    public state: DataStateChangeEventArgs;
    public pageIndex = 0;


    // search filter
    public search = {
        directorName: "",
        nationId: "",
    }
    public listNation: [] = [];

    public dataOrigin = [];
    public modelAdd: any;

    constructor(
        private _coreService: CoreService,
        private modalService: ModalService,
        private notification: Notification,
        private globals: Globals,
        public configs: Configs,
        public router: Router,
        public activatedRoute: ActivatedRoute,
        private _configService: ConfigService,
        private _directorService: DirectorSerivce
    ) {
        this.data = _directorService;
        this._configService._configSubject.next("true");
        // Load file language
    }

    /**
   * On init
   */
    ngOnInit(): void {
        // Set the selected language from default languages
        this.listNation = [];
    }

    // change filer
    public dataStateChange(state: DataStateChangeEventArgs): void {
        this.state = state;
        this.pageIndex = Math.floor(state.skip / state.take);
        let extraParams = [];

        this._directorService.getList(state, extraParams);
    }


    changeNation() {

    }

    getListData() {
        
    }
}