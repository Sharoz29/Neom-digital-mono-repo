import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent  {

  @Input() CurrentCase: any;
  
  stages$!: Array<any>;

  constructor() { 
    // 
  }

  

  ngOnChanges()	{
    this.stages$ = this.CurrentCase.stages;
    const stageSize = this.CurrentCase.stages.length;
    let count = 0;
    for (const oStage of this.stages$) {

      if (oStage.name === this.CurrentCase.content.pxCurrentStageLabel) {
        oStage["currentStage"] = true;
      }
      else {
        oStage["currentStage"] = false;
      }
      count++;
      if (count < stageSize) {
        oStage["last"] = false;
      }
      else {
        oStage["last"] = true;
      }
     } 
  }


}
