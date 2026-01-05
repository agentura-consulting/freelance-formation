
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FormationPublicClient } from "./formation-public-client";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function FormationPublicPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  // Récupérer la formation
  const formation = await prisma.formation.findFirst({
    where: { 
      id,
      isPublished: true 
    },
    include: {
      creator: { select: { fullName: true } },
      files: { orderBy: { order: 'asc' } },
      _count: { select: { enrollments: true } }
    }
  });

  if (!formation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Formation non trouvée
            </h1>
            <p className="text-gray-600 mb-6">
              Cette formation n&apos;existe pas ou n&apos;est pas encore publiée.
            </p>
            <Link href="/formations">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
                Voir toutes les formations
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur est déjà inscrit
  let isEnrolled = false;
  if (session && (session.user as any)?.role === "APPRENANT") {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_formationId: {
          userId: (session.user as any).id,
          formationId: id
        }
      }
    });
    isEnrolled = !!enrollment;
  }

  // Convertir BigInt en string pour éviter les erreurs de sérialisation JSON
  const formationFormatted = {
    ...formation,
    files: formation.files?.map(file => ({
      ...file,
      fileSize: file.fileSize.toString()
    })) || [],
    _count: {
      ...formation._count,
      enrollments: Number(formation._count.enrollments)
    }
  };

  return (
    <FormationPublicClient 
      formation={formationFormatted}
      session={session}
      isEnrolled={isEnrolled}
    />
  );
}
