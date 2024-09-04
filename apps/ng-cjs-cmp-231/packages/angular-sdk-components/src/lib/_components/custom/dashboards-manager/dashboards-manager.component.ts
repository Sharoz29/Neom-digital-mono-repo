import { Component, Input } from '@angular/core';

@Component({
  selector: 'dashboards-manager',
  templateUrl: './dashboards-manager.component.html',
  styleUrls: ['./dashboards-manager.component.scss'],
  standalone: true
})
export class DashboardsManager {
  @Input() Pconn$: typeof PConnect;
}
