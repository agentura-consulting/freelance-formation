
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST - Créer un exercice
export async function POST(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    if ((session.user as any).role !== 'FORMATEUR_ADMIN' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const module = await prisma.module.findUnique({
      where: { id: params.moduleId },
      include: { formation: true }
    });

    if (!module) {
      return NextResponse.json(
        { error: 'Module non trouvé' },
        { status: 404 }
      );
    }

    if (module.formation.creatorId !== (session.user as any).id && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, type, required, order } = body;

    if (!title || !description || !type) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        type,
        required: required ?? false,
        order: order ?? 0,
        moduleId: params.moduleId,
      },
      include: {
        _count: {
          select: {
            submissions: true,
          }
        }
      }
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'exercice:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'exercice' },
      { status: 500 }
    );
  }
}
