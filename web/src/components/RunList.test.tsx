import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RunList } from "./RunList";
import { runFixture } from "../test/fixtures";

describe("RunList", () => {
  it("renders a semantic six-field recent-runs table", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<RunList runs={[runFixture()]} state="ready" onSelect={onSelect} />);

    expect(screen.getByRole("table", { name: "最近运行" })).toBeVisible();
    for (const heading of ["运行", "场景", "模式", "状态", "尝试次数", "开始时间"]) {
      expect(screen.getByRole("columnheader", { name: heading })).toBeVisible();
    }
    expect(screen.getByText("11111111-1111-1111-1111-111111111111")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /打开运行/ }));
    expect(onSelect).toHaveBeenCalledWith("11111111-1111-1111-1111-111111111111");
  });

  it("renders explicit loading, empty, and recoverable error states", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<RunList runs={[]} state="loading" />);
    expect(screen.getByLabelText("正在加载最近运行")).toBeVisible();

    rerender(<RunList runs={[]} state="ready" />);
    expect(screen.getByText("暂无运行记录")).toBeVisible();

    rerender(<RunList runs={[]} state="error" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("无法获取运行记录");
    await user.click(screen.getByRole("button", { name: "重试" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
