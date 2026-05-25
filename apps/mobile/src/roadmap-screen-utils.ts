import type {
  AssignedRoadmapDto,
  RoadmapStepSummaryDto,
  RoadmapSubmissionSummaryDto
} from "@jp2/shared-validation";
import { mobileCopy } from "./mobile-i18n.js";

export interface RoadmapScreenSection {
  id: string;
  title: string;
  body: string;
}

export function roadmapSummaryBody(roadmap: AssignedRoadmapDto): string {
  const stepCount = roadmap.stages.reduce((total, stage) => total + stage.steps.length, 0);

  return `${mobileCopy("roadmap.stage.count", { count: roadmap.stages.length })} - ${mobileCopy("roadmap.step.count", { count: stepCount })}`;
}

export function buildRoadmapSections(roadmap: AssignedRoadmapDto): RoadmapScreenSection[] {
  return roadmap.stages.flatMap((stage) => [
    {
      id: `stage-${stage.id}`,
      title: stage.title,
      body: mobileCopy("roadmap.step.count", { count: stage.steps.length })
    },
    ...stage.steps.map((step) => ({
      id: `step-${step.id}`,
      title: step.title,
      body: roadmapStepBody(step)
    }))
  ]);
}

function roadmapStepBody(step: RoadmapStepSummaryDto): string {
  const parts = [
    step.description,
    step.requiresSubmission
      ? mobileCopy("roadmap.step.submissionRequired")
      : mobileCopy("roadmap.step.readOnly"),
    mobileCopy("roadmap.step.statusLine", { statusLabel: roadmapStepStatusLabel(step) })
  ].filter((part): part is string => Boolean(part));

  return parts.join("\n");
}

function roadmapStepStatusLabel(step: RoadmapStepSummaryDto): string {
  if (!step.latestSubmission) {
    return mobileCopy("roadmap.status.notStarted");
  }

  return submissionStatusLabel(step.latestSubmission.status);
}

function submissionStatusLabel(status: RoadmapSubmissionSummaryDto["status"]): string {
  if (status === "pending_review") {
    return mobileCopy("roadmap.status.pendingReview");
  }

  if (status === "approved") {
    return mobileCopy("roadmap.status.approved");
  }

  return mobileCopy("roadmap.status.rejected");
}
