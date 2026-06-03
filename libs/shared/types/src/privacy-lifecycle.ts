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
