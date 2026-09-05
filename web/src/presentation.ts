import type { RunMode } from "./types";

const MODE_LABELS: Record<RunMode, string> = {
  resilient: "韧性模式",
  fragile: "脆弱模式",
};

export function modeLabel(mode: RunMode): string {
  return MODE_LABELS[mode];
}

const OUTCOME_LABELS: Readonly<Record<string, string>> = {
  diagnosed: "已诊断",
  prepared: "已准备回滚",
  invalid_output: "无效输出",
  invalid_input: "无效输入",
  succeeded: "已成功",
};

const FAULT_KIND_LABELS: Readonly<Record<string, string>> = {
  timeout: "超时",
  rate_limit: "限流",
  tool_error: "工具错误",
  malformed_output: "格式错误输出",
};

const ERROR_CODE_LABELS: Readonly<Record<string, string>> = {
  approval_denied: "审批已拒绝",
  approval_mismatch: "审批不匹配",
  approval_required: "需要审批",
  bad_request: "请求无效",
  idempotency_conflict: "幂等冲突",
  idempotency_indeterminate: "幂等状态不确定",
  idempotency_in_progress: "幂等操作进行中",
  invalid_fault_plan: "故障计划无效",
  invalid_input: "输入无效",
  invalid_output: "输出无效",
  rate_limit: "限流",
  tool_timeout: "工具超时",
  unknown_tool: "未知工具",
};

function localizedWireValue(value: string, labels: Readonly<Record<string, string>>): string {
  const label = labels[value];
  return label === undefined ? value : `${label}（${value}）`;
}

export function outcomeLabel(value: string): string {
  return localizedWireValue(value, OUTCOME_LABELS);
}

export function faultKindLabel(value: string): string {
  return localizedWireValue(value, FAULT_KIND_LABELS);
}

export function errorCodeLabel(value: string): string {
  return localizedWireValue(value, ERROR_CODE_LABELS);
}
