export const currentUserResponseOpenApiSchema = {
  type: "object",
  required: ["user", "access"],
  additionalProperties: false,
  properties: {
    user: {
      type: "object",
      required: ["id", "email", "displayName", "preferredLanguage", "status", "roles"],
      additionalProperties: false,
      properties: {
        id: { type: "string" },
        email: { type: "string", format: "email" },
        displayName: { type: "string" },
        preferredLanguage: { type: "string", nullable: true },
        status: {
          type: "string",
          enum: ["active", "inactive", "invited", "archived"]
        },
        roles: {
          type: "array",
          items: {
            type: "string",
            enum: ["CANDIDATE", "BROTHER", "OFFICER", "SUPER_ADMIN"]
          }
        }
      }
    },
    access: {
      type: "object",
      required: [
        "mobileMode",
        "adminLite",
        "candidateOrganizationUnitId",
        "memberOrganizationUnitIds",
        "officerOrganizationUnitIds",
        "approval"
      ],
      additionalProperties: false,
      properties: {
        mobileMode: {
          type: "string",
          enum: ["public", "candidate", "brother"]
        },
        adminLite: { type: "boolean" },
        candidateOrganizationUnitId: {
          type: "string",
          format: "uuid",
          nullable: true
        },
        memberOrganizationUnitIds: {
          type: "array",
          items: { type: "string", format: "uuid" }
        },
        officerOrganizationUnitIds: {
          type: "array",
          items: { type: "string", format: "uuid" }
        },
        approval: {
          type: "object",
          nullable: true,
          required: ["state", "expiresAt", "scopeOrganizationUnitId"],
          additionalProperties: false,
          properties: {
            state: {
              type: "string",
              enum: ["pending", "rejected", "expired"]
            },
            expiresAt: {
              type: "string",
              format: "date-time",
              nullable: true
            },
            scopeOrganizationUnitId: {
              type: "string",
              format: "uuid",
              nullable: true
            }
          }
        }
      }
    }
  }
};

export const authSessionRequestOpenApiSchema = {
  type: "object",
  required: ["idToken"],
  additionalProperties: false,
  properties: {
    idToken: {
      type: "string",
      minLength: 1,
      maxLength: 8192
    },
    csrfToken: {
      type: "string",
      minLength: 16,
      maxLength: 512
    }
  }
};

export const authSessionResponseOpenApiSchema = {
  type: "object",
  required: ["currentUser", "session"],
  additionalProperties: false,
  properties: {
    currentUser: currentUserResponseOpenApiSchema,
    session: {
      type: "object",
      required: ["transport", "expiresAt"],
      additionalProperties: false,
      properties: {
        transport: {
          type: "string",
          enum: ["bearer", "cookie"]
        },
        expiresAt: {
          type: "string",
          format: "date-time",
          nullable: true
        }
      }
    }
  }
};

export const authMutationResponseOpenApiSchema = {
  type: "object",
  required: ["success"],
  additionalProperties: false,
  properties: {
    success: { type: "boolean", enum: [true] }
  }
};

export const registerDeviceTokenRequestOpenApiSchema = {
  type: "object",
  required: ["platform", "token"],
  additionalProperties: false,
  properties: {
    platform: {
      type: "string",
      enum: ["ios", "android", "web"]
    },
    token: {
      type: "string",
      minLength: 16,
      maxLength: 4096
    }
  }
};

export const deviceTokenRegistrationResponseOpenApiSchema = {
  type: "object",
  required: ["deviceToken"],
  additionalProperties: false,
  properties: {
    deviceToken: {
      type: "object",
      required: ["id", "platform", "lastSeenAt", "revokedAt"],
      additionalProperties: false,
      properties: {
        id: {
          type: "string",
          format: "uuid"
        },
        platform: {
          type: "string",
          enum: ["ios", "android", "web"]
        },
        lastSeenAt: {
          type: "string",
          format: "date-time"
        },
        revokedAt: {
          type: "string",
          format: "date-time",
          nullable: true
        }
      }
    }
  }
};

export const notificationPreferenceSettingsOpenApiSchema = {
  type: "object",
  required: ["events", "announcements", "roadmapUpdates", "prayerReminders"],
  additionalProperties: false,
  properties: {
    events: { type: "boolean" },
    announcements: { type: "boolean" },
    roadmapUpdates: { type: "boolean" },
    prayerReminders: { type: "boolean" }
  }
};

export const updateNotificationPreferencesRequestOpenApiSchema = {
  type: "object",
  minProperties: 1,
  additionalProperties: false,
  properties: {
    events: { type: "boolean" },
    announcements: { type: "boolean" },
    roadmapUpdates: { type: "boolean" },
    prayerReminders: { type: "boolean" }
  }
};

export const notificationPreferencesResponseOpenApiSchema = {
  type: "object",
  required: ["preferences"],
  additionalProperties: false,
  properties: {
    preferences: notificationPreferenceSettingsOpenApiSchema
  }
};
