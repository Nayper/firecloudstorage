import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
   MatButtonModule,
   MatButtonToggleModule,
   MatToolbarModule,
   MatIconModule,
   MatBadgeModule,
   MatSidenavModule,
   MatListModule,
   MatGridListModule,
   MatFormFieldModule,
   MatInputModule,
   MatSelectModule,
   MatRadioModule,
   MatDatepickerModule,
   MatNativeDateModule,
   MatChipsModule,
   MatTooltipModule,
   MatTableModule,
   MatPaginatorModule,
   MatCardModule,
   MatProgressSpinnerModule,
   MatMenuModule
} from '@angular/material';

@NgModule({
   imports: [
      CommonModule,
      MatButtonModule,
      MatButtonToggleModule,
      MatToolbarModule,
      MatIconModule,
      MatSidenavModule,
      MatBadgeModule,
      MatListModule,
      MatGridListModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatRadioModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatChipsModule,
      MatTooltipModule,
      MatTableModule,
      MatPaginatorModule,
      MatCardModule,
      MatProgressSpinnerModule,
      MatMenuModule
   ],
   exports: [
      MatButtonModule,
      MatButtonToggleModule,
      MatToolbarModule,
      MatIconModule,
      MatSidenavModule,
      MatBadgeModule,
      MatListModule,
      MatGridListModule,
      MatInputModule,
      MatFormFieldModule,
      MatSelectModule,
      MatRadioModule,
      MatDatepickerModule,
      MatChipsModule,
      MatTooltipModule,
      MatTableModule,
      MatPaginatorModule,
      MatCardModule,
      MatProgressSpinnerModule,
      MatMenuModule
   ],
   providers: [
      MatDatepickerModule,
   ]
})

export class AngularMaterialModule { }