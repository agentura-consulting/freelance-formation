
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PATCH - Mettre à jour un module
export async function PATCH(
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
    const { title, description, order } = body;

    const updatedModule = await prisma.module.update({
      where: { id: params.moduleId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(order !== undefined && { order }),
      },
      include: {
        exercises: true,
      }
    });

    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du module:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du module' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un module
export async function DELETE(
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

    await prisma.module.delete({
      where: { id: params.moduleId }
    });

    return NextResponse.json({ message: 'Module supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du module:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du module' },
      { status: 500 }
    );
  }
}
