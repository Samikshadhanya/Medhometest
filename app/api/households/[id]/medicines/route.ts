import { getMedicinesByHousehold } from '@/lib/server/medhome-service';
import { handleApiError, jsonOk, requireAuth } from '@/lib/server/api';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const token = await requireAuth(request);
    const { id } = await context.params;
    const medicines = await getMedicinesByHousehold(token.uid, id);

    return jsonOk({ medicines });
  } catch (error) {
    return handleApiError(error);
  }
}
