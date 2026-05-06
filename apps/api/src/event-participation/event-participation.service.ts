import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canAccessBrotherMode, canAccessCandidateMode } from "@jp2/shared-auth";
import type { CurrentUserPrincipal } from "../auth/current-user.types.js";
import { assertNotIdleApprovalPrincipal } from "../auth/idle-approval.exception.js";
import { EventParticipationRepository } from "./event-participation.repository.js";
import type { EventParticipationResponse } from "./event-participation.types.js";

@Injectable()
export class EventParticipationService {
  constructor(private readonly eventParticipationRepository: EventParticipationRepository) {}

  async markCandidatePlanningToAttend(
    principal: CurrentUserPrincipal,
    eventId: string
  ): Promise<EventParticipationResponse> {
    const assignedOrganizationUnitId = await this.loadCandidateScope(principal);
    const visible = await this.eventParticipationRepository.canParticipateInCandidateEvent(
      eventId,
      assignedOrganizationUnitId
    );

    if (!visible) {
      throw new NotFoundException("Event was not found in the current candidate scope.");
    }

    return {
      participation: await this.eventParticipationRepository.markPlanningToAttend(
        principal.id,
        eventId
      )
    };
  }

  async cancelCandidateParticipation(
    principal: CurrentUserPrincipal,
    eventId: string
  ): Promise<EventParticipationResponse> {
    await this.loadCandidateScope(principal);
    const participation = await this.eventParticipationRepository.cancelOwnParticipation(
      principal.id,
      eventId
    );

    if (!participation) {
      throw new NotFoundException("Active event participation intent was not found.");
    }

    return { participation };
  }

  async markBrotherPlanningToAttend(
    principal: CurrentUserPrincipal,
    eventId: string
  ): Promise<EventParticipationResponse> {
    const organizationUnitIds = await this.loadBrotherScope(principal);
    const visible = await this.eventParticipationRepository.canParticipateInBrotherEvent(
      eventId,
      organizationUnitIds
    );

    if (!visible) {
      throw new NotFoundException("Event was not found in the current brother scope.");
    }

    return {
      participation: await this.eventParticipationRepository.markPlanningToAttend(
        principal.id,
        eventId
      )
    };
  }

  async cancelBrotherParticipation(
    principal: CurrentUserPrincipal,
    eventId: string
  ): Promise<EventParticipationResponse> {
    await this.loadBrotherScope(principal);
    const participation = await this.eventParticipationRepository.cancelOwnParticipation(
      principal.id,
      eventId
    );

    if (!participation) {
      throw new NotFoundException("Active event participation intent was not found.");
    }

    return { participation };
  }

  private async loadCandidateScope(principal: CurrentUserPrincipal): Promise<string | null> {
    if (!canAccessCandidateMode(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Candidate access is required.");
    }

    const assignedOrganizationUnitId =
      await this.eventParticipationRepository.findActiveCandidateOrganizationUnitId(principal.id);

    if (assignedOrganizationUnitId === undefined) {
      throw new ForbiddenException("An active candidate profile is required.");
    }

    return assignedOrganizationUnitId;
  }

  private async loadBrotherScope(principal: CurrentUserPrincipal): Promise<readonly string[]> {
    if (!canAccessBrotherMode(principal)) {
      assertNotIdleApprovalPrincipal(principal);
      throw new ForbiddenException("Brother access is required.");
    }

    const organizationUnitIds =
      await this.eventParticipationRepository.findActiveBrotherOrganizationUnitIds(principal.id);

    if (!organizationUnitIds) {
      throw new NotFoundException("Active brother membership profile was not found.");
    }

    return organizationUnitIds;
  }
}
