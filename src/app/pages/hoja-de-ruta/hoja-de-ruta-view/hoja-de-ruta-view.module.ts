import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HojaDeRutaViewPageRoutingModule } from './hoja-de-ruta-view-routing.module';

import { HojaDeRutaViewPage } from './hoja-de-ruta-view.page';
import { ComponentsModule } from 'src/app/component/component.module';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    HojaDeRutaViewPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [HojaDeRutaViewPage]
})
export class HojaDeRutaViewPageModule {}
