import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { ComponentMapperComponent, Utils } from 'packages/angular-sdk-components/src/public-api';

@Component({
  selector: 'followers',
  templateUrl: './followers.component.html',
  styleUrls: ['./followers.component.scss'],
  standalone: true,
  imports: [CommonModule, forwardRef(() => ComponentMapperComponent), MatIconModule, MatIcon]
})
export class FollowersComponent implements OnInit {
  @Input() pConn$: typeof PConnect;

  configProps$: any;
  title$: string;
  titleIcon$: any;
  viewResources$: any;
  viewConfigProps$: any;
  caseFollowers$: any;
  caseID$: string;
  plusIcon: string;

  constructor(private utils: Utils) {}

  ngOnInit(): void {
    this.plusIcon = this.utils.getSDKStaticContentUrl().concat('/assets/icons/plus.svg');
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.pConn$.getCurrentView();
    this.viewResources$ = PCore.getViewResources().fetchViewResources(this.pConn$.getCurrentView(), this.pConn$, '');
    this.viewConfigProps$ = this.pConn$.resolveConfigProps(this.viewResources$).config;
    this.title$ = this.configProps$.label;
    this.titleIcon$ = this.utils.getSDKStaticContentUrl().concat(`assets/icons/${this.viewConfigProps$.icon}.svg`);
    this.caseID$ = this.pConn$.getCaseSummary().ID;

    this.fetchCaseFollowers();
  }
  fetchCaseFollowers(): void {
    PCore.getCaseFollowerApi()
      .getCaseFollowers(this.caseID$, '')
      .then(res => {
        this.caseFollowers$ = res;
      })
      .catch(error => {
        console.error('Error fetching case followers:', error);
      });
  }

  getCaseFollowers(): any {
    return this.caseFollowers$;
  }
  getInitials(fullName) {
    if (!fullName) return '';

    const nameParts = fullName.split(' ');

    const initials = nameParts.map(part => part[0].toUpperCase()).join('');

    return initials;
  }
}
