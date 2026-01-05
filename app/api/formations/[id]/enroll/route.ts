
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== "APPRENANT") {
      return NextResponse.json(
        { error: "Accès non autorisé - seuls les apprenants peuvent s'inscrire" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const userId = (session.user as any).id;

    // Vérifier que la formation existe et est publiée
    const formation = await prisma.formation.findFirst({
      where: {
        id,
        isPublished: true
      }
    });

    if (!formation) {
      return NextResponse.json(
        { error: "Formation non trouvée ou non disponible" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur n'est pas déjà inscrit
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_formationId: {
          userId,
          formationId: id
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Vous êtes déjà inscrit à cette formation" },
        { status: 400 }
      );
    }

    // Créer l'inscription
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        formationId: id
      }
    });

    return NextResponse.json({ 
      message: "Inscription réussie",
      enrollmentId: enrollment.id 
    }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'inscription à la formation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
