import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const email = searchParams.get('email');

  if (secret !== process.env.SUPER_ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { isSuperAdmin: true },
    });
    return NextResponse.json({ message: `User ${user.email} is now a super admin.` });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to make user a super admin.' }, { status: 500 });
  }
}
