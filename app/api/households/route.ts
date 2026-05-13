import { createHousehold } from '@/lib/server/medhome-service';
import { handleApiError, jsonOk, readJson, requireAuth } from '@/lib/server/api';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const token = await requireAuth(request);
    const body = await readJson(request);
    const household = await createHousehold(token.uid, body);

    return jsonOk({ household }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
