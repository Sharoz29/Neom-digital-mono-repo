import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RenameTabService {

  private subject = new Subject<any>();
 
  sendMessage(sTabName: string, sNewTabName: string) {
      this.subject.next({ tabName: sTabName, newTabName: sNewTabName });
  }

  clearMessage() {
      this.subject.next(null);
  }

  getMessage(): Observable<any> {
      return this.subject.asObservable();
  }
}
