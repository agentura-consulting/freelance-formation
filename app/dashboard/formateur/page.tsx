
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/header";
import { FormateurDashboardClient } from "@/components/formateur-dashboard-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, Users, TrendingUp, Plus, Eye } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FormateurDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== "FORMATEUR_ADMIN") {
    redirect("/dashboard/apprenant");
  }

  const userId = (session.user as any)?.id;

  // Récupérer les formations créées par le formateur
  const formations = await prisma.formation.findMany({
    where: { creatorId: userId },
    include: {
      creator: { select: { fullName: true } },
      _count: { 
        select: { 
          enrollments: true,
          files: true
        } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Statistiques
  const stats = {
    totalFormations: formations?.length || 0,
    publishedFormations: formations?.filter(f => f.isPublished)?.length || 0,
    totalEnrollments: formations?.reduce((acc, f) => acc + (f._count?.enrollments || 0), 0) || 0,
    totalFiles: formations?.reduce((acc, f) => acc + (f._count?.files || 0), 0) || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Espace Formateur
            </h1>
            <p className="text-gray-600">
              Gérez vos formations et partagez votre expertise
            </p>
          </div>
          <Link href="/dashboard/formateur/create">
            <Button size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Formation
            </Button>
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total formations
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalFormations}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Publiées
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.publishedFormations}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total apprenants
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.totalEnrollments}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Fichiers uploadés
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.totalFiles}</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des formations */}
        <FormateurDashboardClient formations={formations} />
      </div>
    </div>
  );
}
