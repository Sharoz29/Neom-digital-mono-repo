import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCard, MatCardModule, MatCardTitle } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Utils } from 'packages/angular-sdk-components/src/public-api';

@Component({
  selector: 'explore-data-page',
  templateUrl: './explore-data.component.html',
  styleUrls: ['./explore-data.component.scss'],
  standalone: true,
  imports: [MatTable, MatCard, MatCardTitle, CommonModule, MatProgressSpinnerModule, CommonModule, MatCardModule, MatTableModule, MatIconModule]
})
export class ExploreDataPage {
  @Input() pConn$: typeof PConnect;
  @Input() payload: any;

  configProps$: any;
  title$: string;
  titleIcon$: string;
  insights: any[];
  filteredInsights: any[];
  uniqueLabelsArray: any[];
  displayedColumns: string[] = ['name', 'description', 'visibility', 'updateDate', 'updateOperator'];
  dataSource = new MatTableDataSource<any>([]);
  dataLoaded = false;

  constructor(private utils: Utils) {}

  ngOnInit(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.title$ = this.configProps$.title;
    this.titleIcon$ = this.utils.getSDKStaticContentUrl().concat(`assets/icons/${this.configProps$.icon}.svg`);

    PCore.getAnalyticsUtils()
      .getInsightIDs()
      .then(res => {
        this.insights = res.data.pyInsights;
        let f: any[] = [];
        this.insights.forEach(ins => {
          PCore.getAnalyticsUtils()
            .getInsightByID(ins.pyID)
            .then(res => {
              f.push(res.data.pyInsights[0]);
            });
        });
        this.filteredInsights = f;

        setTimeout(() => {
          const labels = this.filteredInsights.reduce((acc, current) => {
            if (acc.has(current.pyClassLabel)) {
              acc.get(current.pyClassLabel).push(current);
            } else {
              acc.set(current.pyClassLabel, [current]);
            }
            return acc;
          }, new Map<string, any[]>());

          this.uniqueLabelsArray = Array.from(labels, ([title, items]) => ({ title, items, showInsight: false }));

          console.log(this.uniqueLabelsArray);
          this.dataSource.data = this.uniqueLabelsArray;
          this.dataLoaded = true;
        }, 5000);
      });
  }
  toggleInsights(insight) {
    insight.showInsight = !insight.showInsight;
  }

  formatReadableDate(dateString) {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(9, 11);
    const minute = dateString.substring(11, 13);
    const second = dateString.substring(13, 15);

    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);

    const options = {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      second: '2-digit' as const
    };

    return date.toLocaleString('en-US', options);
  }
}
