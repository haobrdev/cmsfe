// GLOBAL IMPORT
import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import {
    DataStateChangeEventArgs,
    DataResult,
} from "@syncfusion/ej2-angular-grids";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Http, ResponseContentType } from "@angular/http";

import { Globals } from "../common/globals";
import { API } from './apiurl';
import { ExtraParams } from "../_models/index";
import { ConfigService } from "./config.service";

export interface ImgurUploadResponse {
    link: string;
    deleteHash: string;
}

Injectable()
export class DirectorSerivce extends Subject<DataStateChangeEventArgs> {

    constructor(
        @Inject(Http) private http: Http,
        @Inject(Router) private router: Router,
        @Inject(Globals) private globals: Globals,
        @Inject(ConfigService) private configService: ConfigService
    ) {
        super();
    }

    // get list
    public getList(state: any, extraParams?: Array<ExtraParams>): void {
        const url = API.directorUrl + API.list;
        this.getall(state, url, extraParams).subscribe((x) => super.next(x));
    }

    getall = (state: DataStateChangeEventArgs, url: string, extraParams: any): Observable<DataStateChangeEventArgs> => {
        const urlRequest = this.globals.apiURL + url;
        const body = this.globals.getCommonBodyGetAll(state, extraParams);
        const options = this.globals.getCommonOptionsWithAuth(urlRequest, body);
        this.configService.loadingSubject.next("true");
        return this.http.post(urlRequest, body, options)
            .pipe(map((res: any) => {
                res = JSON.parse(res._body);
                let result = null;
                result = res.data;
                return {
                    result: result && result.data ? result.data : [],
                    count: result && result.total_elements ? result.total_elements : 0
                } as DataResult;
            }))
            .pipe((data: any) => {
                this.configService.loadingSubject.next("false");
                return data;
            });
    };
}