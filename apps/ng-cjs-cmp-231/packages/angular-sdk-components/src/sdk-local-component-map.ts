// Statically load all "local" components that aren't yet in the npm package
import { DashboardsManager } from './lib/_components/custom/dashboards-manager/dashboards-manager.component';
import { ExploreDataPage } from './lib/_components/custom/explore-data/explore-data.component';
import { InsightComponent } from './lib/_components/custom/insight/insight.component';
import { TaskChart } from './lib/_components/custom/task-chart/task-chart.component';

/* import end - DO NOT REMOVE */

// localSdkComponentMap is the JSON object where we'll store the components that are
// found locally. If not found here, we'll look in the Pega-provided component map

const localSdkComponentMap = {
  /* map end - DO NOT REMOVE */
  Insight: InsightComponent,
  TaskChart: TaskChart,
  ExploreDataPage: ExploreDataPage,
  DashboardsManager: DashboardsManager
};

export default localSdkComponentMap;
