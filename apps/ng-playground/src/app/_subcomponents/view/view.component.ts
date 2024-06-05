import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ReferenceHelper } from '../../_helpers/reference-helper';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})


export class ViewComponent implements OnInit {

  showView$= false;


  @Input() viewComp : any;
  @Input() formGroup!: FormGroup;
  @Input() noLabel!: boolean;
  @Input() CaseID!: string;
  @Input() RefType$!: string;

  viewName$!: String;
  viewTitle$!: String;
  groups$!: Array<any>;

  constructor(private refHelper: ReferenceHelper) { 


  }

  ngOnInit() {

    if (this.viewComp) {
      if (this.viewComp.visible == undefined) {
        this.viewComp.visible = true;
      }

      if (this.viewComp.visible) {
        this.showView$ = true;
        this.viewTitle$ = this.refHelper.htmlDecode(this.viewComp.title);
        this.groups$ = this.viewComp.groups;
        this.viewName$ = this.viewComp.name;
      } 
    }

  }
}
