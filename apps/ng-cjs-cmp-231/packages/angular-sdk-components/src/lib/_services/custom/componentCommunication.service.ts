import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComponentCommunicationService {
  private updateSelfSource = new Subject<void>();
  updateSelf$ = this.updateSelfSource.asObservable();

  triggerUpdate() {
    this.updateSelfSource.next();
  }
}
