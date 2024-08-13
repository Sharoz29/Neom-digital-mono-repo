import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { endpoints } from './endpoints';
import { ReferenceHelper } from '../_helpers/reference-helper';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CaseService {

  refHelper: ReferenceHelper = new ReferenceHelper();
  caseUrl = endpoints.API_URL + endpoints.CASES;
  caseTypeUrl = endpoints.API_URL + endpoints.CASETYPES;

  constructor(private http: HttpClient) { }

  // get a case of given id
  getCase(id: string):Observable<HttpResponse<any>> {
    let caseHeaders = new HttpHeaders();
    caseHeaders = caseHeaders.append('Access-Control-Expose-Headers', "etag");

    return this.http.get(this.caseUrl + "/" + id, {
      observe: "response",
      headers: caseHeaders,
    });
  }

  // get a list of possible case types to create
  getCaseTypes():Observable<HttpResponse<any>> {
    return this.http.get(this.caseTypeUrl, { observe: 'response' });   
  }

  // get a case that is "new" 
  getCaseCreationPage(id: string):Observable<HttpResponse<any>> {
    return this.http.get(this.caseTypeUrl + "/" + id, { observe: 'response' });
  }

  // create a case (with new or skip new)
  createCase(id: string, processName: string | null, content: object):Observable<HttpResponse<any>> {
    const caseBody: any = {};
    caseBody.caseTypeID = id;
    caseBody.processID = processName !== null ? processName : "";
    caseBody.content = content;

    return this.http.post(this.caseUrl, caseBody, { observe: 'response' });   
  }

  // update a case, save to server
  updateCase(caseID: string, eTag: string, actionName: string | number | boolean | null, body: object, pageInstr: any, updatedFields: Set<unknown>, postableFields: Set<unknown>):Observable<HttpResponse<any>> {
    let caseParams = new HttpParams();
    if (actionName && actionName != "") {
      caseParams = caseParams.append('actionID', actionName);
    }

    let caseHeaders = new HttpHeaders();
    caseHeaders = caseHeaders.append('If-Match', '"' + eTag + '"');
    
    const oContent = this.refHelper.getPostContent(body, updatedFields, postableFields);

    const encodedId = encodeURI(caseID);

    if (pageInstr.pageInstructions.length > 0) {
      return this.http.put(
        this.caseUrl + "/" + encodedId,
        { content: oContent, pageInstructions: pageInstr.pageInstructions },
        { observe: "response", params: caseParams, headers: caseHeaders }
      );  
    } else {
      return this.http.put(
        this.caseUrl + "/" + encodedId,
        { content: oContent },
        { observe: "response", params: caseParams, headers: caseHeaders }
      );  
    } 
  }

  // refresh a case, post data, but no save
  refreshCase(myCase: { etag: string | string[]; ID: string; }, body: any):Observable<HttpResponse<any>> {
    let caseHeaders = new HttpHeaders();
    caseHeaders = caseHeaders.append('If-Match', myCase.etag);

    const oContent = this.refHelper.getPostContent(body);
    
    const encodedId = encodeURI(myCase.ID);

    return this.http.put(
      this.caseUrl + "/" + encodedId + endpoints.REFRESH,
      { content: oContent },
      { observe: "response", headers: caseHeaders }
    );     
  }

  // get a case with a given page (new, review, confirm)
  getPage(caseID: string, pageID: string):Observable<HttpResponse<any>> {
    return this.http.get(
      this.caseUrl + "/" + caseID + endpoints.PAGES + "/" + pageID,
      { observe: "response" }
    );
  }

  // get a case and a view layout
  getView(caseID: string, viewID: string):Observable<HttpResponse<any>> {
    return this.http.get(
      this.caseUrl + "/" + caseID + endpoints.VIEWS + "/" + viewID,
      { observe: "response" }
    ); 
  }

  cases():Observable<HttpResponse<any>> {
    return this.http.get(this.caseUrl, { observe: "response" });
  }

  getAttachments(caseID: any):Observable<HttpResponse<any>> {
    const url = `${endpoints.API_URL}/cases/${caseID}/attachments`;
    return this.http.get(url, { observe: "response" });
  }
  
  uploadAttachments(formData: FormData):Observable<HttpResponse<any>> {
    const url = `${endpoints.API_URL}/attachments/upload`;
    return this.http.post(url, formData, {observe: 'response'});
  }

  saveAttachments(data: any, caseID: any):Observable<HttpResponse<any>> {
    const attachmentData = { attachments: data };
    const url = `${endpoints.API_URL}/cases/${caseID}/attachments`;
    return this.http.post(url, attachmentData) as any;
  }
  
  deleteAttachment(file: { ID: any; }):Observable<HttpResponse<any>> {
    const url = `${endpoints.API_URL}/attachments/${file.ID}`;
    return this.http.delete(url, { observe: "response" });
  }
  
  downloadAttachment(file: { fileName?: any; ID: any; }):Observable<HttpResponse<any>> {
    const url = `${endpoints.API_URL}/attachments/${file.ID}`;
    return this.http.get(url, { observe: "response", responseType: 'text' });
  }
  
}
