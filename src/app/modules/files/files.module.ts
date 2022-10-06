import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';
import { Select2Module } from 'ng2-select2';

// relative modules
import { FilesRoutingModule } from './files.routing';
import { SharedModule } from '@shared/shared.module';

// components
import { TrashComponent } from './components/trash/trash.component';
import { HistorysComponent } from './components/historys/historys.component';
import { HistoryDetailsModalComponent } from './components/history-details-modal/history-details-modal.component';
import { ViewSnapshotComponent } from './components/view-snapshot/view-snapshot.component';
import { DeletedFoldersComponent } from './components/deleted-folders/deleted-folders.component';
import { FavoritesPageComponent } from './pages/favorites/favorites.page';
import { FavoritesListComponent } from './components/favorites-list/favorites-list.component';
import { FavoritesGridComponent } from './components/favorites-grid/favorites-grid.component';
import { LayoutFilesComponent } from './pages/layout-files/layout-files.component';
import { RangeSizeGridModule } from '@modules/files/components/range-size-grid/range-size-grid.module';

@NgModule({
  imports: [
    CommonModule,
    FilesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    Select2Module,
    MomentModule,
    SharedModule,
    RangeSizeGridModule
  ],
  declarations: [
    TrashComponent,
    HistorysComponent,
    HistoryDetailsModalComponent,
    ViewSnapshotComponent,
    DeletedFoldersComponent,
    FavoritesPageComponent,
    FavoritesListComponent,
    FavoritesGridComponent,
    LayoutFilesComponent,
  ],
  providers: [

  ]
})
export class FilesModule { }
