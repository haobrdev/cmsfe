import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MasterDataRoute } from './masterdata.routing';
import { Error404Module } from '../../errors/404/error-404.module';

@NgModule({
    imports: [
        RouterModule.forChild(MasterDataRoute),
        Error404Module
    ],
    declarations: [],
})
export class AppMasterDataModule {
}
