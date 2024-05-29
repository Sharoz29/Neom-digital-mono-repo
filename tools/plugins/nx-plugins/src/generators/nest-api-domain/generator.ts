import {
  addProjectConfiguration,
  getProjects,
  formatFiles,
  generateFiles,
  Tree,
  names,
  updateProjectConfiguration,
} from '@nx/devkit';
import * as path from 'path';
import { NestApiDomainGeneratorSchema } from './schema';

export async function nestApiDomainGenerator(
  tree: Tree,
  options: NestApiDomainGeneratorSchema
) {
  

  const apiRoot = `libs/api-libs/${names(options.name).fileName}`;
  const domainRoot = `libs/domain-libs/${names(options.name).fileName}`;

  
  generateFiles(tree, path.join(__dirname, 'api_files'), apiRoot, 
  {
    ...options,
      ...names(options.name),
      name: names(options.name).fileName,
  }
);
  generateFiles(tree, path.join(__dirname, 'domain_files'), domainRoot, 
    {
      ...options,
      ...names(options.name),
      name: names(options.name).fileName,
    }
  );
  await formatFiles(tree);
}

export default nestApiDomainGenerator;
