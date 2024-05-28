import { render } from '@testing-library/react';

import RtUi from './rt-ui';

describe('RtUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RtUi />);
    expect(baseElement).toBeTruthy();
  });
});
