import { describe, expect, it } from "vitest";

import { errorCodeLabel, faultKindLabel, modeLabel, outcomeLabel, scenarioLabel } from "./presentation";

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
    expect(scenarioLabel("custom_scenario")).toBe("custom_scenario");
  });

  it("names the scenario and recovery strategy without changing their identifiers", () => {
    expect(scenarioLabel("timeout-recovery")).toBe("超时重试");
    expect(modeLabel("fragile")).toBe("无恢复策略");
    expect(modeLabel("resilient")).toBe("有恢复策略");
  });
});
