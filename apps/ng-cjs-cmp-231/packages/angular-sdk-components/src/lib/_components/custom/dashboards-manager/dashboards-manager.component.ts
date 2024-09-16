import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCard, MatCardModule, MatCardTitle } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Utils } from 'packages/angular-sdk-components/src/public-api';

@Component({
  selector: 'dashboards-manager',
  templateUrl: './dashboards-manager.component.html',
  styleUrls: ['./dashboards-manager.component.scss'],
  standalone: true,
  imports: [MatTable, MatCard, MatCardTitle, MatProgressSpinnerModule, CommonModule, MatCardModule, MatTableModule, MatIconModule]
})
export class DashboardsManager {
  @Input() pConn$: typeof PConnect;

  configProps$: any;
  title$: string;
  titleIcon$: string;
  viewResources$: any;
  viewConfigProps$: any;
  queryParams = {
    select: [
      {
        field: 'pyClassName'
      },
      {
        field: 'pxCreateDateTime'
      },
      {
        field: 'pxCreateOperator'
      },
      {
        field: 'pzInsKey'
      },
      {
        field: 'pyLabel'
      },
      {
        field: 'pxViewType'
      },
      {
        field: 'pyRuleName'
      },
      {
        field: 'pyVisibilityAccessGroup'
      },
      {
        field: 'pxUpdateOperator'
      },
      {
        field: 'pxUpdateOpName'
      },
      {
        field: 'pxUpdateDateTime'
      },
      {
        field: 'pyViewDescription'
      },
      {
        field: 'pyVisibilityType'
      },
      {
        field: 'pxCreateOperator:pyUserName'
      },
      {
        field: 'pxUpdateOperator:pyUserName'
      }
    ],
    sortBy: [
      {
        field: 'pxUpdateDateTime',
        type: 'DESC'
      }
    ]
  };
  dataSource = new MatTableDataSource<any>([]);
  dataLoaded: boolean = false;
  displayedColumns: string[] = ['name', 'description', 'visibility', 'updateDate', 'updateOperator'];

  constructor(private utils: Utils) {}

  ngOnInit(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.viewResources$ = PCore.getViewResources().fetchViewResources(this.pConn$.getCurrentView(), this.pConn$, '');
    this.viewConfigProps$ = this.pConn$.resolveConfigProps(this.viewResources$).config;
    this.title$ = this.viewConfigProps$.title;
    this.titleIcon$ = this.utils.getSDKStaticContentUrl().concat(`assets/icons/${this.viewConfigProps$.icon}.svg`);
    PCore.getDataPageUtils()
      .getDataAsync('D_pzDashboardsList', 'app/primary_1', {}, '', this.queryParams)
      .then(res => {
        this.dataLoaded = true;
        this.dataSource.data = res.data;
      });
  }

  formatReadableDate(dateString: string) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  }
}
