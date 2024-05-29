import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import { nestApiDomainGenerator } from './generator';
import { NestApiDomainGeneratorSchema } from './schema';

describe('nest-api-domain generator', () => {
  let tree: Tree;
  const options: NestApiDomainGeneratorSchema = { name: 'test' };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await nestApiDomainGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'test');
    expect(config).toBeDefined();
  });
});
