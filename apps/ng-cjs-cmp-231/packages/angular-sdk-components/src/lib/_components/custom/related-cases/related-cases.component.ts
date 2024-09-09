import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Utils } from 'packages/angular-sdk-components/src/public-api';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'related-cases',
  templateUrl: './related-cases.component.html',
  styleUrls: ['./related-cases.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, MatIcon]
})
export class RelatedCases {
  @Input() pConn$: typeof PConnect;

  plusIcon: string;
  configProps$: any;
  viewResources$: any;
  title$: string;
  titleIcon$: string;
  viewConfigProps$: any;
  caseID$: string;
  relatedCases$: any;

  constructor(private utils: Utils) {}

  ngOnInit(): void {
    this.plusIcon = this.utils.getSDKStaticContentUrl().concat('/assets/icons/plus.svg');
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.title$ = this.configProps$.label;
    this.viewResources$ = PCore.getViewResources().fetchViewResources(this.pConn$.getCurrentView(), this.pConn$, '');
    this.viewConfigProps$ = this.pConn$.resolveConfigProps(this.viewResources$).config;
    this.titleIcon$ = this.utils.getSDKStaticContentUrl().concat(`assets/icons/case.svg`);
    this.caseID$ = this.pConn$.getCaseSummary().ID;

    this.fetchRelatedCases();
  }
  fetchRelatedCases(): void {
    PCore.getRelatedCasesApi()
      .getRelatedCases(this.caseID$, '')
      .then(res => {
        this.relatedCases$ = res;
      })
      .catch(err => {
        console.error('Error fetching related cases', err);
      });
  }
  idExtractor(id: string) {
    const extractedId = id.split(' ')[1];
    return extractedId;
  }
  formatDate(dateString: string) {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }
  removeRelatedCase(relatedCaseID) {
    PCore.getRelatedCasesApi()
      .removeRelatedCase(this.caseID$, relatedCaseID, '')
      .then(res => {
        if (res.status === 200) {
          this.fetchRelatedCases();
        }
      });
  }
}
