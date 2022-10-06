import { RouterModule, Routes } from '@angular/router';

import { AuthGuard, LoggedinGuard } from '@guard/index';
import { PageNotFoundComponent } from '@shared/components/page-not-found/page-not-found.component';

const appRoutes: Routes = [
  // { path: '**', component: PageNotFoundComponent }
];

export const routing = RouterModule.forRoot(appRoutes);
