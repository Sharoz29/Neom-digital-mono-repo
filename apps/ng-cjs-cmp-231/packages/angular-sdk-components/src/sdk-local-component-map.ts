// Statically load all "local" components that aren't yet in the npm package
import { DashboardPage } from './lib/_components/custom/dashboard-page/dashboard-page.component';
import { DashboardsManager } from './lib/_components/custom/dashboards-manager/dashboards-manager.component';
import { ExploreDataPage } from './lib/_components/custom/explore-data/explore-data.component';
import { FollowersComponent } from './lib/_components/custom/followers/followers.component';
import { Pega_Extensions_FormFullWidth } from './lib/_components/custom/form-full-width/form-full-width.component';
import { InsightComponent } from './lib/_components/custom/insight/insight.component';
import { RelatedCases } from './lib/_components/custom/related-cases/related-cases.component';
import { Pega_Extensions_SignatureCapture } from './lib/_components/custom/signature-capture/signature-capture.component';
import { TaskChart } from './lib/_components/custom/task-chart/task-chart.component';

/* import end - DO NOT REMOVE */

// localSdkComponentMap is the JSON object where we'll store the components that are
// found locally. If not found here, we'll look in the Pega-provided component map

const localSdkComponentMap = {
  /* map end - DO NOT REMOVE */
  Insight: InsightComponent,
  TaskChart: TaskChart,
  ExploreDataPage: ExploreDataPage,
  DashboardsManager: DashboardsManager,
  Followers: FollowersComponent,
  RelatedCases: RelatedCases,
  DashboardPage: DashboardPage,
  Pega_Extensions_SignatureCapture: Pega_Extensions_SignatureCapture,
  Pega_Extensions_FormFullWidth: Pega_Extensions_FormFullWidth
};

export default localSdkComponentMap;
