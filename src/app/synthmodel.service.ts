import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";

export interface ICCMessageInterface {
  itemId?: number;
  attr: string;
  key: number;
  value: number;
}

export interface ICCGroupInterface {
  id: string;
  name: string;
  ccm: ICCMessageInterface[];
}

@Injectable({
  providedIn: 'root'
})
export class SynthmodelService {
  constructor(private http: HttpClient) {
  }

  loadModelFile(synthmodel: string): Observable<ICCGroupInterface[]> {
    let params = new HttpParams().set('model', synthmodel );
    return this.http.get<ICCGroupInterface[]>('api/model', {params: params});
  }
}
