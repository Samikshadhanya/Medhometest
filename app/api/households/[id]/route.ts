import { getHousehold } from '@/lib/server/medhome-service';
import { handleApiError, jsonOk, requireAuth } from '@/lib/server/api';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const token = await requireAuth(request);
    const { id } = await context.params;
    const household = await getHousehold(token.uid, id);

    return jsonOk({ household });
  } catch (error) {
    return handleApiError(error);
  }
}
