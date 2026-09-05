import type { EvaluationReport, ModeMetrics } from "../types";

interface EvaluationComparisonProps {
  report: EvaluationReport;
}

type MetricKey = keyof Pick<
  ModeMetrics,
  | "task_correctness_rate"
  | "recovery_rate"
  | "tool_sequence_accuracy"
  | "invalid_output_rate"
  | "unnecessary_call_count"
  | "p95_latency_ms"
>;

interface MetricDefinition {
  key: MetricKey;
  label: string;
  higherIsBetter: boolean;
  format: "rate" | "count" | "duration";
}

const METRICS: MetricDefinition[] = [
  { key: "recovery_rate", label: "恢复率", higherIsBetter: true, format: "rate" },
  { key: "tool_sequence_accuracy", label: "工具序列准确率", higherIsBetter: true, format: "rate" },
  { key: "invalid_output_rate", label: "接受的无效输出", higherIsBetter: false, format: "rate" },
  { key: "unnecessary_call_count", label: "非必要调用", higherIsBetter: false, format: "count" },
  { key: "p95_latency_ms", label: "P95 延迟", higherIsBetter: false, format: "duration" },
];

type ChangeState = "unavailable" | "unchanged" | "improved" | "regressed";

const CHANGE_LABELS: Record<ChangeState, string> = {
  unavailable: "暂不可用",
  unchanged: "无变化",
  improved: "已改善",
  regressed: "有回退",
};

function formatRate(value: number | null): string {
  return value === null ? "暂不可用" : `${(value * 100).toFixed(1)}%`;
}

function formatMetric(value: number | null, format: MetricDefinition["format"]): string {
  if (value === null) return "暂不可用";
  if (format === "rate") return formatRate(value);
  if (format === "duration") return `${value.toLocaleString("zh-CN", { maximumFractionDigits: 1 })} ms`;
  return value.toLocaleString("zh-CN");
}

function changeLabel(
  fragile: number | null,
  resilient: number | null,
  higherIsBetter: boolean,
): ChangeState {
  if (fragile === null || resilient === null) return "unavailable";
  const delta = resilient - fragile;
  if (Math.abs(delta) < Number.EPSILON) return "unchanged";
  return (delta > 0) === higherIsBetter ? "improved" : "regressed";
}

function deltaLabel(
  fragile: number | null,
  resilient: number | null,
  format: MetricDefinition["format"],
): string {
  if (fragile === null || resilient === null) return "暂不可用";
  const delta = resilient - fragile;
  const sign = delta > 0 ? "+" : "";
  if (format === "rate") return `${sign}${(delta * 100).toFixed(1)} 个百分点`;
  if (format === "duration") return `${sign}${delta.toFixed(1)} ms`;
  return `${sign}${delta.toLocaleString("zh-CN")}`;
}

export function EvaluationComparison({ report }: EvaluationComparisonProps) {
  const fragile = report.modes.fragile.metrics;
  const resilient = report.modes.resilient.metrics;
  const correctnessDelta = resilient.task_correctness_rate - fragile.task_correctness_rate;
  const correctnessState = changeLabel(
    fragile.task_correctness_rate,
    resilient.task_correctness_rate,
    true,
  );

  return (
    <section className="comparison" id="evaluations" aria-labelledby="comparison-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">最新评测</p>
          <h2 id="comparison-title">脆弱模式 vs 韧性模式</h2>
        </div>
        <time dateTime={report.generated_at}>{new Date(report.generated_at).toLocaleDateString("zh-CN")}</time>
      </div>

      <div className="correctness-band">
        <div>
          <span>脆弱模式正确率</span>
          <strong>{formatRate(fragile.task_correctness_rate)}</strong>
        </div>
        <span className="comparison-arrow" aria-hidden="true">→</span>
        <div>
          <span>韧性模式正确率</span>
          <strong>{formatRate(resilient.task_correctness_rate)}</strong>
        </div>
        <div className={`comparison-delta comparison-delta--${correctnessState}`}>
          <strong>{correctnessDelta >= 0 ? "+" : ""}{(correctnessDelta * 100).toFixed(1)} 个百分点</strong>
          <span>{CHANGE_LABELS[correctnessState]}</span>
        </div>
      </div>

      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <caption className="sr-only">按执行模式对比评测指标</caption>
          <thead>
            <tr>
              <th scope="col">指标</th>
              <th scope="col">脆弱模式</th>
              <th scope="col">韧性模式</th>
              <th scope="col">变化</th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((metric) => {
              const fragileValue = fragile[metric.key];
              const resilientValue = resilient[metric.key];
              const state = changeLabel(fragileValue, resilientValue, metric.higherIsBetter);
              return (
                <tr key={metric.key}>
                  <th scope="row">{metric.label}</th>
                  <td>{formatMetric(fragileValue, metric.format)}</td>
                  <td>{formatMetric(resilientValue, metric.format)}</td>
                  <td>
                    <span className={`change-state change-state--${state}`}>
                      {CHANGE_LABELS[state]}
                    </span>
                    <small>{deltaLabel(fragileValue, resilientValue, metric.format)}</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
