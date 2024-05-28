export interface PageGeneratorSchema {
  name: string;
  createEndpoints?: boolean;
  createDomainFiles?: boolean;
  createModelFiles?: boolean;
  createUiFeature?: boolean;
  createUiRouteInCms?: boolean;
  createUiRouteInKaiCms?: boolean;
  importInClientApi?: boolean;
  importInKaiGateway?: boolean;
  importInDBWorker?: boolean;
  importInKaiDBWorker?: boolean;
}

export interface NormalizedSchema extends PageGeneratorSchema {
  domainRoot: string;
  modelsRoot: string;
  endPointsRoot: string;
  uiFeatureRoot: string;
  cmsRoot: string;
  kaiCmsRoot: string;
  pyModelsRoot: string;
}
