
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Récupérer tous les posts avec leurs relations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const posts = await prisma.post.findMany({
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
        comments: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                image: true,
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              }
            }
          }
        },
        shares: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              }
            }
          }
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
            shares: true,
          }
        }
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des posts' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau post
export async function POST(request: NextRequest) {
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
        { error: 'Le contenu est requis' },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        authorId: (session.user as any).id,
      },
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

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du post:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du post' },
      { status: 500 }
    );
  }
}
