import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import type { AuditLogInput, AuditLogService } from "../audit/audit-log.service.js";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import type { OrganizationRepository } from "./organization.repository.js";
import { OrganizationService } from "./organization.service.js";
import type { OrganizationUnitSummary } from "./organization.types.js";

const organizationUnitA: OrganizationUnitSummary = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "CHORAGIEW",
  parentUnitId: null,
  name: "Pilot Organization Unit",
  city: "Riga",
  country: "LV",
  parish: null,
  publicDescription: "Pilot",
  status: "active"
};

const organizationUnitB: OrganizationUnitSummary = {
  id: "22222222-2222-4222-8222-222222222222",
  type: "COMMANDERY",
  parentUnitId: null,
  name: "Second Scope Organization Unit",
  city: "Warsaw",
  country: "PL",
  parish: null,
  publicDescription: "Second",
  status: "active"
};

const brother: CurrentUserPrincipal = {
  id: "brother_1",
  email: "brother@example.test",
  displayName: "Demo Brother",
  status: "active",
  roles: ["BROTHER"],
  memberOrganizationUnitIds: [organizationUnitA.id]
};

const officer: CurrentUserPrincipal = {
  id: "officer_1",
  email: "officer@example.test",
  displayName: "Demo Officer",
  status: "active",
  roles: ["OFFICER"],
  officerOrganizationUnitIds: [organizationUnitA.id]
};

