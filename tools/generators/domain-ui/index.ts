import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';

import {NormalizedSchema, PageGeneratorSchema} from './schema';
import {updateNavigation, updateUiImports} from './libs/updateUiImports';
import {dashToUnderscore} from './libs/utils';

function normalizeOptions(
  tree: Tree,
  options: PageGeneratorSchema
): NormalizedSchema {
  const uiFeatureRoot = `${getWorkspaceLayout(tree).libsDir}/ui-features`;
  const cmsRoot = `${getWorkspaceLayout(tree).appsDir}/cms`;

  return {
    ...options,
    uiFeatureRoot,
    cmsRoot,
  };
}

function addnUpdateUiFiles(tree: Tree, options: NormalizedSchema) {
  const _options = {
    name: options.name,
  };
  const templateOptions = {
    ...options,
    ...names(options.name),
    name: names(options.name).fileName,
    template: '',
  };

  const pageDir = path.join(
    options.uiFeatureRoot,
    `/src/lib/${names(options.name).fileName}`
  );

  // Create UI Feature Modules
  generateFiles(
    tree,
    path.join(__dirname, 'uiFiles'),
    pageDir,
    templateOptions
  );

  // Create CMS Route and Navigation
  if (options.createUiRouteInCms) {
    updateUiImports(
      tree,
      options,
      path.join(options.cmsRoot, `/src/app/app.routing.module.ts`)
    );

    updateNavigation(
      tree,
      options,
      path.join(options.cmsRoot, `/src/app/navigation/navigation.ts`)
    );
  }
}

export async function domainUiGenerator(
  tree: Tree,
  options: PageGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);
  addnUpdateUiFiles(tree, normalizedOptions);

  await formatFiles(tree);
}

export default domainUiGenerator;
