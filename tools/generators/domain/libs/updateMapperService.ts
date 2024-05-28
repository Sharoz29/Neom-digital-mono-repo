import {names, readProjectConfiguration, Tree} from '@nrwl/devkit';
import {tsquery} from '@phenomnomnominal/tsquery';
import ts, {MethodDeclaration, PropertyAssignment, TypeReferenceNode} from 'typescript';
import {NormalizedSchema} from '../schema';

export function updateMapperService(
  tree: Tree,
  options: NormalizedSchema,
  filePath: string
) {
  const fileEntry = tree.read(filePath);
  const contents = fileEntry.toString();

  const toInsertStatement = ` config
      .createMap( '${names(options.name).className}', '${
    names(options.name).className
  }Vm' )
      .forSourceMember( '_id', ( opts ) => opts.ignore() );
      config
      .createMap( '${names(options.name).className}Vm', '${
    names(options.name).className
  }' )
      .forSourceMember( '_id', ( opts ) => opts.ignore() );
      `;

  // Check each `TypeReference` node to see if we need to replace it
  const newContents = tsquery.replace(contents, 'MethodDeclaration', (node) => {
    let modifiedNode = node.getFullText();

    if (modifiedNode.includes(names(options.name).className)) return;

    let vsNode = node as MethodDeclaration;
    let name = vsNode.name as any;
    if (name.escapedText == 'configure') {
      const oldFunction = vsNode.getFullText();
      const prefix = oldFunction.substring(0, oldFunction.length - 1);
      const suffix = oldFunction.substring(oldFunction.length - 1);
      const newModuleImports = `${prefix}${toInsertStatement}${suffix}`;
      modifiedNode = newModuleImports;

      return modifiedNode;
    }
  });
  
  // only write the file if something has changed
  if (newContents !== contents) {
    tree.write(filePath, newContents);
  }
}
