import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  public title: string;

  constructor() {
    this.title = 'Mensajes';
  }

  ngOnInit(): void {
    //console.log('main.component se ha cargado correctamente');
  }

}
