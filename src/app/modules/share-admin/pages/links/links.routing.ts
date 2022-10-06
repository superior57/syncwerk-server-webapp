import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// relative modules
import { AuthGuard, LoggedinGuard } from '@guard/index';

// components
import { DownloadLinksPageComponent } from './pages/download-links/download-links.page';
import { UploadLinksPageComponent } from './pages/upload-links/upload-links.page';
import { LayoutLinksComponent } from './component/layout-links/layout-links.component';

const routes: Routes = [
	{
    path: '',
    component: LayoutLinksComponent,
    children: [
    	{
    		path: '',
		    redirectTo: 'download',
		    pathMatch: 'full',
    	},
      {
        path: 'download',
        component: DownloadLinksPageComponent,
      },
      {
        path: 'upload',
        component: UploadLinksPageComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LinksRoutingModule { }
