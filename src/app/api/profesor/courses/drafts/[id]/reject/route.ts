import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Helper to get ID from URL
const getIdFromUrl = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 2]; // Get the ID before /reject
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // Only Super Admins can reject drafts
  if (!session || !session.user?.isSuperAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const draftId = getIdFromUrl(request.url);

    const draft = await prisma.courseDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      return NextResponse.json({ message: 'Course Draft not found' }, { status: 404 });
    }

    // Delete the draft
    await prisma.courseDraft.delete({
      where: { id: draftId },
    });

    return NextResponse.json({ message: 'Course draft rejected and deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('[ADMIN_COURSE_DRAFT_REJECT]', error);
    return NextResponse.json({ message: 'Failed to reject course draft' }, { status: 500 });
  }
}
