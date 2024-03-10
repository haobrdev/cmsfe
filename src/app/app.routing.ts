import { StoreGuard } from './common/auth.guard';
import { Routes } from '@angular/router';
import { Error404Component } from './main/errors/404/error-404.component';

export const AppRoutes: Routes = [
    {
        path: 'auth',
        children: [{
            path: '',
            loadChildren: './auth/auth.module#AuthModule'
        }]
    },
    {
        path: 'cms',
        children: [{
            path: '',
            loadChildren: './main/cms/cms.module#CmsModule'
        }],
        canActivate: [StoreGuard]
    },
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },
    {
        path: '**',
        component: Error404Component
    }
];
