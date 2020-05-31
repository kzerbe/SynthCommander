import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {HttpClient} from "@angular/common/http";


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
}
