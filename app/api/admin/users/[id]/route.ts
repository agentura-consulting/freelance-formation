

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

    // Vérifier que ce n'est pas le compte admin principal
    const user = await prisma.user.findUnique({
      where: { id },
      select: { email: true }
    });

    if (user?.email === "admin@admin.com") {
      return NextResponse.json(
        { message: "Impossible de supprimer le compte administrateur principal" },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Utilisateur supprimé avec succès" });

  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}

