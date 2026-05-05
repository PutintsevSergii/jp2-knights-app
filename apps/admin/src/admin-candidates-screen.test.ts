import { describe, expect, it } from "vitest";
import { fallbackAdminCandidateProfiles } from "./admin-content-fixtures.js";
import {
  buildAdminCandidateDetailScreen,
  buildAdminCandidateListScreen
} from "./admin-candidates-screen.js";

const candidateProfile = fallbackAdminCandidateProfiles[0]!;

describe("admin candidate screens", () => {
  it("builds list rows with candidate management actions", () => {
    const screen = buildAdminCandidateListScreen({
      state: "ready",
      response: { candidateProfiles: [candidateProfile] },
      runtimeMode: "api",
      canWrite: true
    });

    expect(screen).toMatchObject({
      route: "AdminCandidateList",
      state: "ready",
      title: "Candidates"
    });
    expect(screen.rows[0]?.actions.map((action) => action.id)).toEqual([
      "view",
      "pause",
      "archive"
    ]);
  });

  it("builds detail fields with only management fields writable", () => {
    const screen = buildAdminCandidateDetailScreen({
      state: "ready",
      candidateProfile,
      runtimeMode: "demo",
      canWrite: true
    });

    expect(screen.demoChromeVisible).toBe(true);
    expect(screen.fields.find((field) => field.name === "email")?.readOnly).toBe(true);
    expect(screen.fields.find((field) => field.name === "status")?.readOnly).toBe(false);
    expect(screen.fields.find((field) => field.name === "responsibleOfficerId")?.readOnly).toBe(
      false
    );
    expect(screen.actions.map((action) => action.id)).toEqual(["save", "refresh"]);
  });

  it("maps forbidden and empty states without leaking actions", () => {
    expect(
      buildAdminCandidateListScreen({ state: "forbidden", runtimeMode: "api", canWrite: true })
    ).toMatchObject({
      state: "forbidden",
      rows: [],
      actions: []
    });
    expect(
      buildAdminCandidateDetailScreen({ state: "ready", runtimeMode: "api", canWrite: false })
    ).toMatchObject({
      state: "empty",
      fields: []
    });
  });
});
