import { Component, Input } from '@angular/core';
import { Utils } from 'packages/angular-sdk-components/src/public-api';

@Component({
  selector: 'dashboards-manager',
  templateUrl: './dashboards-manager.component.html',
  styleUrls: ['./dashboards-manager.component.scss'],
  standalone: true
})
export class DashboardsManager {
  @Input() pConn$: typeof PConnect;

  configProps$: any;
  title$: string;
  titleIcon$: string;
  viewResources$: any;
  viewConfigProps$: any;

  constructor(private utils: Utils) {}

  ngOnInit(): void {
    this.configProps$ = this.pConn$.resolveConfigProps(this.pConn$.getConfigProps());
    this.pConn$.getCurrentView();
    this.viewResources$ = PCore.getViewResources().fetchViewResources(this.pConn$.getCurrentView(), this.pConn$, '');
    this.viewConfigProps$ = this.pConn$.resolveConfigProps(this.viewResources$).config;
    this.title$ = this.viewConfigProps$.title;
    this.titleIcon$ = this.utils.getSDKStaticContentUrl().concat(`assets/icons/${this.viewConfigProps$.icon}.svg`);
  }
}
