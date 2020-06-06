import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, BehaviorSubject} from "rxjs";

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
  model$ = new BehaviorSubject<ICCGroupInterface[]>(null);
  controls$ = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
  }

  listModels() {
    return this.http.get<string[]>('api/listmodels');
  }

  loadModel(synthmodel: string): Observable<any> {
    const params = new HttpParams().set('model', synthmodel);
    let ccAttr = {};

    this.http.get<ICCGroupInterface[]>('api/model', {params: params}).subscribe(model$ => {
      this.model$.next(model$);
      let itemId = 0;
      for (let group of model$) {
        for (let attr of group.ccm) {
          ccAttr[itemId] = attr;
          attr.itemId = itemId++;
        }
      }
      this.controls$.next(ccAttr);
    });
    return this.controls$;
  }
}
