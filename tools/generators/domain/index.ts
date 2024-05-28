import {
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import {libraryGenerator} from '@nrwl/angular/generators';
import {externalSchematic} from '@angular-devkit/schematics';
import * as path from 'path';
import {updateModelImports} from './libs/updateModelImports';
import {updateApiImports} from './libs/updateApiImports';
import {NormalizedSchema, PageGeneratorSchema} from './schema';
import {updateMapperService} from './libs/updateMapperService';
import {updateDomainImports} from './libs/updateDomainImports';
import {updateNavigation, updateUiImports} from './libs/updateUiImports';
import {dashToUnderscore} from './libs/utils';

function normalizeOptions(
  tree: Tree,
  options: PageGeneratorSchema
): NormalizedSchema {
  const domainRoot = `${getWorkspaceLayout(tree).libsDir}/api-models-domain`;
  const modelsRoot = `${getWorkspaceLayout(tree).libsDir}/api-models`;
  const pyModelsRoot = `${getWorkspaceLayout(tree).libsDir}/py_libs`;
  const endPointsRoot = `${
    getWorkspaceLayout(tree).libsDir
  }/api-gateway-modules`;
  const uiFeatureRoot = `${getWorkspaceLayout(tree).libsDir}/ui-features`;
  const cmsRoot = `${getWorkspaceLayout(tree).appsDir}/cms`;
  const kaiCmsRoot = `${getWorkspaceLayout(tree).appsDir}/kai-cms`;

  return {
    ...options,
    domainRoot,
    modelsRoot,
    endPointsRoot,
    uiFeatureRoot,
    cmsRoot,
    kaiCmsRoot,
    pyModelsRoot,
  };
}

function addnUpdateServerFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    name: names(options.name).fileName,
    template: '',
  };

  const pageDir = path.join(
    options.domainRoot,
    `/src/lib/${names(options.name).fileName}-domain`
  );

  const modelDir = path.join(
    options.modelsRoot,
    `/src/lib/${names(options.name).fileName}`
  );

  if (options.createDomainFiles) {
    generateFiles(
      tree,
      path.join(__dirname, 'serverFiles/domainFiles'),
      pageDir,
      templateOptions
    );
  }

  if (options.createModelFiles) {
    generateFiles(
      tree,
      path.join(__dirname, 'serverFiles/modelFiles'),
      modelDir,
      templateOptions
    );
  }

  generateFiles(
    tree,
    path.join(__dirname, 'serverFiles/pyModelFiles'),
    path.join(
      options.pyModelsRoot,
      `/domain/${dashToUnderscore(names(options.name).fileName)}`
    ),
    templateOptions
  );

  if (options.createEndpoints) {
    const endPointRoot = path.join(options.endPointsRoot, `/src/lib/`);

    generateFiles(
      tree,
      path.join(__dirname, 'serverFiles/apiFiles'),
      path.join(endPointRoot, names(options.name).fileName),
      templateOptions
    );

    if (options.importInClientApi) {
      updateApiImports(
        tree,
        options,
        path.join(endPointRoot, `client-api-gateway.modules.ts`)
      );
    }
    // if (options.importInKaiGateway) {
    //   updateApiImports(
    //     tree,
    //     options,
    //     path.join(endPointRoot, `kai-api-gateway.modules.ts`)
    //   );
    // }
  }

  if (options.importInDBWorker)
    updateDomainImports(
      tree,
      options,
      path.join(options.domainRoot, `/src/lib/api-root-domain.module.ts`)
    );
  // if (options.importInKaiDBWorker)
  //   updateDomainImports(
  //     tree,
  //     options,
  //     path.join(options.domainRoot, `/src/lib/kai-api-root-domain.module.ts`)
  //   );
  if (options.createModelFiles) {
    updateModelImports(
      tree,
      options,
      path.join(options.modelsRoot, `/src/index.ts`)
    );
  }
  if (options.createDomainFiles)
    updateMapperService(
      tree,
      options,
      path.join(options.domainRoot, `/src/lib/shared/mapper/mapper.service.ts`)
    );
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

  // Create Kai CMS Route and Navigation
  if (options.createUiRouteInKaiCms) {
    updateUiImports(
      tree,
      options,
      path.join(options.kaiCmsRoot, `/src/app/app.routing.module.ts`)
    );

    updateNavigation(
      tree,
      options,
      path.join(options.kaiCmsRoot, `/src/app/navigation/navigation.ts`)
    );
  }
}

export async function domainGenerator(
  tree: Tree,
  options: PageGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);

  addnUpdateServerFiles(tree, normalizedOptions);

  if (options.createUiFeature) {
    addnUpdateUiFiles(tree, normalizedOptions);
  }
  await formatFiles(tree);
}

export default domainGenerator;
