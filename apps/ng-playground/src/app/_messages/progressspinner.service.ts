import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProgressSpinnerService {

  private subject = new Subject<any>();
 
  // sending 
  //  bShow - true: show spinner, false: hide spinner
  //
  sendMessage(bShow: boolean) {
      this.subject.next({ show: bShow});
  }

  clearMessage() {
      this.subject.next(null);
  }

  getMessage(): Observable<any> {
      return this.subject.asObservable();
  }
}
