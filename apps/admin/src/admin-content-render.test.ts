import { describe, expect, it } from "vitest";
import type { AdminContentListScreen } from "./admin-content-screens.js";
import { adminContentTheme } from "./admin-content-screens.js";
import { renderAdminContentListScreen } from "./admin-content-render.js";

const readyPrayerScreen: AdminContentListScreen = {
  route: "AdminPrayerList",
  state: "ready",
  title: "Prayers",
  body: "Manage prayer content.",
  rows: [
    {
      id: "33333333-3333-4333-8333-333333333333",
      title: "Morning Offering",
      primaryMeta: "EN / Public",
      secondaryMeta: "Global content",
      status: "DRAFT",
      visibility: "PUBLIC",
      targetOrganizationUnitId: null,
      actions: [
        {
          id: "edit",
          label: "Edit",
          targetRoute: "AdminPrayerEditor",
          targetId: "33333333-3333-4333-8333-333333333333"
        },
        {
          id: "approve",
          label: "Approve",
          targetRoute: "AdminPrayerEditor",
          targetId: "33333333-3333-4333-8333-333333333333"
        },
        {
          id: "archive",
          label: "Archive",
          targetRoute: "AdminPrayerEditor",
          targetId: "33333333-3333-4333-8333-333333333333"
        }
      ]
    }
  ],
  actions: [
    {
      id: "create",
      label: "Create",
      targetRoute: "AdminPrayerEditor"
    },
    {
      id: "refresh",
      label: "Refresh",
      targetRoute: "AdminPrayerEditor"
    }
  ],
  demoChromeVisible: false,
  theme: adminContentTheme
};

const readyEventScreen: AdminContentListScreen = {
  route: "AdminEventList",
  state: "ready",
  title: "Events",
  body: "Manage event content.",
  rows: [
    {
      id: "44444444-4444-4444-8444-444444444444",
      title: "Open Evening",
      primaryMeta: "open-evening / 2026-06-10T18:00:00.000Z",
      secondaryMeta: "Riga",
      detailItems: [
        {
          id: "type",
          label: "Type",
          value: "open-evening"
        },
        {
          id: "start",
          label: "Start",
          value: "2026-06-10T18:00:00.000Z"
        },
        {
          id: "location",
          label: "Location",
          value: "Riga"
        },
        {
          id: "scope",
          label: "Scope",
          value: "Global public scope"
        }
      ],
      status: "published",
      visibility: "PUBLIC",
      targetOrganizationUnitId: null,
      actions: [
        {
          id: "edit",
          label: "Edit",
          targetRoute: "AdminEventEditor",
          targetId: "44444444-4444-4444-8444-444444444444"
        },
        {
          id: "cancel",
          label: "Cancel",
          targetRoute: "AdminEventEditor",
          targetId: "44444444-4444-4444-8444-444444444444"
        },
        {
          id: "archive",
          label: "Archive",
          targetRoute: "AdminEventEditor",
          targetId: "44444444-4444-4444-8444-444444444444"
        }
      ]
    }
  ],
  actions: [
    {
      id: "refresh",
      label: "Refresh",
      targetRoute: "AdminEventEditor"
    }
  ],
  demoChromeVisible: false,
  theme: adminContentTheme
};

describe("admin content renderer", () => {
  it("renders a ready list screen as an accessible admin table with action metadata", () => {
    const rendered = renderAdminContentListScreen(readyPrayerScreen);

    expect(rendered.route).toBe("AdminPrayerList");
    expect(rendered.state).toBe("ready");
    expect(rendered.html).toContain('data-route="AdminPrayerList"');
    expect(rendered.html).toContain("<table");
    expect(rendered.html).toContain('<th scope="col">Title</th>');
    expect(rendered.html).toContain('data-action="create"');
    expect(rendered.html).toContain('data-action="approve"');
    expect(rendered.html).toContain('data-target-id="33333333-3333-4333-8333-333333333333"');
  });

  it("renders event management as responsive cards without attendee actions", () => {
    const rendered = renderAdminContentListScreen(readyEventScreen);

    expect(rendered.route).toBe("AdminEventList");
    expect(rendered.html).toContain('data-content-layout="event-cards"');
    expect(rendered.html).toContain('class="admin-content__card"');
    expect(rendered.html).toContain("Open Evening");
    expect(rendered.html).toContain("Global public scope");
    expect(rendered.html).toContain('data-action="cancel"');
    expect(rendered.html).not.toContain("<table");
    expect(rendered.html).not.toMatch(/attendee|participant|rsvp/i);
  });

  it("renders empty and forbidden states without mutation actions", () => {
    const rendered = renderAdminContentListScreen({
      ...readyPrayerScreen,
      state: "forbidden",
      title: "Access Denied",
      body: "Admin Lite access is required.",
      rows: [],
      actions: []
    });

    expect(rendered.html).toContain('role="status"');
    expect(rendered.html).toContain("Access Denied");
    expect(rendered.html).not.toContain('data-action="create"');
    expect(rendered.html).not.toContain("<table");
  });

  it("renders demo chrome and escapes dynamic text", () => {
    const rendered = renderAdminContentListScreen({
      ...readyPrayerScreen,
      title: "Prayers <script>",
      body: "Manage & review",
      rows: [
        {
          ...readyPrayerScreen.rows[0]!,
          title: "Morning <Offering>",
          secondaryMeta: 'Scoped to "Riga"',
          approvalWarning: "Published <without> approval metadata"
        }
      ],
      demoChromeVisible: true
    });

    expect(rendered.html).toContain("Demo");
    expect(rendered.html).toContain("Prayers &lt;script&gt;");
    expect(rendered.html).toContain("Manage &amp; review");
    expect(rendered.html).toContain("Morning &lt;Offering&gt;");
    expect(rendered.html).toContain("Scoped to &quot;Riga&quot;");
    expect(rendered.html).toContain("Published &lt;without&gt; approval metadata");
    expect(rendered.html).toContain('class="admin-content__warning"');
    expect(rendered.html).not.toContain("<script>");
  });
});
