export const RETENTION_BUCKETS = [
  "short_lived_presence",
  "short_lived_technical",
  "operational",
  "community_record",
  "sensitive_review",
  "audit"
] as const;

export type RetentionBucket = (typeof RETENTION_BUCKETS)[number];

export type RetentionDurationPolicy =
  | "provider_ttl_or_cleanup_job"
  | "deployment_configured_after_legal_review"
  | "append_only_redacted";

export type RetentionCapability =
  | "automatic_expiry"
  | "purge_or_anonymize"
  | "revoke_or_delete_obsolete"
  | "archive_instead_of_delete"
  | "archive_export_erasure"
  | "append_only_redaction";

export interface RetentionBucketMetadata {
  label: string;
  durationPolicy: RetentionDurationPolicy;
  requiredCapability: RetentionCapability;
  examples: readonly string[];
}

export const RETENTION_BUCKET_METADATA = {
  short_lived_presence: {
    label: "Short-lived presence",
    durationPolicy: "provider_ttl_or_cleanup_job",
    requiredCapability: "automatic_expiry",
    examples: ["Anonymous silent-prayer presence", "Transient rate-limit state"]
  },
  short_lived_technical: {
    label: "Short-lived technical",
    durationPolicy: "deployment_configured_after_legal_review",
    requiredCapability: "purge_or_anonymize",
    examples: ["Authenticated silent-prayer participation identifiers"]
  },
  operational: {
    label: "Operational",
    durationPolicy: "deployment_configured_after_legal_review",
    requiredCapability: "revoke_or_delete_obsolete",
    examples: ["Device tokens", "Notification preferences", "Session records"]
  },
  community_record: {
    label: "Community record",
    durationPolicy: "deployment_configured_after_legal_review",
    requiredCapability: "archive_instead_of_delete",
    examples: ["Memberships", "Officer assignments", "Published content"]
  },
  sensitive_review: {
    label: "Sensitive review",
    durationPolicy: "deployment_configured_after_legal_review",
    requiredCapability: "archive_export_erasure",
    examples: ["Candidate requests", "Roadmap submissions", "Officer notes"]
  },
  audit: {
    label: "Audit",
    durationPolicy: "append_only_redacted",
    requiredCapability: "append_only_redaction",
    examples: ["Critical admin action logs"]
  }
} as const satisfies Record<RetentionBucket, RetentionBucketMetadata>;

export const PRIVACY_WORKFLOW_RETENTION_BUCKETS = {
  candidateRequest: "sensitive_review",
  candidateProfile: "sensitive_review",
  roadmapSubmission: "sensitive_review",
  deviceToken: "operational"
} as const satisfies Record<string, RetentionBucket>;

export type AdminPrivacyWorkflowTarget =
  | "candidateRequest"
  | "candidateProfile"
  | "roadmapSubmission";

export type AdminPrivacyWorkflowOperation = "export" | "erase";

export interface AdminPrivacyWorkflowOperationMetadata {
  method: "GET" | "POST";
  pathSuffix: AdminPrivacyWorkflowOperation;
  auditAction: string;
  destructive: boolean;
  requiredRole: "SUPER_ADMIN";
}

export interface AdminPrivacyWorkflowMetadata {
  label: string;
  entityType: string;
  retentionBucket: RetentionBucket;
  basePath: string;
  operations: Record<AdminPrivacyWorkflowOperation, AdminPrivacyWorkflowOperationMetadata>;
}

export const ADMIN_PRIVACY_WORKFLOWS = {
  candidateRequest: {
    label: "Candidate request",
    entityType: "candidate_request",
    retentionBucket: PRIVACY_WORKFLOW_RETENTION_BUCKETS.candidateRequest,
    basePath: "admin/candidate-requests",
    operations: {
      export: {
        method: "GET",
        pathSuffix: "export",
        auditAction: "admin.candidateRequest.export",
        destructive: false,
        requiredRole: "SUPER_ADMIN"
      },
      erase: {
        method: "POST",
        pathSuffix: "erase",
        auditAction: "admin.candidateRequest.erase",
        destructive: true,
        requiredRole: "SUPER_ADMIN"
      }
    }
  },
  candidateProfile: {
    label: "Candidate profile",
    entityType: "candidate_profile",
    retentionBucket: PRIVACY_WORKFLOW_RETENTION_BUCKETS.candidateProfile,
    basePath: "admin/candidates",
    operations: {
      export: {
        method: "GET",
        pathSuffix: "export",
        auditAction: "admin.candidateProfile.export",
        destructive: false,
        requiredRole: "SUPER_ADMIN"
      },
      erase: {
        method: "POST",
        pathSuffix: "erase",
        auditAction: "admin.candidateProfile.erase",
        destructive: true,
        requiredRole: "SUPER_ADMIN"
      }
    }
  },
  roadmapSubmission: {
    label: "Roadmap submission",
    entityType: "roadmap_submission",
    retentionBucket: PRIVACY_WORKFLOW_RETENTION_BUCKETS.roadmapSubmission,
    basePath: "admin/roadmap-submissions",
    operations: {
      export: {
        method: "GET",
        pathSuffix: "export",
        auditAction: "admin.roadmapSubmission.export",
        destructive: false,
        requiredRole: "SUPER_ADMIN"
      },
      erase: {
        method: "POST",
        pathSuffix: "erase",
        auditAction: "admin.roadmapSubmission.erase",
        destructive: true,
        requiredRole: "SUPER_ADMIN"
      }
    }
  }
} as const satisfies Record<AdminPrivacyWorkflowTarget, AdminPrivacyWorkflowMetadata>;

export function adminPrivacyWorkflowOperationPath(
  target: AdminPrivacyWorkflowTarget,
  id: string,
  operation: AdminPrivacyWorkflowOperation
): string {
  const workflow = ADMIN_PRIVACY_WORKFLOWS[target];

  return `${workflow.basePath}/${encodeURIComponent(id)}/${workflow.operations[operation].pathSuffix}`;
}