describe("OrganizationService", () => {
  it("returns all active brother membership organization units", async () => {
    await expect(service().getMyOrganizationUnits(brother)).resolves.toEqual({
      organizationUnits: [organizationUnitA]
    });
  });

  it("blocks non-brothers from brother organization unit access", async () => {
    await expect(service().getMyOrganizationUnits(officer)).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });

  it("fails closed when a brother has no active membership organization unit", async () => {
    await expect(
      service(repository({ membershipOrganizationUnits: [] })).getMyOrganizationUnits(brother)
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("limits officers to assigned organization unit records", async () => {
    await expect(service().listAdminOrganizationUnits(officer)).resolves.toEqual({
      organizationUnits: [organizationUnitA]
    });
  });

  it("allows super admins to list all active organization unit records", async () => {
    await expect(
      service().listAdminOrganizationUnits({
        id: "admin_1",
        email: "admin@example.test",
        displayName: "Demo Admin",
        status: "active",
        roles: ["SUPER_ADMIN"]
      })
    ).resolves.toEqual({
      organizationUnits: [organizationUnitA, organizationUnitB]
    });
  });

  it("blocks non-admin users from admin organization unit listing", async () => {
    await expect(service().listAdminOrganizationUnits(brother)).rejects.toBeInstanceOf(
      ForbiddenException
    );
  });

  it("allows super admins to create organization unit records", async () => {
    const auditLog = auditLogRecorder();
    const organizationService = service(
      repository({ membershipOrganizationUnits: [organizationUnitA] }),
      auditLog
    );

    await expect(
      organizationService.createAdminOrganizationUnit(
        {
          id: "admin_1",
          email: "admin@example.test",
          displayName: "Demo Admin",
          status: "active",
          roles: ["SUPER_ADMIN"]
        },
        {
          type: "CHORAGIEW",
          name: "New Organization Unit",
          city: "Vilnius",
          country: "LT"
        }
      )
    ).resolves.toEqual({
      organizationUnit: {
        ...organizationUnitA,
        name: "New Organization Unit",
        city: "Vilnius",
        country: "LT",
        publicDescription: null
      }
    });
    expect(auditLog.records).toEqual([
      {
        action: "admin.organizationUnit.create",
        actorUserId: "admin_1",
        entityType: "organization_unit",
        entityId: organizationUnitA.id,
        scopeOrganizationUnitId: organizationUnitA.id,
        beforeSummary: null,
        afterSummary: {
          type: "CHORAGIEW",
          parentUnitId: null,
          name: "New Organization Unit",
          city: "Vilnius",
          country: "LT",
          parish: null,
          status: "active"
        }
      }
    ]);
  });

  it("blocks officers from creating or updating organization unit records", async () => {
    await expect(
      service().createAdminOrganizationUnit(officer, {
        type: "CHORAGIEW",
        name: "Blocked",
        city: "Blocked",
        country: "LV"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service().updateAdminOrganizationUnit(officer, organizationUnitA.id, {
        status: "archived"
      })
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("allows super admins to update and archive organization unit records", async () => {
    const auditLog = auditLogRecorder();
    const organizationService = service(
      repository({ membershipOrganizationUnits: [organizationUnitA] }),
      auditLog
    );

    await expect(
      organizationService.updateAdminOrganizationUnit(
        {
          id: "admin_1",
          email: "admin@example.test",
          displayName: "Demo Admin",
          status: "active",
          roles: ["SUPER_ADMIN"]
        },
        organizationUnitA.id,
        {
          status: "archived"
        }
      )
    ).resolves.toEqual({
      organizationUnit: {
        ...organizationUnitA,
        status: "archived"
      }
    });
    expect(auditLog.records).toEqual([
      {
        action: "admin.organizationUnit.update",
        actorUserId: "admin_1",
        entityType: "organization_unit",
        entityId: organizationUnitA.id,
        scopeOrganizationUnitId: organizationUnitA.id,
        beforeSummary: {
          type: "CHORAGIEW",
          parentUnitId: null,
          name: "Pilot Organization Unit",
          city: "Riga",
          country: "LV",
          parish: null,
          status: "active"
        },
        afterSummary: {
          type: "CHORAGIEW",
          parentUnitId: null,
          name: "Pilot Organization Unit",
          city: "Riga",
          country: "LV",
          parish: null,
          status: "archived"
        }
      }
    ]);
  });
});

function service(
  repositoryOverride: OrganizationRepository = repository({
    membershipOrganizationUnits: [organizationUnitA]
  }),
  auditLog: TestAuditLog = auditLogRecorder()
): OrganizationService {
  return new OrganizationService(repositoryOverride, auditLog as unknown as AuditLogService);
}

function repository(options: {
  membershipOrganizationUnits: OrganizationUnitSummary[];
}): OrganizationRepository {
  return {
    findActiveMembershipOrganizationUnits: () =>
      Promise.resolve(options.membershipOrganizationUnits),
    listActiveOrganizationUnits: () => Promise.resolve([organizationUnitA, organizationUnitB]),
    listActiveOrganizationUnitsByIds: (ids) =>
      Promise.resolve(
        [organizationUnitA, organizationUnitB].filter((organizationUnit) =>
          ids.includes(organizationUnit.id)
        )
      ),
    createOrganizationUnit: (data) =>
      Promise.resolve({
        ...organizationUnitA,
        ...data,
        parentUnitId: data.parentUnitId ?? null,
        parish: data.parish ?? null,
        publicDescription: data.publicDescription ?? null,
        status: "active"
      }),
    findOrganizationUnitForAudit: (id) =>
      Promise.resolve(id === organizationUnitA.id ? organizationUnitA : null),
    updateOrganizationUnit: (_id, data) => {
      const updated: OrganizationUnitSummary = { ...organizationUnitA };

      if (data.type !== undefined) updated.type = data.type;
      if (data.parentUnitId !== undefined) updated.parentUnitId = data.parentUnitId;
      if (data.name !== undefined) updated.name = data.name;
      if (data.city !== undefined) updated.city = data.city;
      if (data.country !== undefined) updated.country = data.country;
      if (data.parish !== undefined) updated.parish = data.parish;
      if (data.publicDescription !== undefined) updated.publicDescription = data.publicDescription;
      if (data.status !== undefined) updated.status = data.status;

      return Promise.resolve(updated);
    }
  };
}

interface TestAuditLog {
  records: AuditLogInput[];
  record: (input: AuditLogInput) => Promise<void>;
}

function auditLogRecorder(): TestAuditLog {
  const records: AuditLogInput[] = [];

  return {
    records,
    record: (input) => {
      records.push(input);
      return Promise.resolve();
    }
  };
}
