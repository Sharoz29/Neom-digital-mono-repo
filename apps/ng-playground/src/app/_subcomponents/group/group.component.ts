import { Component, Input } from '@angular/core';
import { GetGroupsService } from '../../_messages/getgroups.service';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent  {


  showGroups= false;
  message: any;


  @Input() groups!: Array<any>;
  @Input() formGroup!: FormGroup;
  @Input() noLabel!: boolean;
  @Input() CaseID!: string;
  @Input() RefType$!: string;


  constructor(private ggservice: GetGroupsService) { 



  }

  

}
