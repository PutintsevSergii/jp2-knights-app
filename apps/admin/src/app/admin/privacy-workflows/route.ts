import { renderAdminNextRoute } from "../../../admin-next-route.js";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return renderAdminNextRoute(request, "/admin/privacy-workflows");
}
