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
          id: "publish",
          label: "Publish",
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

describe("admin content renderer", () => {
  it("renders a ready list screen as an accessible admin table with action metadata", () => {
    const rendered = renderAdminContentListScreen(readyPrayerScreen);

    expect(rendered.route).toBe("AdminPrayerList");
    expect(rendered.state).toBe("ready");
    expect(rendered.html).toContain('data-route="AdminPrayerList"');
    expect(rendered.html).toContain("<table");
    expect(rendered.html).toContain('<th scope="col">Title</th>');
    expect(rendered.html).toContain('data-action="create"');
    expect(rendered.html).toContain('data-action="publish"');
    expect(rendered.html).toContain('data-target-id="33333333-3333-4333-8333-333333333333"');
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
          secondaryMeta: 'Scoped to "Riga"'
        }
      ],
      demoChromeVisible: true
    });

    expect(rendered.html).toContain("Demo");
    expect(rendered.html).toContain("Prayers &lt;script&gt;");
    expect(rendered.html).toContain("Manage &amp; review");
    expect(rendered.html).toContain("Morning &lt;Offering&gt;");
    expect(rendered.html).toContain("Scoped to &quot;Riga&quot;");
    expect(rendered.html).not.toContain("<script>");
  });
});
