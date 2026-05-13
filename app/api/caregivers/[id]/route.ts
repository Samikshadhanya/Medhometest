import { deleteCaregiver } from '@/lib/server/medhome-service';
import { handleApiError, jsonOk, requireAuth } from '@/lib/server/api';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const token = await requireAuth(request);
    const { id } = await context.params;
    await deleteCaregiver(token.uid, id);

    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
