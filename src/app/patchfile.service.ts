import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ICCMessageInterface} from "./synthmodel.service";

export interface IPatchDefinition {
    patchname: string;
    data: ICCMessageInterface[];
}

@Injectable({
    providedIn: 'root'
})
export class PatchfileService {
    patchfiles = new BehaviorSubject<string[]>(null);

    constructor(private http: HttpClient) {
    }

    getPatchfiles():Observable<string[]> {
        return this.http.get<string[]>('api/list')
    }

    savePatchFile(patch: IPatchDefinition) {
        this.http.post<IPatchDefinition>('api/store', patch).subscribe(result => {
            console.log(result);
        });
    }

    loadPatchFile(patchname: string): Observable<IPatchDefinition> {
        let params = new HttpParams().set('name', patchname);
        return this.http.get<IPatchDefinition>('api/load', {params: params});
    }
}
