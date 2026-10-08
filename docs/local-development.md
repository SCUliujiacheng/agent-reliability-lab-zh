# 本地开发

[README](../README.md) 中有首次启动和复现基准的命令。这里补充配置、接口和开发检查。

## 配置与容器

```text
docker compose up --build
```

两个容器以非 root 用户运行。Nginx 同源提供页面与 `/v1` 代理，SQLite 数据库存放在命名卷中。

环境变量见 [`.env.example`](../.env.example)。应用不会自动读取该文件；Compose 在配置中显式传入自己的值。`ARL_TRUSTED_HOSTS` 会替换 API 的 Host 允许列表，修改页面域名时还需同步 [`web/nginx.conf`](../web/nginx.conf) 中的 `server_name`。

## API

启动后打开 `http://127.0.0.1:8000/docs`，可以查看并调用接口：

| 接口 | 用途 |
| --- | --- |
| `GET /v1/scenarios` | 列出场景 |
| `POST /v1/runs` | 开始一次运行 |
| `POST /v1/runs/{run_id}/approvals` | 提交当前动作的审批 |
| `GET /v1/runs/{run_id}/trace?limit=100` | 读取轨迹 |
| `POST /v1/evaluations` | 执行固定套件评测 |
| `GET /v1/evaluations?limit=10` | 列出历史评测 |

例如，创建审批场景的请求体为：

```json
{"scenario_id":"approval-reconstruction","mode":"resilient"}
```

返回值包含运行 ID 和 `pending_approval`。审批时直接回传其中的 `action_step` 和 `action_fingerprint`，不要自行重算。只有运行仍在等待这个动作时，决定才会写入。完全相同的重复请求可以重放，过期或冲突请求返回 HTTP 409。`actor` 是调用方填写的标签，并没有验证身份。

评测请求使用 `{"suite":"incident-response"}`，同步执行完成后返回 HTTP 201，报告保存到 SQLite。单个 API 进程同一时间只执行一次评测；竞争请求返回 HTTP 409 和 `evaluation_in_progress`。

## 可选模型适配器

`OpenAICompatiblePolicy` 可以向 OpenAI 兼容的 `/chat/completions` 服务请求一个 `AgentAction`。它是单独的库接口，默认 CLI 和确定性基准不使用它。

```python
from agent_reliability_lab.providers.openai_compatible import (
    OpenAICompatibleConfig,
    OpenAICompatiblePolicy,
)

policy = OpenAICompatiblePolicy(
    OpenAICompatibleConfig(
        base_url="https://provider.example/v1",
        model="your-model",
        api_key_env="PROVIDER_API_KEY",
        total_timeout_seconds=45.0,
        max_response_bytes=1_048_576,
    )
)
```

远程地址要求 HTTPS，仅本地回环地址允许 HTTP；重定向关闭。默认连接和读取时限为 5 秒、30 秒，总 HTTP 时限为 45 秒。读取响应时限制为 1 MiB，可配置上限为 16 MiB；请求使用 `identity` 编码，收到编码响应时会在读取正文前拒绝。

密钥从指定环境变量读取，并纳入轨迹脱敏；返回动作若包含该密钥，会在进入运行时前被拒绝。适配器没有出站域名允许列表或网络沙箱。模型质量、提示词和多次运行的统计结果需要单独评测。

## 开发检查

```text
uv sync --dev --locked
uv run pytest -v
uv run ruff check .
uv run ruff format --check .
uv run mypy src
npm ci --prefix web
npm --prefix web test -- --run
npm --prefix web run lint
npm --prefix web run typecheck
npm --prefix web run build
```

GitHub Actions 分别运行 Python、前端、基准和容器检查。基准检查需要干净的 Git checkout；它会生成报告并对照已提交基线运行 gate。容器检查构建两个镜像并启动 Compose 验证。
