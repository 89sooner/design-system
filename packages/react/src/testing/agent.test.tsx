// FR-CMP-016 · CR-061: Conversation, Message, PromptInput, Reasoning, Tool, Confirmation, Sources,
// InlineCitation, Suggestions, Shimmer.
import { useState, type ComponentProps } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { Confirmation, Conversation, InlineCitation, Message, PromptInput, Reasoning, Shimmer, Sources, Suggestion, Suggestions, Tool } from "../agent";
import { runContractSuite } from "./contract";

afterEach(cleanup);
runContractSuite<HTMLDivElement, ComponentProps<typeof Conversation>>("Conversation", Conversation, {}, "cdt-conversation");
runContractSuite<HTMLDivElement, ComponentProps<typeof Message>>("Message", Message, { from: "assistant", children: "Hi" }, "cdt-message");
runContractSuite<HTMLSpanElement, ComponentProps<typeof Shimmer>>("Shimmer", Shimmer, { children: "Thinking" }, "cdt-shimmer");
runContractSuite<HTMLDivElement, ComponentProps<typeof Suggestions>>("Suggestions", Suggestions, {}, "cdt-suggestions");

describe("FR-CMP-016 Conversation and Message", () => {
  test("AC-1: the conversation is a named log; a message is a group named by its sender", () => {
    render(<Conversation><Message from="user">Summarise the incident</Message><Message from="assistant" name="Conductor">Three services were affected.</Message></Conversation>);
    const log = screen.getByRole("log", { name: "Conversation" });
    expect(log.getAttribute("tabindex")).toBe("0");
    expect(screen.getByRole("group", { name: "You" }).classList.contains("cdt-message--user")).toBe(true);
    expect(screen.getByRole("group", { name: "Conductor" }).textContent).toContain("Three services");
  });

  test("AC-2: a streaming message is busy and says so; an error message raises an alert", () => {
    const { rerender } = render(<Message from="assistant" status="streaming">Partial answer</Message>);
    const group = screen.getByRole("group", { name: /^Assistant\s*, Responding$/ });
    expect(group.getAttribute("aria-busy")).toBe("true");
    expect(group.querySelector(".cdt-message__caret")?.getAttribute("aria-hidden")).toBe("true");
    rerender(<Message from="assistant" status="error" labels={{ error: "응답에 실패했습니다." }}>Partial answer</Message>);
    expect(screen.getByRole("alert").textContent).toBe("응답에 실패했습니다.");
    expect(screen.getByRole("group").getAttribute("aria-busy")).toBeNull();
  });
});

