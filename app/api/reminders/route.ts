import { createReminder, getReminders } from '@/lib/server/medhome-service';
import { handleApiError, jsonOk, readJson, requireAuth } from '@/lib/server/api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const token = await requireAuth(request);
    const params = new URL(request.url).searchParams;
    const reminders = await getReminders(token.uid, {
      userId: params.get('userId') || undefined,
      householdId: params.get('householdId') || undefined,
    });

    return jsonOk({ reminders });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const token = await requireAuth(request);
    const body = await readJson(request);
    const reminder = await createReminder(token.uid, body);

    return jsonOk({ reminder }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
