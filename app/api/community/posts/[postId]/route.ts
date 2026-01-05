
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// DELETE - Supprimer un post
export async function DELETE(
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

    const post = await prisma.post.findUnique({
      where: { id: params.postId }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est l'auteur ou un admin
    if (post.authorId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    await prisma.post.delete({
      where: { id: params.postId }
    });

    return NextResponse.json({ message: 'Post supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du post' },
      { status: 500 }
    );
  }
}

// PATCH - Épingler/désépingler un post (admin uniquement)
export async function PATCH(
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

    if ((session.user as any).role !== 'ADMIN' && (session.user as any).role !== 'FORMATEUR_ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isPinned } = body;

    const post = await prisma.post.update({
      where: { id: params.postId },
      data: { isPinned },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            image: true,
            clientType: true,
            role: true,
          }
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
            shares: true,
          }
        }
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du post:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du post' },
      { status: 500 }
    );
  }
}
