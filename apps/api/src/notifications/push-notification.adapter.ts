export interface PushNotificationMessage {
  tokenIds: readonly string[];
  category: "events" | "announcements" | "roadmap_updates" | "prayer_reminders";
  title: string;
  body: string;
  deepLinkPath: string;
  recordId: string;
}

export interface PushNotificationDispatchResult {
  attempted: number;
  accepted: number;
  failed: number;
}

export abstract class PushNotificationAdapter {
  abstract dispatch(message: PushNotificationMessage): Promise<PushNotificationDispatchResult>;
}

export class NoopPushNotificationAdapter implements PushNotificationAdapter {
  dispatch(message: PushNotificationMessage): Promise<PushNotificationDispatchResult> {
    return Promise.resolve({
      attempted: message.tokenIds.length,
      accepted: 0,
      failed: 0
    });
  }
}
