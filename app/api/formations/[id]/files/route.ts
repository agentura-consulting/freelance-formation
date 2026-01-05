
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadFile } from "@/lib/s3";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== "FORMATEUR_ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const formData = await req.formData();
    
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const order = parseInt(formData.get("order") as string || "0");

    if (!file || !title) {
      return NextResponse.json(
        { error: "Fichier et titre sont requis" },
        { status: 400 }
      );
    }

    // Vérifier que la formation appartient au formateur
    const formation = await prisma.formation.findFirst({
      where: {
        id,
        creatorId: (session.user as any).id
      }
    });

    if (!formation) {
      return NextResponse.json(
        { error: "Formation non trouvée ou non autorisée" },
        { status: 404 }
      );
    }

    // Upload vers S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const cloud_storage_path = await uploadFile(buffer, file.name);

    // Déterminer le type de fichier
    const fileType = file.type.startsWith('video/') ? 'video' : 'document';

    // Sauvegarder en base
    const formationFile = await prisma.formationFile.create({
      data: {
        title,
        filename: file.name,
        fileType,
        fileSize: BigInt(file.size),
        cloud_storage_path,
        mimeType: file.type,
        order,
        formationId: id
      }
    });

    // Convertir BigInt en string
    const fileFormatted = {
      ...formationFile,
      fileSize: formationFile.fileSize.toString()
    };

    return NextResponse.json(fileFormatted, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'upload du fichier:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    
    const files = await prisma.formationFile.findMany({
      where: { formationId: id },
      orderBy: { order: 'asc' }
    });

    // Convertir BigInt en string
    const filesFormatted = files.map(file => ({
      ...file,
      fileSize: file.fileSize.toString()
    }));

    return NextResponse.json(filesFormatted);
  } catch (error) {
    console.error("Erreur lors de la récupération des fichiers:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
