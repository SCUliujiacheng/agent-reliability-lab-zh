# 贡献指南

感谢你来改 Agent Reliability Lab。这里最重要的约束很朴素：可靠性结论要能从有序证据重算；证据不完整或互相矛盾时，检查应当失败。

## 开发环境

```bash
uv sync --dev --locked
npm ci --prefix web
```

提交拉取请求（Pull Request）前，请完整运行本地门禁：

```bash
uv run pytest -v
uv run ruff check .
uv run ruff format --check .
uv run mypy src

npm --prefix web test -- --run
npm --prefix web run lint
npm --prefix web run typecheck
npm --prefix web run build

uv run arl eval scenarios/incident-response --output artifacts/current-report.json
uv run arl gate artifacts/current-report.json --baseline benchmarks/baseline-report.json
```

## 改动时请留意

- 修改运行时、工具、存储、API 或门禁行为前，先添加一个失败测试。
- 公开输入应保持有界且严格，并拒绝未知字段。
- 切勿向工具网关加入任意 shell 执行能力。
- 执行下一动作前先记录状态转换。
- 在每条已存储或导出的追踪路径上保留递归秘密脱敏。
- 将重试视为同一逻辑动作的多次尝试，而不是额外的逻辑工具调用。
- 将策略动作预算与重试次数分开，并确保额度耗尽时不会额外调用策略。
- 保留审批动作步骤/指纹的精确绑定、过期目标拒绝和完全相同重复请求的收敛行为。
- 保持提供商重定向禁用，并保留远程 HTTPS、总时限、响应大小和凭证脱敏测试。
- 保持 FastAPI 与 Nginx 的可信 Host 配置一致。
- 与结论相关的更改完成后，重新生成基线、基准测试说明、架构收据和真实浏览器截图。
- 记录任何基准测试分母或语义变化。

## 场景与基线变更

场景变更必须有意更新版本，提供精确预期结果与预期逻辑工具序列，并为新行为添加测试。请使用官方评测器重新生成报告，切勿手工编辑基准指标：

```bash
uv run arl eval scenarios/incident-response \
  --baseline-output benchmarks/baseline-report.json
```

请解释测试套件哈希变化的原因，以及受影响的核心指标分母。由提供商驱动或具有非确定性的评测应使用独立测试套件，不得静默替换确定性基线。

## 拉取请求

请让拉取请求聚焦，说明行为和故障模式变了什么、测试看到了什么、有没有迁移或兼容性影响，以及还剩下哪些限制。仪表盘可见变化请附截图。
