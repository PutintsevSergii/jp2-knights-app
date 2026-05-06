import { renderAdminNextRoute } from "../../../../admin-next-route.js";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  const params = await context.params;

  return renderAdminNextRoute(
    request,
    `/admin/candidate-requests/${encodeURIComponent(params.id)}`
  );
}
