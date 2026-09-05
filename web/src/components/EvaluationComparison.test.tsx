import { render, screen, within } from "@testing-library/react";

import { EvaluationComparison } from "./EvaluationComparison";
import { evaluationFixture } from "../test/fixtures";

describe("EvaluationComparison", () => {
  it("renders sentinel API metrics and labels correctness improvement in text", () => {
    render(<EvaluationComparison report={evaluationFixture()} />);

    expect(screen.getByText("58.4%")).toBeVisible();
    expect(screen.getByText("91.7%")).toBeVisible();
    expect(screen.getByText("+33.3 个百分点")).toBeVisible();
    expect(screen.getAllByText("已改善").length).toBeGreaterThan(0);
  });

  it("uses lower-is-better direction for invalid outputs and latency", () => {
    render(<EvaluationComparison report={evaluationFixture()} />);

    const invalid = screen.getByRole("row", { name: /接受的无效输出/i });
    const latency = screen.getByRole("row", { name: /P95 延迟/i });
    expect(within(invalid).getByText("已改善")).toBeVisible();
    expect(within(latency).getByText("有回退")).toBeVisible();
  });

  it("renders null recovery as unavailable", () => {
    render(
      <EvaluationComparison
        report={evaluationFixture(
          { recovery_rate: null },
          { recovery_rate: null },
        )}
      />,
    );

    expect(screen.getAllByText("暂不可用").length).toBeGreaterThanOrEqual(2);
  });
});
