import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthenRoute } from './authen.routing';
import { Error404Module } from '../../errors/404/error-404.module';


@NgModule({
    imports: [
        RouterModule.forChild(AuthenRoute),
        Error404Module
    ]
})
export class AppAuthenModule {
}
