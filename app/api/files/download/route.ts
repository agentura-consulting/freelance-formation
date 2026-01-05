
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { downloadFile } from "@/lib/s3";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    const { cloud_storage_path } = await req.json();

    if (!cloud_storage_path) {
      return NextResponse.json(
        { error: "Chemin du fichier requis" },
        { status: 400 }
      );
    }

    // Générer l'URL signée pour le téléchargement
    const signedUrl = await downloadFile(cloud_storage_path);

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("Erreur lors de la génération de l'URL de téléchargement:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération de l'URL de téléchargement" },
      { status: 500 }
    );
  }
}
