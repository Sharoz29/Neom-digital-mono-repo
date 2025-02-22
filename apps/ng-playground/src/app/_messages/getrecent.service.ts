import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetRecentService {

  private subject = new Subject<any>();
 
  sendMessage(sCaseID: string) {
      this.subject.next({ caseID: sCaseID});
  }

  clearMessage() {
      this.subject.next(null);
  }

  getMessage(): Observable<any> {
      return this.subject.asObservable();
  }
}
