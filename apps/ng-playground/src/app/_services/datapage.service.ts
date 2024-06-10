import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { endpoints } from './endpoints';
import { Observable } from 'rxjs';
import { DataApiControllerClient } from '@neom/ng-ui';

@Injectable({
  providedIn: 'root',
})
export class DatapageService {
  dataPageUrl = endpoints.BASEURL + endpoints.DATA;
  pxResults: Object = new Object();

  constructor(
    private readonly _datapageClientController: DataApiControllerClient
  ) {}

  getDataPage(
    id: string,
    dpParams: Record<string, any>
  ): Observable<HttpResponse<any>> {
    return this._datapageClientController.getData(id, dpParams) as any;
  }

  getResults(response: { pxResults: any }) {
    return response.pxResults;
  }
}
