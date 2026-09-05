import { useCallback, useRef, useState } from "react";

import { ApiClientError, approveRun, createEvaluation, createRun } from "./api";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MutationNotice } from "./components/MutationNotice";
import { Navigation } from "./components/Navigation";
import { Overview } from "./components/Overview";
import { RunDetail, type MutationState } from "./components/RunDetail";
import { useOverview } from "./hooks/useOverview";
import { useRunDetail } from "./hooks/useRunDetail";
import type { PendingApproval, RunMode } from "./types";

function Dashboard() {
  const overview = useOverview();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const detail = useRunDetail(selectedRunId);
  const [mutationState, setMutationState] = useState<MutationState>("idle");
  const [evaluationPending, setEvaluationPending] = useState(false);
  const [notice, setNotice] = useState("");
  const selectedRunIdRef = useRef<string | null>(null);
  const selectionGeneration = useRef(0);
  const approvalsInFlight = useRef(new Set<string>());
  const evaluationInFlight = useRef(false);
  const dismissNotice = useCallback(() => setNotice(""), []);
  const selectRun = useCallback((runId: string | null) => {
    selectedRunIdRef.current = runId;
    selectionGeneration.current += 1;
    setSelectedRunId(runId);
  }, []);

  const startRun = async (scenarioId: string, mode: RunMode) => {
    if (mutationState === "pending") return;
    setMutationState("pending");
    setNotice("");
    try {
      const run = await createRun(scenarioId, mode);
      selectRun(run.id);
      setMutationState("success");
    } catch {
      setMutationState("error");
      setNotice("无法启动运行。请在 API 可用后重试。");
    }
  };

  const runEvaluation = async () => {
    if (evaluationInFlight.current) return;
    evaluationInFlight.current = true;
    setEvaluationPending(true);
    setNotice("");
    try {
      const report = await createEvaluation();
      overview.replaceEvaluation(report);
      setNotice("评测完成");
    } catch {
      setNotice("无法完成评测。请在 API 可用后重试。");
    } finally {
      evaluationInFlight.current = false;
      setEvaluationPending(false);
    }
  };

  const approve = async (approval: PendingApproval, allow: boolean) => {
    if (selectedRunId === null) return;
    const approvalRunId = selectedRunId;
    const approvalGeneration = selectionGeneration.current;
    const approvalKey = `${approvalRunId}:${approvalGeneration}:${approval.action_step}:${approval.action_fingerprint}`;
    if (approvalsInFlight.current.has(approvalKey)) return;
    approvalsInFlight.current.add(approvalKey);
    const isCurrentSelection = () =>
      selectedRunIdRef.current === approvalRunId
      && selectionGeneration.current === approvalGeneration;
    setMutationState("pending");
    setNotice("");
    try {
      const run = await approveRun(approvalRunId, {
        actor: "dashboard-reviewer",
        allow,
        action_step: approval.action_step,
        action_fingerprint: approval.action_fingerprint,
        reason: allow ? "在可靠性控制台中批准" : "在可靠性控制台中拒绝",
      });
      if (!isCurrentSelection()) return;
      detail.replaceRun(run, approvalRunId);
      await detail.reloadTrace(approvalRunId);
      if (!isCurrentSelection()) return;
      setMutationState("success");
      setNotice(allow ? "操作已允许" : "操作已拒绝");
    } catch (error) {
      if (!isCurrentSelection()) return;
      if (error instanceof ApiClientError && error.status === 409) {
        detail.refresh(approvalRunId);
        setNotice("审批状态已刷新");
      } else {
        setNotice("无法记录审批决定。");
      }
      setMutationState("error");
    } finally {
      approvalsInFlight.current.delete(approvalKey);
    }
  };

  const selectedRunReady =
    selectedRunId !== null && detail.run !== null && detail.run.id === selectedRunId;

  return (
    <div className="app-shell">
      <Navigation />
      <div className="app-content">
        {notice ? <MutationNotice message={notice} onDismiss={dismissNotice} /> : null}
        {selectedRunReady && detail.run ? (
          <RunDetail
            run={detail.run}
            events={detail.events}
            state={detail.state}
            mutationState={mutationState}
            onBack={() => {
              selectRun(null);
              setMutationState("idle");
              setNotice("");
              overview.refresh();
            }}
            onRunAgain={() => void startRun(detail.run!.scenario_id, detail.run!.mode)}
            onApprove={(approval, allow) => void approve(approval, allow)}
          />
        ) : selectedRunId !== null && detail.state === "error" ? (
          <main className="detail-load-state" role="alert">
            <h1>运行详情不可用</h1>
            <p>无法加载所选运行或其轨迹。</p>
            <button type="button" className="primary-button" onClick={() => detail.refresh()}>重试</button>
            <button type="button" className="text-button" onClick={() => selectRun(null)}>返回运行记录</button>
          </main>
        ) : (
          <>
            {selectedRunId !== null ? <p className="detail-loading" aria-live="polite">正在加载运行详情…</p> : null}
            <Overview
              state={overview.state}
              runs={overview.data.runs}
              evaluation={overview.data.evaluation}
              scenarios={overview.data.scenarios}
              launching={mutationState === "pending"}
              evaluating={evaluationPending}
              onSelectRun={(runId) => {
                selectRun(runId);
                setNotice("");
              }}
              onStart={(scenarioId, mode) => void startRun(scenarioId, mode)}
              onEvaluate={() => void runEvaluation()}
              onRetry={overview.refresh}
            />
          </>
        )}
      </div>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}
