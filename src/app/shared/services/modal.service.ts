import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private newRequestSubject = new Subject<void>();
  
  newRequest$ = this.newRequestSubject.asObservable();

  openNewRequestModal() {
    this.newRequestSubject.next();
  }
}
