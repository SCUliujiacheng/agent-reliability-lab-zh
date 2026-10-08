import type { ReactNode } from "react";
import type { EvaluationReport, ModeMetrics } from "../types";

interface EvaluationComparisonProps {
  report: EvaluationReport;
  action?: ReactNode;
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
  { key: "task_correctness_rate", label: "任务正确率", higherIsBetter: true, format: "rate" },
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
  improved: "改善",
  regressed: "变差",
};

function formatMetric(value: number | null, format: MetricDefinition["format"]): string {
  if (value === null) return "暂不可用";
  if (format === "rate") return `${(value * 100).toFixed(1)}%`;
  if (format === "duration") return `${value.toLocaleString("zh-CN", { maximumFractionDigits: 1 })} ms`;
  return value.toLocaleString("zh-CN");
}

function changeLabel(fragile: number | null, resilient: number | null, higherIsBetter: boolean): ChangeState {
  if (fragile === null || resilient === null) return "unavailable";
  const delta = resilient - fragile;
  if (Math.abs(delta) < Number.EPSILON) return "unchanged";
  return (delta > 0) === higherIsBetter ? "improved" : "regressed";
}

function deltaLabel(fragile: number | null, resilient: number | null, format: MetricDefinition["format"]): string {
  if (fragile === null || resilient === null) return "—";
  const delta = resilient - fragile;
  const sign = delta > 0 ? "+" : "";
  if (format === "rate") return `${sign}${(delta * 100).toFixed(1)} 个百分点`;
  if (format === "duration") return `${sign}${delta.toFixed(1)} ms`;
  return `${sign}${delta.toLocaleString("zh-CN")}`;
}

export function EvaluationComparison({ report, action }: EvaluationComparisonProps) {
  const fragile = report.modes.fragile.metrics;
  const resilient = report.modes.resilient.metrics;

  return (
    <section className="comparison" id="evaluations" aria-labelledby="comparison-title">
      <div className="section-heading">
        <h2 id="comparison-title">评测对比</h2>
        <div className="section-actions">
          <time dateTime={report.generated_at}>{new Date(report.generated_at).toLocaleDateString("zh-CN")}</time>
          {action}
        </div>
      </div>
      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <caption className="sr-only">按执行模式对比评测指标</caption>
          <thead>
            <tr>
              <th scope="col">指标</th>
              <th scope="col">无恢复策略 <span className="wire-label">fragile</span></th>
              <th scope="col">有恢复策略 <span className="wire-label">resilient</span></th>
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
                    <div className="metric-change">
                      <span>{deltaLabel(fragileValue, resilientValue, metric.format)}</span>
                      <small className={`change-state change-state--${state}`}>{CHANGE_LABELS[state]}</small>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="section-note">
        {fragile.case_count} 个固定合成场景；这些数字用于比较执行策略，不代表真实模型能力。
      </p>
    </section>
  );
}
