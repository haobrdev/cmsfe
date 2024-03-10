// GLOBAL IMPORT
import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import {
  DataStateChangeEventArgs,
  Sorts,
  DataResult,
} from "@syncfusion/ej2-angular-grids";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Http, ResponseContentType } from "@angular/http";
import { Globals } from "../common/globals";
import { ExtraParams } from "../_models/index";
import { ConfigService } from "./config.service";
import { FileReaderCommon } from "../common/FileReaderCommon";
import { Consts } from "../common/const";
import { saveAs } from "file-saver";

export interface ImgurUploadResponse {
  link: string;
  deleteHash: string;
}

Injectable();
export class CoreService extends Subject<DataStateChangeEventArgs> {
  public loadCouncilSubject = new Subject<any>();

  constructor(
    @Inject(Http) private http: Http,
    @Inject(Router) private router: Router,
    @Inject(Globals) private globals: Globals,
    @Inject(ConfigService) private configService: ConfigService
  ) {
    super();
  }

  public execute(
    state: any,
    url: string,
    extraParams?: Array<ExtraParams>
  ): void {
    this.GetAll(state, url, extraParams).subscribe((x) => super.next(x));
  }

  public executeNonPaging(
    state: any,
    url: string,
    extraParams?: Array<ExtraParams>
  ): void {
    this.GetAllNonePaging(state, url, extraParams).subscribe((x) =>
      super.next(x)
    );
  }

  // Function GetAll
  GetAll = (
    state: DataStateChangeEventArgs,
    url: string,
    extraParams?: any
  ): Observable<DataStateChangeEventArgs> => {
    const url_request = this.globals.apiURL + url;
    const body = this.globals.getCommonBodyGetAll(state, extraParams);
    const options = this.globals.getCommonOptionsWithAuth(url_request, body);
    this.configService.loadingSubject.next("true");
    return this.http
      .post(url_request, body, options)
      .pipe(
        map((res: any) => {
          res = JSON.parse(res._body);
          let result = null;
          result = res.data;
          return {
            result: result && result.data ? result.data : [],
            count: result && result.total_elements ? result.total_elements : 0,
          } as DataResult;
        })
      )
      .pipe((data: any) => {
        this.configService.loadingSubject.next("false");
        return data;
      });
  };

  // Function create Model
  Create = (url: string, body: any) => {
    const url_request = this.globals.apiURL + url;
    const options = this.globals.getCommonOptionsWithAuth(url_request, body);

    return this.http.post(url_request, body, options);
  };

  // Function update Model
  Update = (url: string, body: any) => {
    const url_request = this.globals.apiURL + url;
    const options = this.globals.getCommonOptionsWithAuth(url_request, body);

    return this.http.post(url_request, body, options);
  };

  // Function Delete Model
  Delete = (url: string, body: Array<any>) => {
    const url_request = this.globals.apiURL + url;
    const options = this.globals.getCommonOptionsWithAuth(url_request, body);

    return this.http.post(url_request, body, options);
  };

  // SERVICE POST
  Post = (url: string, body: any) => {
    const url_request = this.globals.apiURL + url;
    const options = this.globals.getCommonOptionsWithAuth(url_request, body);
    return this.http.post(url_request, body, options).pipe(
      map((response: any) => {
        response = JSON.parse(response._body);
        return response;
      })
    );
  };

  PostExport = (url: string, body: any) => {
    const url_request = this.globals.apiURL + url;
    const options = this.globals.getCommonExportOptionsWithAuth(
      url_request,
      body
    );

    return this.http.post(url_request, body, options).pipe(
      map((response: any) => {
        return response._body;
      })
    );
  };

  // SERVICE PUT
  Put = (url: string, body: any) => {
    const url_request = this.globals.apiURL + url;
    const options = this.globals.getCommonOptionsWithAuth(url_request, body);

    return this.http.put(url_request, body, options).pipe(
      map((response: any) => {
        response = JSON.parse(response._body);
        return response;
      })
    );
  };

  // SERVICE DEL
  Del = (url: string, body: any) => {
    const url_request = this.globals.apiURL + url;
    const options = this.globals.getCommonOptionsWithAuth(url_request, body);

    return this.http.post(url_request, options).pipe(
      map((response: any) => {
        response = JSON.parse(response._body);
        return response;
      })
    );
  };

