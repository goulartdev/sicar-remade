import { CARStatusPipe } from "./car-status.pipe";

describe("CARStatusPipe", () => {
  it("create an instance", () => {
    const pipe = new CARStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
