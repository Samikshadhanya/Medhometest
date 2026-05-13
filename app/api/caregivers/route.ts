import { addCaregiver, getCaregiversByHousehold } from '@/lib/server/medhome-service';
import { ApiError, handleApiError, jsonOk, readJson, requireAuth } from '@/lib/server/api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const token = await requireAuth(request);
    const householdId = new URL(request.url).searchParams.get('householdId');

    if (!householdId) {
      throw new ApiError(400, 'householdId query parameter is required.');
    }

    const caregivers = await getCaregiversByHousehold(token.uid, householdId);
    return jsonOk({ caregivers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const token = await requireAuth(request);
    const body = await readJson(request);
    const caregiver = await addCaregiver(token.uid, body);

    return jsonOk({ caregiver }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