describe("FR-CMP-016 PromptInput", () => {
  function Prompt(props: Partial<ComponentProps<typeof PromptInput>> & { readonly onSend?: (value: string) => void }) {
    const [value, setValue] = useState(props.value ?? "");
    return <PromptInput {...props} value={value} onValueChange={setValue} onSubmit={(text) => { props.onSend?.(text); setValue(""); }} />;
  }

  test("AC-3: Enter sends, Shift+Enter does not, blank text never sends, and the field clears", () => {
    const send = vi.fn();
    render(<Prompt onSend={send} />);
    const box = screen.getByRole("textbox", { name: "Message" });
    expect((screen.getByRole("button", { name: "Send" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.keyDown(box, { key: "Enter" });
    fireEvent.change(box, { target: { value: "Deploy the fix" } });
    fireEvent.keyDown(box, { key: "Enter", shiftKey: true });
    expect(send).not.toHaveBeenCalled();
    fireEvent.keyDown(box, { key: "Enter" });
    expect(send).toHaveBeenCalledWith("Deploy the fix");
    expect((box as HTMLTextAreaElement).value).toBe("");
  });

  test("AC-3: Enter that confirms an IME composition does not send", () => {
    const send = vi.fn();
    render(<Prompt onSend={send} value="안녕" />);
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter", isComposing: true, keyCode: 229 });
    expect(send).not.toHaveBeenCalled();
  });

  test("AC-3: mod-enter mode sends only with ⌘/Ctrl, and the button submits the form", () => {
    const send = vi.fn();
    render(<Prompt onSend={send} value="Ship it" submitOn="mod-enter" />);
    const box = screen.getByRole("textbox");
    fireEvent.keyDown(box, { key: "Enter" });
    expect(send).not.toHaveBeenCalled();
    fireEvent.keyDown(box, { key: "Enter", ctrlKey: true });
    expect(send).toHaveBeenCalledTimes(1);
    fireEvent.change(box, { target: { value: "Again" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(send).toHaveBeenLastCalledWith("Again");
  });

  test("AC-3: while streaming the button is Stop and calls onStop; text cannot be sent", () => {
    const stop = vi.fn();
    const send = vi.fn();
    render(<Prompt onSend={send} value="Next" status="streaming" onStop={stop} toolbar={<span>Model: fast</span>} />);
    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(stop).toHaveBeenCalledTimes(1);
    expect(send).not.toHaveBeenCalled();
    expect(screen.getByText("Model: fast")).toBeTruthy();
  });
});

describe("FR-CMP-016 Reasoning and Tool", () => {
  test("AC-4: reasoning opens while streaming and closes once when it ends", () => {
    const { rerender } = render(<Reasoning streaming>Comparing the two deployments…</Reasoning>);
    const trigger = screen.getByRole("button", { name: /Thinking/ });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.querySelector(".cdt-shimmer")).not.toBeNull();
    rerender(<Reasoning streaming={false} duration={4}>Comparing the two deployments…</Reasoning>);
    const done = screen.getByRole("button", { name: /Thought for 4 seconds/ });
    expect(done.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(done);
    expect(done.getAttribute("aria-expanded")).toBe("true");
  });

  test("AC-5: a tool call shows its name and status as text; input renders as JSON and output as code", () => {
    render(<Tool name="github.search_issues" status="completed" input={{ query: "label:bug", limit: 5 }} output="3 issues found" defaultOpen />);
    const trigger = screen.getByRole("button", { name: /github\.search_issues/ });
    expect(trigger.textContent).toContain("Completed");
    expect(screen.getByRole("region", { name: "github.search_issues Parameters" }).textContent).toContain('"limit": 5');
    expect(screen.getByRole("region", { name: "github.search_issues Result" }).textContent).toBe("3 issues found");
  });

  test("AC-5: error and awaiting-approval statuses carry their own text and rail class", () => {
    const { container, rerender } = render(<Tool name="deploy" status="error" errorText="Permission denied" defaultOpen />);
    expect(container.firstElementChild?.classList.contains("cdt-tool--error")).toBe(true);
    expect(screen.getByText("Permission denied")).toBeTruthy();
    rerender(<Tool name="deploy" status="awaiting-approval" labels={{ status: { "awaiting-approval": "승인 대기" } }} />);
    expect(screen.getByRole("button", { name: /deploy/ }).textContent).toContain("승인 대기");
  });
});

describe("FR-CMP-016 Confirmation", () => {
  test("AC-6: pending shows Approve and Reject; a decision replaces them with the outcome", () => {
    const approve = vi.fn();
    const { rerender } = render(<Confirmation title="Merge pull request #42?" description="Two checks are still running." state="pending" onApprove={approve} onReject={() => undefined} />);
    expect(screen.getByRole("region", { name: "Merge pull request #42?" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Approve" }));
    expect(approve).toHaveBeenCalledTimes(1);
    rerender(<Confirmation title="Merge pull request #42?" state="approved" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("Approved")).toBeTruthy();
  });

  test("AC-6: busy and missing handlers disable the buttons", () => {
    render(<Confirmation title="Run migration?" state="pending" onApprove={() => undefined} busy />);
    expect((screen.getByRole("button", { name: "Approve" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Reject" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("FR-CMP-016 Sources, InlineCitation and Suggestions", () => {
  const sources = [{ href: "https://example.com/runbook", title: "Incident runbook", description: "Steps for paging the on-call." }, { href: "https://example.com/postmortem", title: "Postmortem" }];

  test("AC-7: sources summarise their count and open to a list of external links", () => {
    render(<Sources sources={sources} />);
    fireEvent.click(screen.getByRole("button", { name: "Used 2 sources" }));
    const link = screen.getByRole("link", { name: "Incident runbook" });
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    cleanup();
    const { container } = render(<Sources sources={[]} />);
    expect(container.firstElementChild).toBeNull();
  });

  test("AC-7: a citation is named by its number and source and opens a popover with the link", async () => {
    render(<p>Page the on-call first<InlineCitation index={1} source={sources[0]!} />.</p>);
    fireEvent.click(screen.getByRole("button", { name: "Source 1: Incident runbook" }));
    await waitFor(() => expect(screen.getByRole("dialog").textContent).toContain("Steps for paging the on-call."));
  });

  test("AC-8: suggestions are a named group of buttons that send their text", () => {
    const pick = vi.fn();
    render(<Suggestions><Suggestion suggestion="Show failed runs" onSelect={pick} /><Suggestion suggestion="Summarise today's approvals" onSelect={pick}>Today's approvals</Suggestion></Suggestions>);
    expect(screen.getByRole("group", { name: "Suggestions" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Today's approvals" }));
    expect(pick).toHaveBeenCalledWith("Summarise today's approvals");
  });
});
