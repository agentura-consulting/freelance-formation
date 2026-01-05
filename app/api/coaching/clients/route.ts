
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Récupérer la liste des apprenants (pour les formateurs)
export async function GET(request: NextRequest) {
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

    const apprenants = await prisma.user.findMany({
      where: {
        role: 'APPRENANT'
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        image: true,
        clientType: true,
        bio: true,
        _count: {
          select: {
            coachingReceived: true,
            enrollments: true,
          }
        }
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    return NextResponse.json(apprenants);
  } catch (error) {
    console.error('Erreur lors de la récupération des apprenants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des apprenants' },
      { status: 500 }
    );
  }
}
