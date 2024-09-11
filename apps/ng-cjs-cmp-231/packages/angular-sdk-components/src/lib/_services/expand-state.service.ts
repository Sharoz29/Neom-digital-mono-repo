import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpandStateService {
  private isExpandedSource = new BehaviorSubject<boolean>(false);

  isExpanded$ = this.isExpandedSource.asObservable();

  constructor() {}

  toggleExpand() {

    this.isExpandedSource.next(!this.isExpandedSource.value);
  }

  setExpand(state: boolean) {
    this.isExpandedSource.next(state);
  }

  getExpand(): boolean {
    return this.isExpandedSource.value;
  }
}
