import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {
  color: string;
  marker?: mapboxgl.Marker;
  center?: [number, number];
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
      .mapa-container {
          height: 100%;
          width: 100%;
      }

      .list-group {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99;
      }

      li {
        cursor: pointer;
      }
    `
  ]
})
export class MarcadoresComponent implements AfterViewInit {

  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLavel: number = 16;
  center: [number, number] = [-101.193642, 19.702383];

  //Arreglo de marcadores
  markers: MarcadorColor[] = [];

  constructor() { }

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.center,
      zoom: this.zoomLavel,
    });

    //Se leen los marcadores desde el local storage
    this.readLocalStorage()

    //Agregar un marcador con un HTMLElement
    // const markerHTML: HTMLElement = document.createElement('div');
    // markerHTML.innerHTML = 'Hola Mundo';
  }

  //Método para añadir un marcador
  addMarker() {
    const color = "#xxxxxx".replace(/x/g, y => (Math.random()*16|0).toString(16));
    const newMarker = new mapboxgl.Marker({
      draggable: true,
      color
    }).setLngLat(this.center).addTo(this.mapa);

    this.markers.push({
      color,
      marker: newMarker
    });

    this.saveMarkerInLocalStorage();

    newMarker.on('dragend', () => {
      this.saveMarkerInLocalStorage();
    });
  }

  //Método para ir a un marcador
  goMarker(marker: mapboxgl.Marker) {
    this.mapa.flyTo({
      center: [
        marker.getLngLat().lng,
        marker.getLngLat().lat
      ],
      essential: true
    });
  }

  //Guardar los marcadores en LocalStorage
  saveMarkerInLocalStorage() {
    const lngLatArray: MarcadorColor[] = [];
    this.markers.forEach( m => {
      const color = m.color;
      const {lng, lat} = m.marker!.getLngLat();

      lngLatArray.push({
        color: color,
        center: [lng, lat],
      });
    });

    localStorage.setItem('marcadores', JSON.stringify(lngLatArray));
  }

  //Leer los marcadores en Local Storage
  readLocalStorage() {
    if(!localStorage.getItem('marcadores')){
      return;
    } 

    const lngLatArray: MarcadorColor[] = JSON.parse(localStorage.getItem('marcadores')!);
    
    lngLatArray.forEach( m => {
      const newMarker = new mapboxgl.Marker({
        color: m.color,
        draggable: true
      }).setLngLat(m.center!).addTo(this.mapa);

      this.markers.push({
        marker: newMarker,
        color: m.color
      });
      
      newMarker.on('dragend', () => {
        this.saveMarkerInLocalStorage();
      });
    });
  }

  //Borrar marcadores con doble click
  deleteMarker(index: number) {
    this.markers[index].marker?.remove();
    this.markers.splice(index, 1);
    this.saveMarkerInLocalStorage();
  }
}
