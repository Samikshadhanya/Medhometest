import { addMedicine, getMedicinesByHousehold } from '@/lib/server/medhome-service';
import { ApiError, handleApiError, jsonOk, readJson, requireAuth } from '@/lib/server/api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const token = await requireAuth(request);
    const householdId = new URL(request.url).searchParams.get('householdId');

    if (!householdId) {
      throw new ApiError(400, 'householdId query parameter is required.');
    }

    const medicines = await getMedicinesByHousehold(token.uid, householdId);
    return jsonOk({ medicines });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const token = await requireAuth(request);
    const body = await readJson(request);
    const medicine = await addMedicine(token.uid, body);

    return jsonOk({ medicine }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
