import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ComponentMapperComponent } from '../../../_bridge/component-mapper/component-mapper.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'insight',
  templateUrl: './insight.component.html',
  styleUrls: ['./insight.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent)]
})
export class InsightComponent implements OnInit {
  @Input() pConn$: typeof PConnect;

  configProps$: any;
  insightId$: string;
  insightData$: any;
  insightName$: string;
  content$: any;

  ngOnInit() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.insightId$ = this.configProps$.id;

    PCore.getAnalyticsUtils()
      .getInsightByID(this.insightId$)
      .then(response => {
        this.insightData$ = response.data.pyInsights[0];
        this.insightName$ = this.insightData$.pyName;
        this.content$ = JSON.parse(this.insightData$.pyContent);
      });
  }
} 
