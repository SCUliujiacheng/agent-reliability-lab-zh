import type { LoadState, PendingApproval, RunSummary, TraceEvent } from "../types";
import { modeLabel, outcomeLabel } from "../presentation";
import { StatusMark } from "./StatusMark";
import { TraceWaterfall } from "./TraceWaterfall";

export type MutationState = "idle" | "pending" | "success" | "error";

interface RunDetailProps {
  run: RunSummary;
  events: TraceEvent[];
  state: LoadState;
  mutationState: MutationState;
  onBack: () => void;
  onRunAgain: () => void;
  onApprove: (approval: PendingApproval, allow: boolean) => void;
}

function formatDuration(value: number): string {
  if (value >= 60_000) return `${(value / 60_000).toFixed(1)}m`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${value.toLocaleString("zh-CN", { maximumFractionDigits: 1 })}ms`;
}

function exportTrace(run: RunSummary, events: TraceEvent[]) {
  const blob = new Blob([JSON.stringify({ run, events }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `trace-${run.id}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function RunDetail({
  run,
  events,
  state,
  mutationState,
  onBack,
  onRunAgain,
  onApprove,
}: RunDetailProps) {
  const outcome = run.result?.outcome === undefined
    ? (run.status === "waiting_approval" ? "等待审批" : "暂不可用")
    : outcomeLabel(run.result.outcome);
  const pending = mutationState === "pending" || state === "loading";
  const approval = run.pending_approval;

  return (
    <main className="detail-page" id="runs">
      <div className="detail-toolbar">
        <button type="button" className="back-button" onClick={onBack}>
          <span aria-hidden="true">←</span> 返回运行记录
        </button>
        <div className="detail-actions">
          <button type="button" className="secondary-button" onClick={() => exportTrace(run, events)}>导出轨迹</button>
          <button type="button" className="primary-button" onClick={onRunAgain} disabled={pending}>再次运行</button>
        </div>
      </div>

      <header className="detail-header">
        <div>
          <p className="eyebrow">运行详情</p>
          <h1>{run.scenario_id}</h1>
          <p className="run-reference">{run.id}</p>
        </div>
        <StatusMark status={run.status} />
      </header>

      <dl className="detail-facts">
        <div><dt>模式</dt><dd>{modeLabel(run.mode)}</dd></div>
        <div><dt>尝试次数</dt><dd>{run.attempt_count}</dd></div>
        <div><dt>结果</dt><dd>{outcome}</dd></div>
        <div><dt>耗时</dt><dd>{formatDuration(run.duration_ms)}</dd></div>
      </dl>

      {run.status === "waiting_approval" && run.approval_required && approval ? (
        <section className="approval-panel" aria-labelledby="approval-title">
          <div>
            <p className="eyebrow">人工检查点</p>
            <h2 id="approval-title">操作等待审批</h2>
            <p>请在记录决定前，核对这项操作的确切副作用。</p>
            <dl className="approval-details">
              <div><dt>工具</dt><dd><code>{approval.tool_name}</code></dd></div>
              <div><dt>操作</dt><dd>第 {approval.action_step} 步</dd></div>
            </dl>
            <div className="approval-arguments">
              <span>参数</span>
              <pre>{JSON.stringify(approval.arguments, null, 2)}</pre>
            </div>
            <p className="approval-fingerprint">
              指纹 <code>{approval.action_fingerprint}</code>
            </p>
          </div>
          <div className="approval-actions">
            <button type="button" className="danger-button" disabled={pending} onClick={() => onApprove(approval, false)}>拒绝操作</button>
            <button type="button" className="primary-button" disabled={pending} onClick={() => onApprove(approval, true)}>允许操作</button>
          </div>
        </section>
      ) : null}

      <section className="detail-trace" aria-labelledby="trace-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">执行轨迹</p>
            <h2 id="trace-title">事件瀑布</h2>
          </div>
          <span>{events.length} 个事件</span>
        </div>
        {state === "error" ? (
          <div className="state-panel" role="alert"><strong>轨迹不可用</strong></div>
        ) : state === "loading" && events.length === 0 ? (
          <div className="state-panel" aria-live="polite">正在加载轨迹…</div>
        ) : (
          <TraceWaterfall events={events} />
        )}
      </section>
    </main>
  );
}
