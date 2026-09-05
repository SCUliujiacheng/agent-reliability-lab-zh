import { render, screen, within } from "@testing-library/react";

import { Navigation } from "./Navigation";

describe("Navigation", () => {
  it("exposes the localized primary navigation without changing anchors", () => {
    render(<Navigation />);

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    for (const [name, href] of [
      ["概览", "#overview"],
      ["运行记录", "#runs"],
      ["评测", "#evaluations"],
      ["场景", "#scenarios"],
    ] as const) {
      expect(within(navigation).getByRole("link", { name })).toHaveAttribute("href", href);
    }
    expect(screen.getAllByRole("link", { name: "Agent Reliability Lab 首页" })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "切换导航" })).toBeVisible();
  });
});
