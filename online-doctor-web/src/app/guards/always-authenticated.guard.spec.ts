import { TestBed, async, inject } from '@angular/core/testing';

import { AlwaysAuthenticatedGuard } from './always-authenticated.guard';

describe('AlwaysAuthenticatedGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlwaysAuthenticatedGuard]
    });
  });

  it('should ...', inject([AlwaysAuthenticatedGuard], (guard: AlwaysAuthenticatedGuard) => {
    expect(guard).toBeTruthy();
  }));
});
