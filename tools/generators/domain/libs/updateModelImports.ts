import {names, readProjectConfiguration, Tree} from '@nrwl/devkit';
import {tsquery} from '@phenomnomnominal/tsquery';
import ts, {TypeReferenceNode} from 'typescript';
import {NormalizedSchema} from '../schema';

/**
 * Run the callback on all files inside the specified path
 */
function visitAllFiles(
  tree: Tree,
  path: string,
  callback: (filePath: string) => void
) {
  tree.children(path).forEach((fileName) => {
    const filePath = `${path}/${fileName}`;
    if (!tree.isFile(filePath)) {
      visitAllFiles(tree, filePath, callback);
    } else {
      callback(filePath);
    }
  });
}

export function updateModelImports(
  tree: Tree,
  options: NormalizedSchema,
  filePath: string
) {
  const fileEntry = tree.read(filePath);
  const contents = fileEntry.toString();

  const toInsertStatement = `export * from './lib/${
    names(options.name).fileName
  }';`;

  // Check each `TypeReference` node to see if we need to replace it
  const newContents = tsquery.replace(contents, 'SourceFile', (node) => {
    let modifiedNode = node.getFullText();
    if (modifiedNode.includes(names(options.name).fileName)) 
      return;
    modifiedNode = modifiedNode.concat(toInsertStatement);

    return modifiedNode;

    // return undefined does not replace anything
  });

  // only write the file if something has changed
  if (newContents !== contents) {
    tree.write(filePath, newContents);
  }
}
