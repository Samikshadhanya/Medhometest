import { getProfileBundle, setActiveHousehold } from '@/lib/server/medhome-service';
import { handleApiError, jsonOk, readJson, requireAuth } from '@/lib/server/api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const token = await requireAuth(request);
    const bundle = await getProfileBundle(token.uid, {
      email: token.email,
      name: token.name,
      photoURL: token.picture,
      provider: token.firebase?.sign_in_provider,
    });

    return jsonOk(bundle);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const token = await requireAuth(request);
    const body = await readJson(request);
    await setActiveHousehold(token.uid, body);

    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
