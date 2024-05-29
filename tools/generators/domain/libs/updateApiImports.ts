import {names, readProjectConfiguration, Tree} from '@nrwl/devkit';
import {tsquery} from '@phenomnomnominal/tsquery';
import ts, {
  ArrayLiteralExpression,
  Identifier,
  ImportDeclaration,
  PropertyAssignment,
  TypeReferenceNode,
  VariableDeclaration,
  VariableStatement,
} from 'typescript';
import {NormalizedSchema} from '../schema';

export function updateApiImports(
  tree: Tree,
  options: NormalizedSchema,
  filePath: string
) {
  const fileEntry = tree.read(filePath);
  const contents = fileEntry?.toString();

  const toInsertModuleStatement = ` ${names(options.name).className}ApiModule,
  `;

  const moduleUpdatedContent = tsquery.replace(
    contents ?? "",
    'PropertyAssignment',
    (node) => {
      let modifiedNode = node.getFullText();

      if (modifiedNode.includes(names(options.name).className)) return;

      let vsNode = node as PropertyAssignment;
      let name = vsNode.name as any;
      let initializers = vsNode.initializer as ArrayLiteralExpression;
      if (name.escapedText == 'imports') {
        const previousRoutes = vsNode.getFullText();
        const prefix = previousRoutes.substring(0, previousRoutes.length - 1);
        const suffix = previousRoutes.substring(previousRoutes.length - 1);
        const newModuleImports = `${prefix}${toInsertModuleStatement}${suffix}`;
        modifiedNode = newModuleImports;
        return modifiedNode;
      }
      return undefined;
    }
  );

  const toInsertImportsStatement = `import {${names(options.name).className}ApiModule} from './${
    names(options.name).fileName
  }/${names(options.name).fileName}-api.module';
  `;

  let alreadyImported = false;
  const newContents = tsquery.replace(
    moduleUpdatedContent,
    'ImportDeclaration',
    (node) => {
      let modifiedNode = node.getFullText();
      if (modifiedNode.includes(`{${names(options.name).className}ApiModule}`) || alreadyImported) {
        alreadyImported = true;
        return;
      }
      
      const vNode = node as ImportDeclaration;
      if ((<any>vNode).moduleSpecifier.text == '@nestjs/common') {
        modifiedNode = toInsertImportsStatement
          .trim()
          .concat(modifiedNode.trim());
        return modifiedNode;
      }
      return undefined;
    }
  );
  // only write the file if something has changed
  if (newContents !== contents) {
    tree.write(filePath, newContents);
  }
}
