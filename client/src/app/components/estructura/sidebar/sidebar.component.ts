import { Component, OnInit, DoCheck, EventEmitter, Renderer2, Output, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { User } from 'src/app/models/user';
import { Publication } from 'src/app/models/publication';

import { GLOBAL } from 'src/app/services/global';
import { UserService } from 'src/app/services/user.service';
import { PublicationService } from 'src/app/services/publication.service';
import { UploadService } from 'src/app/services/upload.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  providers: [UserService,
    PublicationService,
    UploadService]
})
export class SidebarComponent implements OnInit, DoCheck {

  @ViewChild("fileInput") fileInput: ElementRef;
  @Output() sended = new EventEmitter();

  public identity: any;
  public token: string;
  //@Input() stats: any;
  public stats: any;

  public url: string;

  public status: string;
  public mensajeError: string;

  public publication: Publication;
  public filesToUpload: Array<File>;

  publicationForm = new FormGroup({
    text: new FormControl('', [Validators.required])
  });


  constructor(
    private _userService: UserService,
    private _publicationService: PublicationService,
    private _uploadService: UploadService,
    private _route: ActivatedRoute,
    private _router: Router,
    private renderer: Renderer2
  ) {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.url;
    this.stats = this._userService.getStats();
    this.publication = new Publication("", "", "", "", this.identity._id);
  }

  ngOnInit(): void {
    //console.log("el sidebar se ha cargado correctamente");
  }

  // para detectar cambios, como una nueva publicación o un nuevo seguimiento
  ngDoCheck() {
    this.stats = this._userService.getStats();
  }

  get text() {
    return this.publicationForm.get('text');
  }

  onSubmit() {

    this.publication.text = this.publicationForm.get('text').value;

    this._publicationService.addPublication(this.token, this.publication).subscribe(
      response => {
        if (response.publication) {
          //this.publication = response.publication;
          //console.log(this.publication); // aqui solo tiene el texto y el user_id
          //console.log(this.filesToUpload)

          // Si existen las imagenes
          if (this.filesToUpload != undefined) {
            //console.log("imagenes");
            // Subir la imagen
            this._uploadService.makeFileRequest(this.url + 'upload-image-publi/' + response.publication._id, [], this.filesToUpload, this.token, 'image')
              .then((result: any) => {
                this.publication.file = result.image;
                this.resetForm();
              }
            );
          } else {
            this.resetForm();
          }

        } else {
          this.status = 'error';
          this.mensajeError = response.message;
          //console.log(response);
        }
      },
      error => {
        this.mensajeError = error.error.message;
        console.log(<any>error);

        if (this.mensajeError != null) {
          this.status = 'error';
        }
      }
    );
  }

  // resetea el formulario cuando se envia una publicacion
  resetForm() {
    // reseteamos el formulario
    this.status = 'success';
    this.getCounters();
    this.publicationForm.reset();

    // reseteamos tambien el campo de la imagen
    this.renderer.setProperty(this.fileInput.nativeElement, 'value', '');
    //this.fileInput.nativeElement.value = ""; // mala practiva

    this._router.navigate(['/timeline']);
    this.sended.emit({ send: 'true' });
    //console.log("emitiendo evento");

    this.filesToUpload = undefined; // reseteamos el array
  }

  // obtiene las estadisticas del usuario y las guarda en el localstorage
  getCounters() {
    this._userService.getCounters().subscribe(
      response => {
        localStorage.setItem('stats', JSON.stringify(response));
        this.status = 'success';
        //console.log(response);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  // recupera los archivos del input file
  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

}
