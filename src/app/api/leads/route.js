export { POST } from './create/route';

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { message: 'Seramikbak Leads API. Use POST to submit quote requests.' },
    { status: 200 }
  );
}
