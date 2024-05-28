import {names, readProjectConfiguration, Tree} from '@nrwl/devkit';
import {tsquery} from '@phenomnomnominal/tsquery';

import ts, {
  ArrayLiteralExpression,
  Identifier,
  ImportDeclaration,
  ObjectLiteralExpression,
  PropertyAssignment,
  StringLiteral,
  TypeReferenceNode,
  VariableDeclaration,
  VariableStatement,
} from 'typescript';
import {NormalizedSchema} from '../schema';
import { underscoreToSentenseCase } from './utils';

export function updateUiImports(
  tree: Tree,
  options: NormalizedSchema,
  filePath: string
) {
  const fileEntry = tree.read(filePath) as Buffer;
  const contents = fileEntry.toString();



  let alreadyImported = false;
  let newContents = contents;
  tsquery.replace(contents, 'VariableStatement', (node) => {
    let modifiedNode = node.getFullText();

    const vsNode = node as VariableStatement;

    vsNode.declarationList.declarations.forEach((declaration) => {
      const typeNode = declaration.type as TypeReferenceNode;
      const identifier = typeNode.typeName as Identifier;
      if (identifier.escapedText === 'Routes') {
        const pageNames = names(options.name);

        const toInsert = ` {
    path: '${pageNames.propertyName}', loadChildren: () => import('@ecommerce/ui-features/${pageNames.fileName}/${pageNames.fileName}.module').then(m => m.${pageNames.className}Module)
  },
            `;

        const arrLiteral = declaration.initializer as ArrayLiteralExpression;

        if (
          arrLiteral.elements.length > 0 &&
          !newContents.includes(`${pageNames.className}Module`)
        ) {
          const nodeArray = arrLiteral.elements;

          // TODO: create a for loop instead.
          const insertPosition = nodeArray[4].getStart();

          const previousFile = newContents;
          const prefix = previousFile.substring(0, insertPosition);
          const suffix = previousFile.substring(insertPosition);
          const newFile = `${prefix}${toInsert}${suffix}`;

          newContents = newFile;
        }
      }
    });

    return modifiedNode;
  });
  // only write the file if something has changed
  if (newContents !== contents) {
    tree.write(filePath, newContents);
  }
}

export function updateNavigation(
  tree: Tree,
  options: NormalizedSchema,
  filePath: string
) {
  const fileEntry = tree.read(filePath) as Buffer;
  const contents = fileEntry.toString();



  let alreadyImported = false;
  let newContents = contents;
  tsquery.replace(contents, 'VariableStatement', (node) => {
    let modifiedNode = node.getFullText();

    const vsNode = node as VariableStatement;

    vsNode.declarationList.declarations.forEach((declaration) => {
      const identifier = declaration.name as Identifier;
      if (identifier.escapedText === 'navigation') {
        const pageNames = names(options.name);

        

        const toInsert = ` {
          id: 'apps.${pageNames.propertyName}',
          title: '${underscoreToSentenseCase(pageNames.fileName
            .split('-')
            .join('_'))}',
          type: 'item',
          icon: 'chrome_reader_mode',
          url: '/${pageNames.propertyName}',
        },
            `;

        const arrLiteral = declaration.initializer as ArrayLiteralExpression;

        if (
          arrLiteral.elements.length > 0 &&
          !newContents.includes(`apps.${pageNames.propertyName}`)
        ) {
          const nodeArray = (<any>arrLiteral.elements) as Array<ObjectLiteralExpression>;

          // TODO: create a for loop instead.
          // let myElement = nodeArray[0] as ObjectLiteralExpression;
          let myElement;
          nodeArray.forEach((_n: ObjectLiteralExpression) => {
            (<any>_n).properties.forEach((_p: PropertyAssignment) => {
              const _name = _p.name as Identifier;
              const _value = _p.initializer as StringLiteral;
              if(_name.escapedText == 'id' && _value.text == 'apps') {
                myElement = _n;
              }
            })
          })

          if (myElement && myElement.properties.length > 0) {
            (<any>myElement).properties.forEach((v: PropertyAssignment) => {
              const _name = v.name as Identifier;
              if(_name.escapedText == 'children') {
                const myNode = v;
                const insertPosition = myNode.getEnd() - 2;
    
                const previousFile = newContents;
                const prefix = previousFile.substring(0, insertPosition);
                const suffix = previousFile.substring(insertPosition);
                const newFile = `${prefix}${toInsert}${suffix}`;
    
                newContents = newFile;
              }
            });
          }
        }
      }
    });

    return modifiedNode;
  });
  // only write the file if something has changed
  if (newContents !== contents) {
    tree.write(filePath, newContents);
  }
}


