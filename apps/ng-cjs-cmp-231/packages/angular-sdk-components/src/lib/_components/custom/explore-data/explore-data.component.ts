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
          console.log(this.filteredInsights, 'checking');
          const labelCount = this.filteredInsights.reduce((acc, current) => {
            if (acc.has(current.pyClassLabel)) {
              acc.set(current.pyClassLabel, acc.get(current.pyClassLabel) + 1);
            } else {
              acc.set(current.pyClassLabel, 1);
            }
            return acc;
          }, new Map<string, number>());

          this.uniqueLabelsArray = Array.from(labelCount, ([title, count]) => ({ title, count }));

          console.log(this.uniqueLabelsArray);
          this.dataSource.data = this.uniqueLabelsArray;
          this.dataLoaded = true;
        }, 10000);
      });
  }
}
