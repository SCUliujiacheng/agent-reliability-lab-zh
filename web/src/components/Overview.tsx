import type { EvaluationReport, LoadState, RunMode, RunSummary, ScenarioSummary } from "../types";
import { EvaluationComparison } from "./EvaluationComparison";
import { RunList } from "./RunList";
import { ScenarioLauncher } from "./ScenarioLauncher";

interface OverviewProps {
  state: LoadState;
  runs: RunSummary[];
  evaluation: EvaluationReport | null;
  scenarios: ScenarioSummary[];
  launching: boolean;
  evaluating: boolean;
  onSelectRun: (runId: string) => void;
  onStart: (scenarioId: string, mode: RunMode) => void;
  onEvaluate: () => void;
  onRetry: () => void;
}

export function Overview({
  state,
  runs,
  evaluation,
  scenarios,
  launching,
  evaluating,
  onSelectRun,
  onStart,
  onEvaluate,
  onRetry,
}: OverviewProps) {
  const evaluationAction = (
    <button
      type="button"
      className="secondary-button"
      disabled={evaluating || state !== "ready"}
      onClick={onEvaluate}
    >
      {evaluating ? "正在评测…" : "运行评测"}
    </button>
  );

  return (
    <main className="overview-page" id="overview">
      <header className="overview-header">
        <h1>运行记录</h1>
        <p>选一个故障场景，查看每次调用和恢复过程。</p>
      </header>

      {state === "error" ? (
        <section className="overview-error" role="alert">
          <div>
            <h2>无法加载运行数据</h2>
            <p>请确认本地 API 正在运行，然后重试。</p>
          </div>
          <button type="button" className="primary-button" onClick={onRetry}>重试加载</button>
        </section>
      ) : (
        <div className="workspace-grid">
          <section className="launcher-panel" id="scenarios" aria-labelledby="launcher-title">
            <div className="section-heading">
              <h2 id="launcher-title">运行场景</h2>
            </div>
            <ScenarioLauncher
              scenarios={scenarios}
              state={state}
              launching={launching}
              onStart={onStart}
              onRetry={onRetry}
            />
          </section>

          <section className="runs-panel" id="runs" aria-labelledby="recent-runs-title">
            <div className="section-heading">
              <h2 id="recent-runs-title">最近运行</h2>
              <span>{runs.length} 条记录</span>
            </div>
            <RunList runs={runs} state={state} onSelect={onSelectRun} onRetry={onRetry} />
          </section>
        </div>
      )}

      {evaluation && state !== "error" ? (
        <EvaluationComparison report={evaluation} action={evaluationAction} />
      ) : (
        <section className="comparison comparison--empty" id="evaluations" aria-labelledby="comparison-title">
          <div className="section-heading">
            <h2 id="comparison-title">评测对比</h2>
            {evaluationAction}
          </div>
          <p>{state === "error" ? "连接 API 后可运行评测。" : "暂无评测"}</p>
          {state !== "error" ? <p className="section-note">运行同一组固定场景，比较两种模式的结果。</p> : null}
        </section>
      )}
    </main>
  );
}
