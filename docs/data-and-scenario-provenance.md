# 数据与场景来源

Agent Reliability Lab 有意设计为完全自包含。默认演示与基准测试不使用抓取语料、生产事故数据、客户记录或隐藏的模型生成标签。

## 仓库内容

- `scenarios/incident-response/` 下六个手工编写的 YAML 场景。
- 一个具有类型化输入与输出的确定性内存事件响应后端。
- 在指定工具、逻辑动作和尝试次数触发的显式故障规则。
- 与各场景一同存储的预期工具序列和结果。
- 一份已提交的 JSON 报告，包含清单、哈希、有序追踪证据、精确指标和执行来源信息。

场景均不包含个人数据。示例服务名、部署 ID、日志消息、操作者和事件描述都是专为本仓库创建的合成测试数据。

## 冻结测试套件清单

| 场景 | 目的 | 注入故障 | 预期结果 |
| --- | --- | --- | --- |
| `normal-success` | 无故障的控制路径 | `none` | `diagnosed` |
| `timeout-recovery` | 验证超时后的有界重试 | 首次调用 `search_recent_logs` | `diagnosed` |
| `rate-limit-recovery` | 验证限流后的有界重试 | 首次调用 `get_deployment` | `diagnosed` |
| `malformed-output-rejected` | 验证输出 schema 拒绝机制 | 畸形 `get_deployment` 响应 | `invalid_output` |
| `permanent-invalid-input` | 在执行前拒绝无效输入 | `none`；输入永久无效 | `invalid_input` |
| `approval-reconstruction` | 重建服务、审批并执行一次写操作 | 持久化人工审批边界 | `prepared` |

## 身份与完整性

每个场景都会被加载到严格模型中，并根据文件的精确字节计算哈希。评测报告还包含一份规范化测试套件清单，其中记录：

- 相对路径、场景 ID、版本和 SHA-256；
- 初始上下文和已声明故障；
- 规范化逻辑动作及动作指纹；
- 确定性工具的预期输出摘要；
- 预期工具序列、结果和审批要求。

测试套件哈希绑定上述完整清单。回归门禁不信任报告中的核心汇总指标；它会根据场景和有序追踪证据重建指标，验证追踪与场景身份，并拒绝不可比较或内部不一致的输入。

当前报告与可选基线都必须标明 40 位小写完整 Git 修订号，并记录 `git_dirty: false`。两者的修订号可以不同，因为基线通常早于被测实现。这只能验证来源声明格式正确且工作树干净；所引用提交的保留与真实性仍由仓库历史和 CI 负责。

## 运行时证据

每次运行都会获得独立的运行 UUID 和追踪 UUID。事件采用单调递增的序列号，只保留解释以下内容所需的最小载荷：

- 策略决策；
- 工具尝试、故障、失败、重试和通过验证的成功结果；
- 持久化检查点；
- 审批决策；
- 终态成功或失败。

存储和导出的载荷都会经过递归脱敏。`Authorization`、`token`、`secret`、`password`、`private-key`、`API-key`、`credential` 等字段变体，以及显式配置的秘密值，都会在持久化前被替换。`prompt_tokens` 和 `token_count` 等指标名称仍会保留。API 对外提供的追踪 DTO 有意比内部事件模型更窄。

## 复现契约

```bash
uv sync --dev --locked
uv run arl eval scenarios/incident-response --output artifacts/current-report.json
uv run arl gate artifacts/current-report.json --baseline benchmarks/baseline-report.json
```

脚本化基准测试的行为具有确定性，但运行 UUID、时间戳和延迟测量值会变化。基线规范化既保留与结论相关的证据，也明确记录版本控制来源。

## 负责任地扩展测试套件

新增场景应只引入一种名称明确的行为，声明精确预期结果，并为场景加载器和门禁同时添加测试。切勿将真实凭证或生产日志写入 YAML 测试数据。如果新后端具有非确定性，请勿将其纳入核心精确基准测试；应另行发布评测，并明确其评分器和局限性。
