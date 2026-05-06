import { renderAdminNextRoute } from "../../admin-next-route.js";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return renderAdminNextRoute(request, "/admin");
}
