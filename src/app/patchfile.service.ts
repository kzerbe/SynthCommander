import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";


export interface IControlParameter {
    index: number;
    parameterId: number;
    value: number;
}

export interface IPatchDefinition {
    patchname: string;
    data: IControlParameter[];
}


@Injectable({
    providedIn: 'root'
})
export class PatchfileService {
    patchfiles = new BehaviorSubject<string[]>(null);

    constructor(private http: HttpClient) {
    }

    getPatchfiles() {
        this.http.get<string[]>('api/list').subscribe(patt => {
            this.patchfiles.next(patt)
        })
        return this.patchfiles;
    }

    savePatchFile(patch: IPatchDefinition) {
        console.log(patch);
        this.http.post<IPatchDefinition>('api/store', patch).subscribe(result => {
            console.log(result);
        });
    }
}
