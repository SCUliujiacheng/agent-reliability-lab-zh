import { useState } from "react";

import { outcomeLabel } from "../presentation";
import type { LoadState, RunMode, ScenarioSummary } from "../types";

interface ScenarioLauncherProps {
  scenarios: ScenarioSummary[];
  state: LoadState;
  launching: boolean;
  onStart: (scenarioId: string, mode: RunMode) => void;
  onRetry: () => void;
}

export function ScenarioLauncher({
  scenarios,
  state,
  launching,
  onStart,
  onRetry,
}: ScenarioLauncherProps) {
  const [selectedScenario, setSelectedScenario] = useState("");
  const [mode, setMode] = useState<RunMode>("resilient");
  const effectiveScenario = scenarios.some((scenario) => scenario.id === selectedScenario)
    ? selectedScenario
    : (scenarios[0]?.id ?? "");

  if (state === "loading") {
    return <div className="state-panel" aria-live="polite">正在加载场景目录…</div>;
  }
  if (state === "error") {
    return (
      <div className="state-panel" role="alert">
        <strong>场景不可用</strong>
        <button type="button" className="text-button" onClick={onRetry}>重试</button>
      </div>
    );
  }
  if (scenarios.length === 0) {
    return <div className="state-panel"><strong>尚未配置场景</strong></div>;
  }

  const current = scenarios.find((scenario) => scenario.id === effectiveScenario) ?? scenarios[0];

  return (
    <form
      className="launcher-form"
      onSubmit={(event) => {
        event.preventDefault();
        onStart(effectiveScenario, mode);
      }}
    >
      <label htmlFor="scenario-select">场景</label>
      <select
        id="scenario-select"
        value={effectiveScenario}
        onChange={(event) => setSelectedScenario(event.target.value)}
        disabled={launching}
      >
        {scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.id}</option>)}
      </select>

      <label htmlFor="mode-select">模式</label>
      <select
        id="mode-select"
        value={mode}
        onChange={(event) => setMode(event.target.value as RunMode)}
        disabled={launching}
      >
        <option value="resilient">韧性模式</option>
        <option value="fragile">脆弱模式</option>
      </select>

      <dl className="launcher-facts">
        <div><dt>预期结果</dt><dd>{outcomeLabel(current.expected_outcome)}</dd></div>
        <div><dt>注入故障</dt><dd>{current.faults.length}</dd></div>
        <div><dt>审批</dt><dd>{current.approval_required ? "需要" : "不需要"}</dd></div>
      </dl>

      <button className="primary-button" type="submit" disabled={launching || effectiveScenario.length === 0}>
        {launching ? "正在启动…" : "启动运行"}
      </button>
    </form>
  );
}
