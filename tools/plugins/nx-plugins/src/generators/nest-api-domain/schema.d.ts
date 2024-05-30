export interface NestApiDomainGeneratorSchema {
  name: string;
  api: boolean;
  domain: boolean;
  apiProject: string;
  domainProject: string;
  models: boolean;
}
