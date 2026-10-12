# 应用下载

打开 [v0.2.0 Release](https://github.com/SCUliujiacheng/agent-reliability-lab-zh/releases/tag/v0.2.0)，选择适合设备的附件。GitHub 页面底部的 Source code 压缩包用于源码开发。

| 设备 | 附件 | 启动方式 |
| --- | --- | --- |
| Windows x64 | 以 `windows-x64.zip` 结尾的 ZIP | 完整解压，运行 `agent-reliability-lab-zh.exe`。 |
| Apple silicon Mac | 以 `macos-arm64.zip` 结尾的 ZIP | 解压并打开 `.app`。 |
| Intel Mac | 以 `macos-x64.zip` 结尾的 ZIP | 解压并打开 `.app`。 |
| Android 7.0 及以上，64 位 | APK | 安装 APK，打开 Agent Reliability Lab 中文。 |

这是首批应用构建，标记为预发布版本。桌面包尚无商业 Windows 发布者证书或 Apple 公证。构建与模拟器验证不能证明所有真机均兼容。Release 的校验和用于比对下载文件与发布构建是否一致。

## 实际运行内容

桌面应用启动现有 FastAPI / Pydantic / SQLAlchemy 引擎，在浏览器打开控制台。启动页面有退出按钮；只关闭控制台标签页不会停止进程。每次启动使用独立的本机会话，Python、页面、六个场景和相关许可证已随包提供。

Android 在应用内运行只依赖 Python 标准库的离线执行器。超时或限流规则会产生真实失败尝试，resilient 模式随后重试；无效输入和异常输出会被拒绝。审批绑定具体动作步骤和指纹。SQLite 保存运行、连续事件、审批决定与模拟回滚准备，关闭后重新打开可从最后提交的检查点继续。它不会操作真实基础设施。

手机报告使用 `report_version: mobile/v1` 和 `grader_version: mobile-exact/v1`。每次评测创建十二个新运行，再从持久化事件计算数量、恢复率与工具序列准确率。轨迹缺失或发生变化时，报告读取会明确失败。报告保留场景来源哈希和构建提交信息，不能交给桌面 `arl gate` 当作 `exact-v6` 报告使用。不同引擎和设备的耗时本来就会不同。

手机版本不包含任意场景导入、外部模型、完整命令行或桌面的多进程执行租约系统。它用于离线实验，不能作为生产事故控制器。点击“导出轨迹”后，可通过 Android 文件选择器保存所选运行。若进程在执行中停止，可打开已保存的记录，点击“继续原运行”，从已提交的检查点继续同一个运行 ID。场景定义改变后会拒绝续跑旧记录；请先导出轨迹，再创建新运行。

应用升级后，报告仍保留生成当时的构建提交和版本。旧场景集合不兼容时，不会用新规则悄悄重算：页面会提示旧报告读取失败，但仍可查看运行、执行场景和生成新评估。

## 数据保存在哪里

桌面记录与解压目录分开保存：

- Windows：`%LOCALAPPDATA%\agent-reliability-lab-zh`。
- macOS：`~/Library/Application Support/agent-reliability-lab-zh`。
- 也可用 `--data-dir` 明确指定其他目录。

Android 使用应用私有目录，并排除自动备份。升级应用会保留该目录，卸载或清除应用数据会移除记录；卸载前请导出需要保留的轨迹。复制或删除桌面解压目录，不会移动或删除用户数据。

中英文应用使用不同的应用 ID 和数据目录；页面语言不同，六个场景定义和移动执行代码相同。

## 从源码构建

```text
uv sync --locked --dev --group build
npm ci --prefix web
npm --prefix web run build
uv run --group build python distribution/build_desktop.py
```

桌面包必须在对应操作系统构建。构建器会把冻结程序复制到包含空格和中文的独立目录，检查会话鉴权与内置页面，再通过真实 API 执行重试、重复审批和十二次运行的完整评测，通过后才生成 ZIP。Android Gradle 构建通过 `distribution/prepare_android.py` 仅收集明确列出的资源与标准库移动执行器。重复准备资源时，只清理带有生成目录所有权标记的输出；未标记的非空目录会被拒绝。

应用测试把六场景的两种模式逐一与桌面引擎比对，检查结果、逻辑工具顺序、失败与成功尝试及重试次数；还覆盖审批冲突与重复、执行中断后重新打开、并发审批、轨迹分页、证据损坏和轨迹导出。真机验证是独立的发布步骤。
