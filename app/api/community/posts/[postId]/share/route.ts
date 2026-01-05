
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST - Partager un post
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { comment } = body;

    const share = await prisma.share.create({
      data: {
        comment: comment?.trim() || null,
        postId: params.postId,
        userId: (session.user as any).id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json(share, { status: 201 });
  } catch (error) {
    console.error('Erreur lors du partage du post:', error);
    return NextResponse.json(
      { error: 'Erreur lors du partage du post' },
      { status: 500 }
    );
  }
}
