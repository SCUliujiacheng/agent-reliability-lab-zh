import type { EvaluationReport, LoadState, RunMode, RunSummary, ScenarioSummary } from "../types";
import { EvaluationComparison } from "./EvaluationComparison";
import { MetricCard } from "./MetricCard";
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

function formatRate(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : `${(value * 100).toFixed(1)}%`;
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
  const resilient = evaluation?.modes.resilient.metrics;
  const fragile = evaluation?.modes.fragile.metrics;
  const header = (
    <header className="overview-header">
      <div>
        <p className="eyebrow">Agent Reliability Lab</p>
        <h1>Agent 出错后发生了什么</h1>
        <p>运行固定场景，对照 fragile / resilient，再点进 trace。</p>
      </div>
      <div className="overview-header__actions">
        <span className="environment-label"><span aria-hidden="true" /> 本地 API</span>
        <button
          type="button"
          className="primary-button"
          disabled={evaluating || state !== "ready"}
          onClick={onEvaluate}
        >
          {evaluating ? "正在评测…" : "运行评测"}
        </button>
        <a className="secondary-button header-action" href="#scenarios">运行场景</a>
      </div>
    </header>
  );

  if (state === "error") {
    return (
      <main className="overview-page" id="overview">
        {header}
        <section className="overview-error" role="alert">
          <div>
            <p className="eyebrow">API 不可用</p>
            <h2>无法加载控制台数据</h2>
            <p>请确认本地 API 正在运行，然后重试。</p>
          </div>
          <button type="button" className="primary-button" onClick={onRetry}>重试加载</button>
        </section>
      </main>
    );
  }

  return (
    <main className="overview-page" id="overview">
      {header}

      <section className="metrics-grid" aria-label="可靠性指标">
        <MetricCard
          label="韧性模式正确率"
          value={formatRate(resilient?.task_correctness_rate)}
          detail={evaluation ? "最新评测" : "暂无评测报告"}
          tone="positive"
        />
        <MetricCard
          label="故障恢复率"
          value={formatRate(resilient?.recovery_rate)}
          detail="已恢复的瞬时故障"
          tone="positive"
        />
        <MetricCard
          label="脆弱模式正确率"
          value={formatRate(fragile?.task_correctness_rate)}
          detail="最新评测"
          tone="fragile"
        />
        <MetricCard
          label="接受的无效输出"
          value={formatRate(resilient?.invalid_output_rate)}
          detail="韧性模式执行"
          tone={resilient?.invalid_output_rate === 0 ? "positive" : "fragile"}
        />
      </section>

      {evaluation ? (
        <EvaluationComparison report={evaluation} />
      ) : (
        <section className="comparison comparison--empty" id="evaluations">
          <p className="eyebrow">最新评测</p>
          <h2>暂无评测</h2>
          <p>运行冻结的场景目录套件，即可生成基准对比。</p>
        </section>
      )}

      <div className="dashboard-grid">
        <section className="runs-panel" id="runs" aria-labelledby="recent-runs-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">执行历史</p>
              <h2 id="recent-runs-title">最近运行</h2>
            </div>
            <span>显示 {runs.length} 条</span>
          </div>
          <RunList runs={runs} state={state} onSelect={onSelectRun} onRetry={onRetry} />
        </section>

        <aside className="launcher-panel" id="scenarios" aria-labelledby="launcher-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">从一个固定案例开始</p>
              <h2 id="launcher-title">挑一个场景跑跑看</h2>
            </div>
          </div>
          <ScenarioLauncher
            scenarios={scenarios}
            state={state}
            launching={launching}
            onStart={onStart}
            onRetry={onRetry}
          />
        </aside>

        <section className="trace-preview" aria-labelledby="trace-preview-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">接着看 trace</p>
              <h2 id="trace-preview-title">打开一次运行，顺着事件往下看</h2>
            </div>
          </div>
          <div className="preview-steps" aria-hidden="true">
            <span /><span /><span /><span />
          </div>
          <p>选中运行后才加载事件；概览不需要先把所有 trace 都拉下来。</p>
        </section>
      </div>
    </main>
  );
}
