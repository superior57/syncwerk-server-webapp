import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MomentModule } from 'ngx-moment';

import { SharedModule } from '@shared/shared.module';
import { WikisRoutingModule } from './wikis.routing';

import { WikiListComponent } from './pages/wiki-list/wiki-list.component';
import { WikiPagesComponent } from './pages/wiki-pages/wiki-pages.component';

import { ModalCreateNewWikiComponent } from './components/modal-create-new-wiki/modal-create-new-wiki.component';
import { ModalRenameWikiComponent } from './components/modal-rename-wiki/modal-rename-wiki.component';
import { ModalRemoveWikiComponent } from './components/modal-remove-wiki/modal-remove-wiki.component';
import { ModalCreateWikiFromExistingFolderComponent } from './components/modal-create-wiki-from-existing-folder/modal-create-wiki-from-existing-folder.component';
import { ModalRenameWikiPageComponent } from './components/modal-rename-wiki-page/modal-rename-wiki-page.component';
import { ModalRemoveWikiPageComponent } from './components/modal-remove-wiki-page/modal-remove-wiki-page.component';
import { ModalAddWikiPageComponent } from './components/modal-add-wiki-page/modal-add-wiki-page.component';

@NgModule({
  imports: [
    CommonModule,
    MomentModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    WikisRoutingModule,
  ],
  declarations: [
    WikiListComponent,
    ModalCreateNewWikiComponent,
    ModalRenameWikiComponent,
    ModalRemoveWikiComponent,
    ModalCreateWikiFromExistingFolderComponent,
    WikiPagesComponent,
    ModalRenameWikiPageComponent,
    ModalRemoveWikiPageComponent,
    ModalAddWikiPageComponent,
  ],
  entryComponents: [
    ModalCreateNewWikiComponent,
    ModalRenameWikiComponent,
    ModalRemoveWikiComponent,
    ModalCreateWikiFromExistingFolderComponent,
    ModalRenameWikiPageComponent,
    ModalRemoveWikiPageComponent,
    ModalAddWikiPageComponent,
  ]
})
export class WikisModule { }
