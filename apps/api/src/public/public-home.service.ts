import { Injectable } from "@nestjs/common";
import { LiturgicalCalendarProvider } from "./liturgical-calendar.provider.js";
import type { PublicHomeQuery, PublicHomeResponse } from "./public.types.js";

@Injectable()
export class PublicHomeService {
  constructor(private readonly liturgicalCalendarProvider: LiturgicalCalendarProvider) {}

  async getHome(query: PublicHomeQuery): Promise<PublicHomeResponse> {
    const today = await this.liturgicalCalendarProvider.getToday(query);

    return {
      intro: {
        title: "JP2 App",
        body: "Public discovery content is being prepared for approval."
      },
      today,
      prayerOfDay: null,
      nextEvents: [],
      ctas: [
        {
          id: "learn",
          label: "Learn",
          action: "learn",
          targetRoute: "AboutOrder"
        },
        {
          id: "pray",
          label: "Pray",
          action: "pray",
          targetRoute: "PublicPrayerCategories"
        },
        {
          id: "join",
          label: "Join",
          action: "join",
          targetRoute: "JoinRequestForm"
        },
        {
          id: "login",
          label: "Login",
          action: "login",
          targetRoute: "Login"
        }
      ]
    };
  }
}
