# 架构图怎么来的

这张图由 `agent-reliability-lab.architecture.json` 生成，产物是一个不依赖
外部运行时的交互式 HTML。中文仓库对应这份说明；英文仓库保留自己的图和说明。

JSON 负责组件、关系和说明卡，生成的 HTML 提供主题切换、pan/zoom、搜索、
guided views、关系追踪和离线导出。`agent-reliability-lab-architecture.visual-check.html`
把四张检查截图拼在一起，方便快速查看；需要交互时请直接打开主 HTML。

## 我检查了什么

生成时验证了 JSON 中的 17 个仓库引用，并跑过 9 / 9 项结构检查；组成检查为
0 errors、0 warnings。当前规格 SHA-256 是
`e637ff2b3915a643e7db652f09c5036aea68d56991b6e6f85723a9eca06a388b`，HTML
SHA-256 是 `550e7a6028396216682fa96936a4cb15db76f51f307c7430eaf1d166e73fb9cf`。

我还在 1440 × 900、1600 × 1000、1920 × 1080 与 2048 × 1320 检查了 containment
和可读性。每个视口都没有横向或纵向 document overflow，最小投影节点文字高于
6 px 的检查下限。1440 × 900 和 2048 × 1320 的浅色、深色截图也人工看过：中文
节点、关系标签和三张说明卡没有被裁切，也没有发现路线碰撞或难以判断的 corridor。

`visualReview: "pending"` 仍保留在自动结果中，因为它只表示机器检查过边界，
不是对视觉质量的替代判断。
