import type { LoadState, RunSummary } from "../types";
import { modeLabel } from "../presentation";
import { StatusMark } from "./StatusMark";

interface RunListProps {
  runs: RunSummary[];
  state: LoadState;
  onSelect?: (runId: string) => void;
  onRetry?: () => void;
}

function formatStarted(value: string): string {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function RunList({ runs, state, onSelect, onRetry }: RunListProps) {
  if (state === "loading") {
    return (
      <div className="state-panel state-panel--loading" aria-label="正在加载最近运行" aria-live="polite">
        <span className="loading-line" />
        <span className="loading-line loading-line--short" />
        <span className="loading-line" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="state-panel" role="alert">
        <strong>无法获取运行记录</strong>
        <p>API 未返回最近运行列表。</p>
        {onRetry ? <button type="button" className="text-button" onClick={onRetry}>重试</button> : null}
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="state-panel">
        <strong>暂无运行记录</strong>
        <p>启动一个场景，即可创建第一条执行轨迹。</p>
      </div>
    );
  }

  return (
    <div className="run-table-wrap">
      <table className="run-table" aria-label="最近运行">
        <thead>
          <tr>
            <th scope="col">运行</th>
            <th scope="col">场景</th>
            <th scope="col">模式</th>
            <th scope="col">状态</th>
            <th scope="col">尝试次数</th>
            <th scope="col">开始时间</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => (
            <tr key={run.id}>
              <td data-label="运行">
                <button
                  type="button"
                  className="run-id-button"
                  aria-label={`打开运行 ${run.scenario_id} ${run.id}`}
                  onClick={() => onSelect?.(run.id)}
                >
                  {run.id}
                </button>
              </td>
              <td data-label="场景">{run.scenario_id}</td>
              <td data-label="模式"><span className="mode-label">{modeLabel(run.mode)}</span></td>
              <td data-label="状态"><StatusMark status={run.status} /></td>
              <td data-label="尝试次数">{run.attempt_count}</td>
              <td data-label="开始时间"><time dateTime={run.created_at}>{formatStarted(run.created_at)}</time></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
