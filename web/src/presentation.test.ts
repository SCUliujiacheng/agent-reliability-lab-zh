import { describe, expect, it } from "vitest";

import { errorCodeLabel, faultKindLabel, outcomeLabel } from "./presentation";

describe("presentation labels", () => {
  it("shows Chinese meaning while preserving stable wire values", () => {
    expect(outcomeLabel("diagnosed")).toBe("已诊断（diagnosed）");
    expect(faultKindLabel("timeout")).toBe("超时（timeout）");
    expect(errorCodeLabel("tool_timeout")).toBe("工具超时（tool_timeout）");
  });

  it("preserves unknown values for auditability", () => {
    expect(outcomeLabel("custom_outcome")).toBe("custom_outcome");
    expect(faultKindLabel("custom_fault")).toBe("custom_fault");
    expect(errorCodeLabel("custom_error")).toBe("custom_error");
  });
});
