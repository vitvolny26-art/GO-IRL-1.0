import { describe, expect, it } from "vitest";

import {
  eventMainBlockOrder,
  hasRequiredEventMainBlockSections,
  isChatFinalEventMainBlockSection,
} from "./event-main-block.js";

describe("event main block presentation", () => {
  it("keeps details, participants and chat in the shared block", () => {
    expect(hasRequiredEventMainBlockSections()).toBe(true);
    expect(eventMainBlockOrder).toEqual(["details", "participants", "chat"]);
  });

  it("keeps chat as the final section", () => {
    expect(isChatFinalEventMainBlockSection()).toBe(true);
    expect(isChatFinalEventMainBlockSection(["details", "chat", "participants"])).toBe(false);
  });
});
