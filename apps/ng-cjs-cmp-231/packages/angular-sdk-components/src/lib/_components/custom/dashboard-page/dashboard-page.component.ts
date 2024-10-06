import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardModule, MatCardTitle } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ComponentMapperComponent, Utils } from 'packages/angular-sdk-components/src/public-api';
import { getFilterExpression, getFormattedDate, createFilter, combineFilters } from '../../../_helpers/filter-utils';
import { MatInputModule } from '@angular/material/input';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  standalone: true,
  imports: [
    MatTable,
    MatCard,
    MatCardTitle,
    MatProgressSpinnerModule,
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatButtonModule,
    MatNativeDateModule,
    NgxChartsModule,
    forwardRef(() => ComponentMapperComponent)
  ]
})
export class DashboardPage {
  @Input() pConn$: typeof PConnect;
  @Input() filtersFormGroup$: FormGroup = new FormGroup({
    start: new FormControl(''),
    end: new FormControl('')
  });

  configProps$: any;
  title$: string;
  titleIcon$: string;
  viewResources$: any;
  children$: any;
  childrenConfigProps$: any;
  childrenViewResources$: any;
  filters$: any;
  viewChildrens$: any;
  regionLabels$: string[][] = [];
  pieChartColorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#33FFF3', '#F3FF33']
  };
  lineChartColorScheme: Color = {
    name: 'lineChartScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#FF5733', '#33FF57', '#3357FF', '#FF33A6', '#33FFF3', '#F3FF33', '#E74C3C', '#8E44AD', '#2ECC71'] // Add more custom colors as needed
  };
  barChartColorScheme: Color = {
    name: 'barChartScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#1E90FF', '#FFD700', '#FF6347', '#32CD32', '#FF4500', '#7B68EE', '#20B2AA', '#FF69B4', '#FFA500'] // Add or change colors as needed
  };
  pieChartData: any;
  lineChartData: any;
  dailyTaskData: any;
  appointmentByFilterData: any;
  chartTypes: any[] = [];

  constructor(private utils: Utils) {}

  ngOnInit(): void {
    this.updateSelf();
    this.handleFilters();
    this.viewChildrens$ = this.children$.filter(child => child.name !== 'Filters');
    this.viewChildrens$.forEach((child, index) => this.handleRegions(child, index));
  }
  handleFilters() {
    if (this.filtersFormGroup$ != null) {
      this.filtersFormGroup$.addControl('start', new FormControl(null));
      this.filtersFormGroup$.addControl('end', new FormControl(null));
    }
    this.filters$.children.forEach(child => {
      const controlName = this.getControlName(child);
      if (!this.filtersFormGroup$.get(controlName)) {
        this.filtersFormGroup$.addControl(controlName, new FormControl(null));
      }
    });
  }

  getControlName(child: any): string {
    return child.config ? child.config.value : '';
  }

  clearFilters() {
    this.filtersFormGroup$.reset();
    PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.EVENT_DASHBOARD_FILTER_CLEAR_ALL);
  }

  dateRangeChangeHandler(field) {
    const { filterId, name } = field;
    const start = (this.filtersFormGroup$?.get('start') as FormControl).value;
    const end = (this.filtersFormGroup$?.get('end') as FormControl).value;
    if (start && end) {
      let startDate = getFormattedDate(start);
      let endDate = getFormattedDate(end);

      if (startDate && endDate) {
        startDate = `${startDate}T00:00:00`;
        endDate = `${endDate}T00:00:00`;
        const startFilter = createFilter(startDate, name, 'GT');
        const endFilter = createFilter(endDate, name, 'LT');

        const filterData = {
          filterId,
          filterExpression: combineFilters([startFilter, endFilter], null)
        };
        PCore.getPubSubUtils().publish(PCore.getConstants().PUB_SUB_EVENTS.EVENT_DASHBOARD_FILTER_CHANGE, filterData);
      }
    }
  }

  updateSelf() {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.title$ = this.title$ = this.configProps$.title;
    this.viewResources$ = PCore.getViewResources().fetchViewResources(this.pConn$.getCurrentView(), this.pConn$, '');
    this.titleIcon$ = this.utils.getSDKStaticContentUrl().concat(`assets/icons/${this.configProps$.icon.split('-').slice(-2).join('-')}.svg`);
    this.children$ = this.viewResources$.children;
    [this.filters$] = this.children$?.filter(child => child.name === 'Filters');
  }
  labelExtractor(label: string): string {
    return label.startsWith('@L ') ? label.slice(3) : label;
  }

  handleRegions(region, index) {
    this.regionLabels$[index] = [];
    region.children.forEach(child => {
      const childProps = this.pConn$.getConfigProps(child.config);
      const childLabel = childProps.label;
      this.regionLabels$[index].push(childLabel);
      PCore.getAnalyticsUtils()
        .getInsightByID(childProps.id)
        .then(response => {
          const content = JSON.parse(response.data?.pyInsights[0].pyContent);
          const aggregationID = content?.query?.measures[0]?.id;
          const calculationID = content?.query?.dimensions[0]?.id;

          const options = {
            paging: {
              maxResultsToFetch: 5000
            },
            query: {
              aggregations: {
                [aggregationID]: {
                  field: content?.query?.measures[0]?.field?.fieldID,
                  summaryFunction: content?.query?.measures[0]?.aggregation.toUpperCase()
                }
              },
              ...(content?.query?.filters.length > 0 &&
                (content.defaultListDataView !== 'D_pyAllWork'
                  ? {
                      filter: {
                        logic: 'F1 AND (F2 AND F3)',
                        filterConditions: {
                          F1: {
                            lhs: {
                              field: 'pxWorkGroup'
                            },
                            comparator: 'EQ',
                            rhs: {
                              value: 'default@LCS'
                            },
                            ignoreCase: true
                          },
                          F2: {
                            lhs: {
                              field: 'pxCreateDateTime'
                            },
                            comparator: 'GTE',
                            rhs: {
                              value: '2024-09-29T08:23:05.000Z'
                            }
                          },
                          F3: {
                            lhs: {
                              field: 'pxCreateDateTime'
                            },
                            comparator: 'LTE',
                            rhs: {
                              value: '2024-09-30T08:23:05.000Z'
                            }
                          }
                        }
                      }
                    }
                  : {
                      filter: {
                        logic: 'F1',
                        filterConditions: {
                          F1: {
                            lhs: {
                              field: 'pxCreateDateTime'
                            },
                            comparator: 'GTE',
                            rhs: {
                              value: '2024-08-30T09:39:50.000Z'
                            }
                          }
                        }
                      },
                      calculations: {
                        [calculationID]: {
                          function: 'DAYS',
                          parameters: [
                            {
                              field: 'pxCreateDateTime'
                            }
                          ]
                        }
                      }
                    })),
              select:
                content.defaultListDataView === 'D_pyAllWork'
                  ? [
                      {
                        aggregation: aggregationID
                      },
                      {
                        calculation: calculationID
                      },
                      {
                        field: content?.query?.dimensions[1]?.field?.fieldID
                      }
                    ]
                  : [
                      {
                        aggregation: aggregationID
                      },
                      {
                        field: content.query?.dimensions?.[0]?.field?.fieldID
                      }
                    ],
              sortBy:
                content.defaultListDataView === 'D_pyAllWork'
                  ? [
                      {
                        calculation: calculationID,
                        type: 'ASC'
                      },
                      {
                        field: content?.query?.dimensions[1]?.field?.fieldID,
                        type: 'ASC'
                      }
                    ]
                  : [
                      {
                        aggregation: aggregationID,
                        type: 'DESC'
                      }
                    ],
              useExtendedTimeout: false
            }
          };
          PCore.getDataApiUtils()
            .getData(content.defaultListDataView, options)
            .then(res => this.renderChart(content, res.data.data, aggregationID, calculationID));
        });
    });
  }

  renderChart(content, data, aggregationID, calculationID) {
    const chartType = content?.settings?.charts[0].type;
    this.chartTypes.push(chartType);
    switch (chartType) {
      case 'COLUMN':
        this.renderBarChart(content.details.title, data, aggregationID);
        break;
      case 'MULTI_LINE':
        this.renderLineChart(data, aggregationID, calculationID);
        break;
      case 'PIE':
        this.renderPieChart(data, aggregationID);
        break;
      default:
        console.log('Chart type not supported');
    }
  }

  renderBarChart(name, data, aggregationID) {
    const transformData = (data, aggregationID) => {
      return data?.map(item => ({
        name: item['pxAssignedUserName'] || 'Unknown',
        value: parseInt(item[aggregationID], 10) || 0
      }));
    };
    if (name === 'Daily Task for NP') {
      this.dailyTaskData = transformData(data, aggregationID);
    } else if (name === 'Appointments by Status') {
      this.appointmentByFilterData = [];
    }
  }

  renderLineChart(data, aggregationID, calculationID) {
    const formattedData = {};

    data.forEach(item => {
      const caseType = item['pyCaseTypeInformation:pyLabel'] || 'Unknown';
      const date = item[calculationID] || 'Unknown Date';
      const value = parseInt(item[aggregationID], 10) || 0;

      if (!formattedData[caseType]) {
        formattedData[caseType] = [];
      }

      formattedData[caseType].push({
        name: date,
        value: value
      });
    });

    const result = Object.keys(formattedData).map(caseType => ({
      name: caseType,
      series: formattedData[caseType]
    }));

    this.lineChartData = result;
  }

  renderPieChart(data, aggregationID) {
    const formattedData = data.map(item => ({
      name: item['pxCreateOperator:pyUserName'] || 'Unknown',
      value: parseInt(item[aggregationID], 10) || 0
    }));

    this.pieChartData = formattedData;
  }
}
