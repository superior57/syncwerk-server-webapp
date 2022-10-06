import { NgModule } from '@angular/core';
import { RangeSizeGridComponent } from '@modules/files/components/range-size-grid/range-size-grid.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const RANGE_SIZE_GRID_ROUTES = [
  { path: '', component: RangeSizeGridComponent }
];

@NgModule({
  declarations: [
    RangeSizeGridComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    RangeSizeGridComponent
  ]
})
export class RangeSizeGridModule {


}
