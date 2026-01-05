
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST - Soumettre une réponse à un exercice
export async function POST(
  request: NextRequest,
  { params }: { params: { exerciseId: string } }
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
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Contenu requis' },
        { status: 400 }
      );
    }

    // Vérifier si une soumission existe déjà
    const existingSubmission = await prisma.exerciseSubmission.findUnique({
      where: {
        exerciseId_userId: {
          exerciseId: params.exerciseId,
          userId: (session.user as any).id,
        }
      }
    });

    let submission;

    if (existingSubmission) {
      // Mettre à jour la soumission existante
      submission = await prisma.exerciseSubmission.update({
        where: {
          exerciseId_userId: {
            exerciseId: params.exerciseId,
            userId: (session.user as any).id,
          }
        },
        data: {
          content: content.trim(),
          isApproved: false, // Réinitialiser l'approbation
          feedback: null,
        }
      });
    } else {
      // Créer une nouvelle soumission
      submission = await prisma.exerciseSubmission.create({
        data: {
          content: content.trim(),
          exerciseId: params.exerciseId,
          userId: (session.user as any).id,
        }
      });
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la soumission:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la soumission' },
      { status: 500 }
    );
  }
}
