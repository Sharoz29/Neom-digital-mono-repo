import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { endpoints } from './endpoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatapageService {
  dataPageUrl = endpoints.BASEURL + endpoints.DATA;
  pxResults: Object= new Object();

  constructor(private http: HttpClient) { }

  getDataPage(id: string, dpParams: Object | null):Observable<HttpResponse<any>> {
    return this.http.get(this.dataPageUrl + "/" + id, {
      observe: "response",
      params: dpParams,
    } as any) as any;
  }

  getResults(response: { pxResults: any; }) {
    return response.pxResults;
  }
}
