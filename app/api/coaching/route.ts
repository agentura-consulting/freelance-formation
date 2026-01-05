
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Récupérer les notes de coaching
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');

    // Si c'est un formateur et qu'il demande les notes d'un client spécifique
    if ((session.user as any).role === 'FORMATEUR_ADMIN' || (session.user as any).role === 'ADMIN') {
      if (clientId) {
        const notes = await prisma.coachingNote.findMany({
          where: {
            coachId: (session.user as any).id,
            clientId,
          },
          include: {
            client: {
              select: {
                id: true,
                fullName: true,
                image: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });
        return NextResponse.json(notes);
      }

      // Sinon, retourner toutes les notes créées par le formateur
      const notes = await prisma.coachingNote.findMany({
        where: {
          coachId: (session.user as any).id,
        },
        include: {
          client: {
            select: {
              id: true,
              fullName: true,
              image: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      return NextResponse.json(notes);
    }

    // Si c'est un apprenant, retourner uniquement les notes visibles
    const notes = await prisma.coachingNote.findMany({
      where: {
        clientId: (session.user as any).id,
        isVisible: true,
      },
      include: {
        coach: {
          select: {
            id: true,
            fullName: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Erreur lors de la récupération des notes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notes' },
      { status: 500 }
    );
  }
}

// POST - Créer une note de coaching (formateurs uniquement)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { clientId, title, content, isVisible } = body;

    if (!clientId || !title || !content) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const note = await prisma.coachingNote.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        isVisible: isVisible ?? true,
        coachId: (session.user as any).id,
        clientId,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            image: true,
          }
        }
      }
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la note:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la note' },
      { status: 500 }
    );
  }
}
