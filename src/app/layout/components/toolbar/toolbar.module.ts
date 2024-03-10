import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TlaSharedModule } from 'src/app/components/shared.module';

import { ToolbarComponent } from './toolbar.component';
import { SidebarModule } from '../sidebar/sidebar.module';

@NgModule({
    declarations: [
        ToolbarComponent
    ],
    imports: [
        RouterModule,
        TlaSharedModule,
        SidebarModule,
        BsDropdownModule.forRoot()
    ],
    exports: [
        ToolbarComponent
    ]
})
export class ToolbarModule {
}
