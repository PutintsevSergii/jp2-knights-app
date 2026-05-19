import type { AssignedRoadmapDto, AssignedRoadmapResponseDto } from "@jp2/shared-validation";

export type RoadmapTargetRole = "CANDIDATE" | "BROTHER";

export interface RoadmapCandidateAccessProfile {
  assignedOrganizationUnitId: string | null;
}

export interface RoadmapBrotherAccessProfile {
  organizationUnitIds: readonly string[];
}

export interface AssignedRoadmapLookup {
  userId: string;
  targetRole: RoadmapTargetRole;
  organizationUnitIds: readonly string[];
  now?: Date;
}

export type AssignedRoadmap = AssignedRoadmapDto;
export type AssignedRoadmapResponse = AssignedRoadmapResponseDto;
