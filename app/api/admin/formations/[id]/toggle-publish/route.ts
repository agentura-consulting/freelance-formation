

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id } = params;
    const { isPublished } = await request.json();

    // Mettre à jour le statut de publication
    const formation = await prisma.formation.update({
      where: { id },
      data: { isPublished },
      select: {
        id: true,
        title: true,
        isPublished: true
      }
    });

    return NextResponse.json(formation);

  } catch (error) {
    console.error("Error toggling formation publish status:", error);
    return NextResponse.json(
      { message: "Erreur lors de la modification du statut" },
      { status: 500 }
    );
  }
}

