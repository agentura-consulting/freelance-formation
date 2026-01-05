
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST - Ajouter/modifier une réaction
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
    const { type } = body;

    if (!type || !['LIKE', 'LOVE', 'SUPPORT', 'CELEBRATE'].includes(type)) {
      return NextResponse.json(
        { error: 'Type de réaction invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà réagi
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        postId_userId: {
          postId: params.postId,
          userId: (session.user as any).id,
        }
      }
    });

    let reaction;

    if (existingReaction) {
      // Mettre à jour la réaction existante
      reaction = await prisma.reaction.update({
        where: {
          postId_userId: {
            postId: params.postId,
            userId: (session.user as any).id,
          }
        },
        data: { type }
      });
    } else {
      // Créer une nouvelle réaction
      reaction = await prisma.reaction.create({
        data: {
          type,
          postId: params.postId,
          userId: (session.user as any).id,
        }
      });
    }

    return NextResponse.json(reaction, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la réaction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la réaction' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une réaction
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

    await prisma.reaction.delete({
      where: {
        postId_userId: {
          postId: params.postId,
          userId: (session.user as any).id,
        }
      }
    });

    return NextResponse.json({ message: 'Réaction supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réaction:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la réaction' },
      { status: 500 }
    );
  }
}
