
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Récupérer la liste des formateurs (pour les apprenants)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const formateurs = await prisma.user.findMany({
      where: {
        role: 'FORMATEUR_ADMIN'
      },
      select: {
        id: true,
        fullName: true,
        image: true,
        role: true,
        bio: true,
      },
      orderBy: {
        fullName: 'asc'
      }
    });

    return NextResponse.json(formateurs);
  } catch (error) {
    console.error('Erreur lors de la récupération des formateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des formateurs' },
      { status: 500 }
    );
  }
}
