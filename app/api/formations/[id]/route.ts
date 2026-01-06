import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: {
    id: string;
  };
}

interface FormationFileFormatted {
  id: string;
  name: string;
  url: string;
  fileSize: string;
  order: number;
  formationId: string;
}

type PrismaFormationFile = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  formationId: string;
  filename: string;
  fileType: string;
  fileSize: bigint;
  cloud_storage_path: string;
  mimeType: string;
  order: number;
};

// Fonction utilitaire pour formater les fichiers
function formatFiles(files: PrismaFormationFile[]): FormationFileFormatted[] {
  return files.map((file) => ({
    id: file.id,
    name: file.filename,
    url: file.cloud_storage_path,
    fileSize: file.fileSize.toString(),
    order: file.order,
    formationId: file.formationId,
  }));
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const formation = await prisma.formation.findUnique({
      where: { id },
      include: {
        creator: { select: { fullName: true } },
        files: { orderBy: { order: "asc" } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!formation) {
      return NextResponse.json(
        { error: "Formation non trouvée" },
        { status: 404 }
      );
    }

    const formationFormatted = {
      ...formation,
      files: formatFiles(formation.files),
      _count: {
        ...formation._count,
        enrollments: Number(formation._count.enrollments),
      },
    };

    return NextResponse.json(formationFormatted);
  } catch (error) {
    console.error("Erreur lors de la récupération de la formation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();
    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;

    if (userRole !== "ADMIN" && userRole !== "FORMATEUR_ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    if (userRole === "FORMATEUR_ADMIN") {
      const formation = await prisma.formation.findUnique({
        where: { id },
        select: { creatorId: true },
      });

      if (!formation || formation.creatorId !== userId) {
        return NextResponse.json(
          { error: "Vous ne pouvez modifier que vos propres formations" },
          { status: 403 }
        );
      }
    }

    const updatedFormation = await prisma.formation.update({
      where: { id },
      data: {
        ...data,
        ...(data.level && {
          level: data.level as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        }),
      },
      include: {
        creator: { select: { fullName: true } },
        files: { orderBy: { order: "asc" } },
        _count: { select: { enrollments: true } },
      },
    });

    const formationFormatted = {
      ...updatedFormation,
      files: formatFiles(updatedFormation.files),
      _count: {
        ...updatedFormation._count,
        enrollments: Number(updatedFormation._count.enrollments),
      },
    };

    return NextResponse.json(formationFormatted);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la formation:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;
    const { id } = params;

    if (userRole === "ADMIN") {
      await prisma.formation.delete({ where: { id } });
    } else if (userRole === "FORMATEUR_ADMIN") {
      const formation = await prisma.formation.findUnique({
        where: { id },
        select: { creatorId: true },
      });

      if (!formation || formation.creatorId !== userId) {
        return NextResponse.json(
          { message: "Vous ne pouvez supprimer que vos propres formations" },
          { status: 403 }
        );
      }

      await prisma.formation.delete({ where: { id } });
    } else {
      return NextResponse.json(
        { message: "Accès non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({ message: "Formation supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la formation:", error);
    return NextResponse.json(
      { message: "Erreur lors de la suppression de la formation" },
      { status: 500 }
    );
  }
}