  // SERVICE GET
  Get = (url: string) => {
    const url_request = this.globals.apiURL + url;
    const options = this.globals.getCommonOptionsWithAuth(url_request);

    return this.http.get(url_request, options).pipe(
      map((res: any) => {
        res = JSON.parse(res._body);
        return res;
      })
    );
  };

  uploadFile = (formData: any): Observable<any> => {
    const url = this.globals.apiURL + "/upload/uploadFile";
    return this.http.post(url, formData).pipe(
      map((response: any) => {
        return response.json();
      })
    );
  };

  // Hoan them
  uploadFileDoc = (formData: any): Observable<any> => {
    // sua duong dan
    const url = this.globals.apiURL + "/DocumentEditor/Import";
    // const options = this.globals.getCommonOptionsWithAuth(url);
    return this.http.post(url, formData).pipe(
      map((response: any) => {
        return response.json();
      })
    );
  };

  //VT
 
  UploadFileImg = (formData: any): Observable<any> => {
    const url = this.globals.apiURL + "/upload/uploadfileimg";
    return this.http.post(url, formData).pipe(
      map((response: any) => {
        return response.json();
      })
    );
  };


  importFile = (url2: string, formData: any): Observable<any> => {
    const url = this.globals.apiURL + url2;
    return this.http.post(url, formData).pipe(
      map((response: any) => {
        return response.json();
      })
    );
  };

  GetOutside = (url): Observable<any> => {
    return this.http.get(url).pipe(
      map((response: any) => {
        return response.json();
      })
    );
  };

  // Function GetAll
  GetAllNonePaging = (
    state: DataStateChangeEventArgs,
    url: string,
    extraParams?: any
  ): Observable<DataStateChangeEventArgs> => {
    const url_request = this.globals.getCommonURLGetAll(
      state,
      url,
      extraParams
    );

    const options = this.globals.getCommonOptionsWithAuth(url_request);
    return this.http
      .get(url_request, options)
      .pipe(map((response: any) => response.json()));
  };

  // haohv
  postRecordFile = (headers, formData: any): Observable<any> => {
    const url = this.globals.apiURL + '/readrecord/uploadRecordFiles';
    return this.http
      .post(url, formData, headers)
      .pipe(map((response: any) => {
        return response.json();
      }));
  }

  // // report
  // public exportFileWord(recordId: string, fileName: string): Promise<string> {
  //   const url_request = this.globals.apiURL + '/readrecord/exportWord/' + recordId;
  //   const options = this.globals.getCommonOptionsWithAuthForWord(url_request);
  //   return new Promise<string>((resolve, reject) => {
  //     try {
  //       this.http.get(url_request, {...options, responseType: ResponseContentType.Blob}).subscribe((res: any) => {
  //         let disposition = res.headers.get('Content-Disposition');
  //         let blob = res._body;

  //         fileName += ".docx";
  //         let saveAs = require('file-saver')
  //         saveAs(blob, fileName);
  //       });
  //     } catch (error) {
  //       alert(error);
  //     }
  //   });
  // }
  // report - hoan
  // exportFileExcel(state: DataStateChangeEventArgs,body: any, fileName:any): Promise<string> {
  //   const url_request = this.globals.apiURL + '/meetingreport/exportExel';
  //   const options = this.globals.getCommonOptionsWithAuthForWord(url_request);
  //   const bodyData = this.globals.getCommonBodyGetAll(state, body);
  //   console.log(bodyData);
  //   return new Promise<string>((resolve, reject) => {
  //     try {
  //       this.http.post(url_request, bodyData, {...options, responseType: ResponseContentType.Blob}).subscribe((res: any) => {
  //         let disposition = res.headers.get('Content-Disposition');
  //         let blob = res._body;
  //         if (disposition && disposition.indexOf('attachment') !== -1) {
  //           var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
  //           var matches = filenameRegex.exec(disposition);
  //           if (matches != null && matches[1]) {
  //             fileName = matches[1].replace(/['"]/g, '');
  //           }
  //         }
  //         let saveAs = require('file-saver')
  //         saveAs(blob, fileName);
  //       });
  //     } catch (error) {
  //       alert(error);
  //     }
  //   });
  // }
}
