import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error: 'This admin endpoint has been moved to the external dashboard',
      redirect: 'https://vendor.sufisciencecenter.info',
      message: 'Please access admin features through /portal'
    },
    { status: 410 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'This admin endpoint has been moved to the external dashboard',
      redirect: 'https://vendor.sufisciencecenter.info',
      message: 'Please access admin features through /portal'
    },
    { status: 410 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      error: 'This admin endpoint has been moved to the external dashboard',
      redirect: 'https://vendor.sufisciencecenter.info',
      message: 'Please access admin features through /portal'
    },
    { status: 410 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error: 'This admin endpoint has been moved to the external dashboard',
      redirect: 'https://vendor.sufisciencecenter.info',
      message: 'Please access admin features through /portal'
    },
    { status: 410 }
  );
}
