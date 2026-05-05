import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../database/prisma.service.js";
import type {
  CreateOrganizationUnitRequest,
  OrganizationUnitSummary,
  UpdateOrganizationUnitRequest
} from "./organization.types.js";

export abstract class OrganizationRepository {
  abstract findActiveMembershipOrganizationUnits(userId: string): Promise<OrganizationUnitSummary[]>;
  abstract listActiveOrganizationUnits(): Promise<OrganizationUnitSummary[]>;
  abstract listActiveOrganizationUnitsByIds(
    ids: readonly string[]
  ): Promise<OrganizationUnitSummary[]>;
  abstract createOrganizationUnit(
    data: CreateOrganizationUnitRequest
  ): Promise<OrganizationUnitSummary>;
  abstract findOrganizationUnitForAudit(id: string): Promise<OrganizationUnitSummary | null>;
  abstract updateOrganizationUnit(
    id: string,
    data: UpdateOrganizationUnitRequest
  ): Promise<OrganizationUnitSummary>;
}

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveMembershipOrganizationUnits(userId: string): Promise<OrganizationUnitSummary[]> {
    const memberships = await this.prisma.membership.findMany({
      where: {
        userId,
        status: "active",
        archivedAt: null,
        organizationUnit: {
          status: "active",
          archivedAt: null
        }
      },
      include: {
        organizationUnit: true
      },
      orderBy: [{ organizationUnit: { country: "asc" } }, { organizationUnit: { city: "asc" } }]
    });

    return memberships.map((membership) => toOrganizationUnitSummary(membership.organizationUnit));
  }

  async listActiveOrganizationUnits(): Promise<OrganizationUnitSummary[]> {
    const records = await this.prisma.organizationUnit.findMany({
      where: {
        status: "active",
        archivedAt: null
      },
      orderBy: [{ country: "asc" }, { city: "asc" }, { name: "asc" }]
    });

    return records.map(toOrganizationUnitSummary);
  }

  async listActiveOrganizationUnitsByIds(ids: readonly string[]): Promise<OrganizationUnitSummary[]> {
    if (ids.length === 0) {
      return [];
    }

    const records = await this.prisma.organizationUnit.findMany({
      where: {
        id: {
          in: [...ids]
        },
        status: "active",
        archivedAt: null
      },
      orderBy: [{ country: "asc" }, { city: "asc" }, { name: "asc" }]
    });

    return records.map(toOrganizationUnitSummary);
  }

  async createOrganizationUnit(
    data: CreateOrganizationUnitRequest
  ): Promise<OrganizationUnitSummary> {
    const record = await this.prisma.organizationUnit.create({
      data: {
        type: data.type,
        parentUnitId: data.parentUnitId ?? null,
        name: data.name,
        city: data.city,
        country: data.country,
        parish: data.parish ?? null,
        publicDescription: data.publicDescription ?? null
      }
    });

    return toOrganizationUnitSummary(record);
  }

  async findOrganizationUnitForAudit(id: string): Promise<OrganizationUnitSummary | null> {
    const record = await this.prisma.organizationUnit.findUnique({
      where: { id }
    });

    return record ? toOrganizationUnitSummary(record) : null;
  }

  async updateOrganizationUnit(
    id: string,
    data: UpdateOrganizationUnitRequest
  ): Promise<OrganizationUnitSummary> {
    const updateData: Prisma.OrganizationUnitUncheckedUpdateInput = {};

    if (data.type !== undefined) updateData.type = data.type;
    if (data.parentUnitId !== undefined) updateData.parentUnitId = data.parentUnitId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.parish !== undefined) updateData.parish = data.parish;
    if (data.publicDescription !== undefined) updateData.publicDescription = data.publicDescription;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.status === "archived") updateData.archivedAt = new Date();
    if (data.status === "active") updateData.archivedAt = null;

    const record = await this.prisma.organizationUnit.update({
      where: { id },
      data: updateData
    });

    return toOrganizationUnitSummary(record);
  }
}

interface OrganizationUnitRecord {
  id: string;
  type: "ORDER" | "PROVINCE" | "COMMANDERY" | "CHORAGIEW" | "OTHER";
  parentUnitId: string | null;
  name: string;
  city: string;
  country: string;
  parish: string | null;
  publicDescription: string | null;
  status: "active" | "archived";
}

function toOrganizationUnitSummary(record: OrganizationUnitRecord): OrganizationUnitSummary {
  return {
    id: record.id,
    type: record.type,
    parentUnitId: record.parentUnitId,
    name: record.name,
    city: record.city,
    country: record.country,
    parish: record.parish,
    publicDescription: record.publicDescription,
    status: record.status
  };
}
