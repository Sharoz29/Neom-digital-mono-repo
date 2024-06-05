import { TestBed } from '@angular/core/testing';

import { RightPanelService } from './right-panel.service';

describe('RightPanelService', () => {
  let service: RightPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RightPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
