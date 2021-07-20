import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Producto } from 'src/app/models/producto.models';
import { LoadingService } from 'src/app/services/loading.service';
import { ProductoService } from 'src/app/services/producto.service';
import { RemitoService } from 'src/app/services/remito.service';
import { ToastService } from 'src/app/services/toast.service';
import reportesDisponiblesJson from 'src/app/pages/reportes/reportesDisponibles.json'
import { SelectionType } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { Remito } from 'src/app/models/remito.models';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  /** Permite stylizar con styles de ngx-datatables*/
  encapsulation: ViewEncapsulation.None
})
export class ReportesPage implements OnInit {

  columns: any;
  rows: any;
  // tiposDeReportes = ['Productos', 'Clientes', 'Remitos', 'Hojas de Ruta'];
  tipoReporteSeleccionado: any;
  reporteSeleccionado: any;
  tiposDeReportes: any;
  reportes: any;
  reporteSubmitted: boolean = false;
  mesesCustomizados = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiempre', 'Octubre', 'Noviembre', 'Diciembre'];
  fechaDeHoy: string = new Date().toISOString();
  fechaDesde: string;
  fechaHasta: string;
  SelectionType = SelectionType;

  constructor(
    private loading: LoadingService,
    private productosService: ProductoService,
    private remitosService: RemitoService,
    private router: Router,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.tiposDeReportes = reportesDisponiblesJson;
    console.log(this.tiposDeReportes)
  }


  async ejecutarReporte() {

    if (this.reporteSeleccionado == "" || this.reporteSeleccionado == undefined) {
      const defaultMessage = "Aun no hay reportes para el tipo de reporte " + this.tipoReporteSeleccionado.nombre;
      console.log(defaultMessage);
      this.toastService.presentToast(defaultMessage);
      return this.limpiarCampos();
    }

    this.loading.present('Cargando...');

    /** Reportes que están en reportesDisponibles.json */
    switch (this.reporteSeleccionado.nombre) {
      case 'Productos Disponibles': {
        this.limpiarFechas()
        this.columns = this.reporteSeleccionado.columnas;

        await this.productosService.getAll().then(
          (productos: Producto[]) => {
            console.log(productos);
            this.rows = productos
          }
        ).catch((err) => {
          this.limpiarCampos();
          console.error(err.error.message);
          return this.toastService.presentToast(err.error.message);
        });
        this.reporteSubmitted = true;

        break;
      }
      case 'Productos Vendidos': {
        this.columns = this.reporteSeleccionado.columnas;

        if (!this.validarFechas())
          return;

        this.formatearFechas()

        await this.remitosService.getCantidadProductosVendidos(this.fechaDesde, this.fechaHasta).then(
          (productos: Producto[]) => {
            console.log(productos);
            this.rows = productos;
          }
        ).catch((err) => {
          this.limpiarCampos();
          console.error(err.error.message);
          this.toastService.presentToast(err.error.message);
        });

        this.reporteSubmitted = true;
        break;
      }
      case 'Productos Entregados': {
        this.columns = this.reporteSeleccionado.columnas;

        if (!this.validarFechas())
          return;

        this.formatearFechas()

        await this.remitosService.getCantidadProductosEntregados(this.fechaDesde, this.fechaHasta).then(
          (productos: Producto[]) => {
            console.log(productos);
            this.rows = productos;
          }
        ).catch((err) => {
          this.limpiarCampos();
          console.error(err.error.message);
          this.toastService.presentToast(err.error.message);
        });

        this.reporteSubmitted = true;
        break;
      }
      case 'Remitos Disponibles': {
        this.limpiarFechas()
        this.columns = this.reporteSeleccionado.columnas;

        await this.remitosService.getAll().then(
          (remitos: Remito[]) => {
            console.log(remitos);
            this.rows = remitos
          }
        ).catch((err) => {
          this.limpiarCampos();
          console.error(err.error.message);
          return this.toastService.presentToast(err.error.message);
        });
        this.reporteSubmitted = true;

        break;
      }
      default: {
        this.limpiarCampos();
        const defaultMessage = "Aun no está resuelta la opcion " + this.reporteSeleccionado;
        console.log(defaultMessage);
        this.toastService.presentToast(defaultMessage);
        break;
      }
    }
    this.loading.dismiss();
  }

  seleccionarReporte($event) {
    console.log($event.target.value)
    console.log(this.tipoReporteSeleccionado)
    console.log(this.tipoReporteSeleccionado.nombre)
    console.log(this.tipoReporteSeleccionado.reportes)

    if (this.tipoReporteSeleccionado.reportes != undefined)
      return this.reportes = this.tipoReporteSeleccionado.reportes

    this.reportes = null;
    this.reporteSeleccionado = null;
  }

  validarFechas(): boolean {
    var fechasValidas = true;

    if (this.fechaDesde == null || this.fechaHasta == null) {
      fechasValidas = false
      this.limpiarCampos();
      this.loading.dismiss();
      this.toastService.presentToast("Fecha Desde o Fecha Hasta sin completar");
    }

    return fechasValidas;
  }

  limpiarCampos() {
    this.limpiarFechas();
    this.tipoReporteSeleccionado = null;
    this.reporteSeleccionado = null;
    this.reporteSubmitted = false;
  }

  limpiarFechas() {
    this.fechaDesde = null;
    this.fechaHasta = null;
  }

  formatearFecha(fecha: string) {
    const date = new Date(fecha);
    return date.getFullYear() + '-' +
      ('00' + (date.getMonth() + 1)).slice(-2) + '-' +
      ('00' + date.getDate()).slice(-2);
  }

  formatearFechas() {
    this.fechaDesde = this.formatearFecha(this.fechaDesde);
    this.fechaHasta = this.formatearFecha(this.fechaHasta);
  }

  onSelect({ selected }) {
    console.log(selected);
    /** Como selected puede tener multiples seleccionados (NO USAMOS MULTIPLE)
     * usamos por defecto selected[0]
     */
    console.log(selected[0]);

    switch (this.tipoReporteSeleccionado.nombre) {
      case 'Productos': {
        /** 
         * Esto es para obtener el id del producto según como esté armado el objeto que viene del BE
         * Por ejemplo: si obtenes el idProducto de producto y no directamente del reporte, este ternario lo resuelve
        this.router.navigate(['productos/' + (selected[0].idProducto == undefined ? selected[0].producto.idProducto : selected[0].idProducto)]);
        */ 
        this.router.navigate(['productos/' + selected[0].idProducto]);
        break;
      }
      case 'Remitos': {
        this.router.navigate(['remitos/' + (selected[0].idRemito == undefined ? selected[0].remito.idRemito : selected[0].idRemito)]);
        break;
      }
      default: {
        const defaultMessage = "Aun no está resuelta la opcion " + this.tipoReporteSeleccionado.nombre;
        console.log(defaultMessage);
        this.toastService.presentToast(defaultMessage);
        break;
      }
    }
  }

}
