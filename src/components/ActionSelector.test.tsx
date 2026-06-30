import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActionSelector } from "./ActionSelector";

describe("ActionSelector", () => {
  it("emits selected action", () => {
    const onChange = vi.fn();

    render(<ActionSelector onChange={onChange} value="correct" />);
    fireEvent.click(screen.getByRole("radio", { name: "Shorten" }));

    expect(onChange).toHaveBeenCalledWith("shorten");
  });
});
