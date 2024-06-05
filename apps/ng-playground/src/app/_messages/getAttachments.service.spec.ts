import { TestBed } from '@angular/core/testing';

import { GetAttachmentsService } from './getAttachments.service';

describe('GetAttachmentsService', () => {
  let service: GetAttachmentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAttachmentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
