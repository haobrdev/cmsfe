import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ReportRoute } from './report.routing';
import { Error404Module } from '../../errors/404/error-404.module';

@NgModule({
    imports: [
        RouterModule.forChild(ReportRoute),
        Error404Module
    ],
    declarations: [],
})
export class AppReportModule {
}
