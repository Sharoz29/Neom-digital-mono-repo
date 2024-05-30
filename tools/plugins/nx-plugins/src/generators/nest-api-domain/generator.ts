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
import { updateIndexImports, updateModuleImports } from '../../utils/moduleImports';

export async function nestApiDomainGenerator(
  tree: Tree,
  options: NestApiDomainGeneratorSchema
) {
  const apiRoot = `libs/api-libs/src/lib/${names(options.name).fileName}`;
  const domainRoot = `libs/domain-libs/src/lib/${names(options.name).fileName}`;

  if(options.api) {
    generateFiles(tree, path.join(__dirname, 'api_files'), apiRoot, {
      ...options,
      ...names(options.name),
      name: names(options.name).fileName,
    });
  
    updateModuleImports(
      tree,
      options,
      'Api',
      'libs/api-libs/src/lib/api-libs.module.ts'
    );
  }

  if(options.models) {
    generateFiles(tree, path.join(__dirname, 'models_files'), domainRoot, {
      ...options,
      ...names(options.name),
      name: names(options.name).fileName,
    });
    updateIndexImports(tree, options, 'libs/models/src/index.ts');
  }


  if(options.domain) {
    generateFiles(tree, path.join(__dirname, 'domain_files'), domainRoot, {
      ...options,
      ...names(options.name),
      name: names(options.name).fileName,
    });
    updateModuleImports(
      tree,
      options,
      'Domain',
      'libs/domain-libs/src/lib/domain-libs.module.ts'
    );
  }
  await formatFiles(tree);
}

export default nestApiDomainGenerator;
