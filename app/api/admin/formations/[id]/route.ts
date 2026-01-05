

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    const { id } = params;

    // Supprimer la formation (les relations seront supprimées en cascade)
    await prisma.formation.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Formation supprimée avec succès" });

  } catch (error) {
    console.error("Error deleting formation:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de la formation" },
      { status: 500 }
    );
  }
}

