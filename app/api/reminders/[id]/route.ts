import { deleteReminder, updateReminder } from '@/lib/server/medhome-service';
import { handleApiError, jsonOk, readJson, requireAuth } from '@/lib/server/api';

export const runtime = 'nodejs';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const token = await requireAuth(request);
    const { id } = await context.params;
    const body = await readJson(request);
    const result = await updateReminder(token.uid, id, body);

    return jsonOk(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const token = await requireAuth(request);
    const { id } = await context.params;
    await deleteReminder(token.uid, id);

    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
