import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppLayoutCompnent } from './applayout.component';
import { ToolbarModule } from '../components/toolbar/toolbar.module';

@NgModule({
    declarations: [
        AppLayoutCompnent
    ],
    imports     : [
        RouterModule,
        CommonModule,
        ToolbarModule,
    ],
    exports     : [
        AppLayoutCompnent
    ]
})
export class AppLayoutModule
{
}
