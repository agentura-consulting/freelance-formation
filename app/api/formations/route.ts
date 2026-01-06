export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "FORMATEUR_ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { title, description, category, level } = await req.json();

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    const formation = await prisma.formation.create({
      data: {
        title,
        description,
        category,
        level: level as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        creatorId: (session.user as any).id,
      },
    });

    return NextResponse.json(formation, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la formation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const published = searchParams.get("published");

    let whereClause = {};
    if (published === "true") {
      whereClause = { isPublished: true };
    }

    const formations = await prisma.formation.findMany({
      where: whereClause,
      include: {
        creator: { select: { fullName: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convertir BigInt en string pour éviter les erreurs de sérialisation JSON
    const formationsFormatted = formations.map(
      (formation: (typeof formations)[number]) => ({
        ...formation,
        _count: {
          ...formation._count,
          enrollments: Number(formation._count.enrollments),
        },
      })
    );

    return NextResponse.json(formationsFormatted);
  } catch (error) {
    console.error("Erreur lors de la récupération des formations:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
