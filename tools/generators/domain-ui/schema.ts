export interface PageGeneratorSchema {
  name: string;
  createUiRouteInCms?: boolean;
}

export interface NormalizedSchema extends PageGeneratorSchema {
  uiFeatureRoot: string;
  cmsRoot: string;
}
