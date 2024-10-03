import { TestBed } from "@angular/core/testing";

import { CARService } from "./car.service";

describe("CARService", () => {
  let service: CARService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CARService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
