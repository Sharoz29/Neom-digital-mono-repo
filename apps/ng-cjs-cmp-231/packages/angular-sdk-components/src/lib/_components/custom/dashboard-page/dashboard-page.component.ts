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
      console.log(this.regionLabels$);
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
          // console.log('hello', content);
          PCore.getDataApiUtils()
            .getData(content.defaultListDataView, options)
            .then(res => res.data.data);

          // .then(res => console.log(res.data));
        });
    });
  }
}
