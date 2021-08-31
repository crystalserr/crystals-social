import { Injectable } from '@angular/core';
import { GLOBAL } from 'src/app/services/global';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  public url: string;

  constructor() {
    this.url = GLOBAL.url;
  }

  // Metodo encargado de la subida de imagenes
  // tanto de publication como de user
  makeFileRequest(
      url: string,
      params: Array<string>,
      files: Array<File>,
      token: string,
      name: string) {

    return new Promise(function(resolve, reject) {
      var formData: any = new FormData();
      var xhr = new XMLHttpRequest()

      for (let i = 0; i < files.length; i++) {
        formData.append(name, files[i], files[i].name);
      }

      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(xhr.response);
          }
        }
      }

      // aqui subimos la imagen en el back
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Authorization', token);
      xhr.send(formData);

    });
  }

}
