import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BehaviorSubject  } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetAttachmentsService {
  
  private showAttachments: boolean = localStorage.getItem("showAttachments") == "true";
  private subject = new BehaviorSubject<any>({showAttachments: this.showAttachments});
 
  sendMessage(showAttachments: boolean) {
    this.subject.next({showAttachments: showAttachments});
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }
}
