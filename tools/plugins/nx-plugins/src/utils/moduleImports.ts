import { names, readProjectConfiguration, Tree } from '@nrwl/devkit';
import { tsquery } from '@phenomnomnominal/tsquery';
import  {
  ArrayLiteralExpression,
  Identifier,
  ImportDeclaration,
  PropertyAssignment,
  TypeReferenceNode,
  VariableDeclaration,
  VariableStatement,
} from 'typescript';
import * as ts from 'typescript';

export function updateModuleImports(tree: Tree, options: any, flag: string, filePath: string) {
  const fileEntry = tree.read(filePath);
  const contents = fileEntry?.toString();

  const toInsertModuleStatement = ` ${names(options.name).className}${flag}Module,
  `;

  let moduleUpdatedContent;
  tsquery.replace(
    contents ?? '',
    'VariableStatement',
    (node) => {
      let modifiedContent = contents;

      // if (modifiedNode.includes(names(options.name).className)) return;

      const vsNode = node as VariableStatement;



      vsNode.declarationList.declarations.forEach((declaration, index) => {
        const identifier = declaration.name as Identifier;
        if (identifier.escapedText === 'generatedModules') {
          
          
          const toInsert = `${toInsertModuleStatement}`;
          const previousFile = contents;

          

          const position = declaration.initializer.getEnd() - 1;
          const prefix = previousFile.substring(0, position);
          const suffix = previousFile.substring(position);
          modifiedContent = `${prefix}${toInsert}${suffix}`;
      
          moduleUpdatedContent = modifiedContent;
        }
      });
      return undefined;
    }
  );

  

  if (moduleUpdatedContent !== contents) {
    tree.write(filePath, moduleUpdatedContent);
  }

  const toInsertImportsStatement = `import {${
    names(options.name).className
  }${flag}Module} from './${names(options.name).fileName}/${
    names(options.name).fileName
  }-${flag.toLowerCase()}.module';
  `;

  let alreadyImported = false;
  const importsUpdatedContent = tsquery.replace(
    moduleUpdatedContent,
    'ImportDeclaration',
    (node) => {
      let modifiedNode = node.getFullText();
      if (
        modifiedNode.includes(`{${names(options.name).className}ApiModule}`) ||
        alreadyImported
      ) {
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
  if (importsUpdatedContent !== contents) {
    tree.write(filePath, importsUpdatedContent);
  }
}

export function updateIndexImports(tree: Tree, options: any, indexTsFilePath: string) {
  const fileEntry = tree.read(indexTsFilePath);
  const contents = fileEntry?.toString();

  const toInsertModuleStatement = `export * from './${names(options.name).fileName}';
  `;

  const moduleUpdatedContent = contents.concat(`\n${toInsertModuleStatement}`);

  if (moduleUpdatedContent !== contents) {
    tree.write(indexTsFilePath, moduleUpdatedContent);
  }
}
