import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

interface Measure {
  id: string;
  aggregation: string;
}

interface Dimension {
  field: {
    displayAs: string;
    name: string;
  };
  id: string;
}

interface ChartProps {
  query: {
    measures: Measure[];
    dimensions: Dimension[];
  };
  settings: {
    aliases: {
      measures: { [key: string]: string };
      dimensions: { [key: string]: string };
    };
    series: { [key: string]: { showValues: boolean } };
  };
  details: {
    title: string;
  };
}
type AppointmentTask = {
  pxUrgencyAssign: number;
  pxProcessName: string;
  pxRefObjectInsName: string;
  pxFlowName: string;
  pxUpdateDateTime: string | null;
  pxTaskLabel: string;
  pxAssignedOperatorID: string;
  pxRefObjectClass: string;
  pyAssignmentStatus: string;
  pyInstructions: string;
  pzInsKey: string;
  pxDeadlineTime: string | null;
  pxUpdateOperator: string | null;
  pxObjClass: string;
  pxGoalTime: string | null;
  pxRefObjectKey: string;
  pxCreateDateTime: string;
  pxAssignedUserName: string;
  pyLabel: string;
  pxIsMultiStep: boolean;
  pyFlowType: string;
};

@Component({
  selector: 'task-chart',
  templateUrl: './task-chart.component.html',
  styleUrls: ['./task-chart.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class TaskChart implements OnInit {
  @Input() content$!: ChartProps;

  chartData: { label: string; value: number }[] = [];
  maxValue: number = 0;
  tasks$!: AppointmentTask[];
  chartTitle: string = '';
  xAxisLabel: string;
  yAxisLabel: string;

  ngOnInit(): void {
    this.xAxisLabel = this.content$.settings.aliases.dimensions['kx0stpszzkhrm8yuf3f'];
    this.yAxisLabel = this.content$.settings.aliases.measures['kx0ss2d4pkk10xgy3lr'];
    PCore.getDataApiUtils()
      // @ts-ignore - 2nd parameter "payload" and 3rd parameter "context" should be optional in getData method
      .getData('D_pyMyWorkList')
      .then(responseData => {
        this.tasks$ = responseData.data.data;
        if (this.content$) {
          this.processData();
          this.chartTitle = this.content$.details.title;
        }
      });
  }

  processData(): void {
    const countMap = this.tasks$?.reduce((acc, obj) => {
      const { pyAssignmentStatus } = obj;
      if (acc[pyAssignmentStatus]) {
        acc[pyAssignmentStatus]++;
      } else {
        acc[pyAssignmentStatus] = 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const result = Object.keys(countMap).map(type => ({
      label: type,
      value: countMap[type]
    }));

    this.chartData = result.map(item => {
      return {
        label: item.label,
        value: item.value
      };
    });

    this.maxValue = Math.max(...this.chartData.map(item => item.value));
  }
}
