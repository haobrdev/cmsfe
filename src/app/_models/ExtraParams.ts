export class ExtraParams {
    field: string;
    value: string;
};
export class OtherParams {
    id:string;
    name:string;
    code?:string;
}

export class OtherlistParam {
    id: string;
    name: string;
}

export interface ImgurUploadOptions {
    clientId: string,
    imageData: Blob,
    title?: string
};