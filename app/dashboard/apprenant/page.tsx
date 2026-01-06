import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/header";
import { FormationCard } from "@/components/formation-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, Clock, Users, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ApprenantDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== "APPRENANT") {
    redirect("/dashboard/formateur");
  }

  const userId = (session.user as any)?.id;

  // Récupérer les formations auxquelles l'utilisateur est inscrit
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      formation: {
        include: {
          creator: { select: { fullName: true } },
          _count: { select: { enrollments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Récupérer toutes les formations publiées
  const availableFormations = await prisma.formation.findMany({
    where: {
      isPublished: true,
      NOT: {
        enrollments: {
          some: { userId },
        },
      },
    },
    include: {
      creator: { select: { fullName: true } },
      _count: { select: { enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  // Récupérer les notes de coaching visibles
  const coachingNotes = await prisma.coachingNote.findMany({
    where: {
      clientId: userId,
      isVisible: true,
    },
    include: {
      coach: {
        select: {
          fullName: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  const stats = {
    totalEnrollments: enrollments?.length || 0,
    completedCourses:
      enrollments?.filter(
        (e: (typeof enrollments)[number]) => e.progress === 100
      )?.length || 0,
    inProgress:
      enrollments?.filter(
        (e: (typeof enrollments)[number]) => e.progress > 0 && e.progress < 100
      )?.length || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour {session.user?.name} 👋
          </h1>
          <p className="text-gray-600">
            Continuez votre parcours d&apos;apprentissage avec nos formations
            gratuites
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Formations suivies
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalEnrollments}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Formations terminées
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completedCourses}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.inProgress}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes de coaching */}
        {coachingNotes.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Mes notes de coaching
                </h2>
              </div>
              <Badge variant="secondary">
                {coachingNotes.length} note{coachingNotes.length > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coachingNotes.map((note: (typeof coachingNotes)[number]) => (
                <Card
                  key={note.id}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {new Date(note.createdAt).toLocaleDateString("fr-FR")}
                      </Badge>
                    </div>
                    <CardDescription>
                      Par {note.coach?.fullName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-4">
                      {note.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Mes formations */}
        {enrollments.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Mes formations
              </h2>
              <Badge variant="secondary">
                {enrollments.length} formation
                {enrollments.length > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment: (typeof enrollments)[number]) => (
                <FormationCard
                  key={enrollment.id}
                  formation={enrollment.formation}
                  isEnrolled={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Formations disponibles */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Formations disponibles
            </h2>
            <Badge variant="outline">Gratuit</Badge>
          </div>

          {availableFormations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableFormations.map(
                (formation: (typeof availableFormations)[number]) => (
                  <FormationCard
                    key={formation.id}
                    formation={formation}
                    isEnrolled={false}
                  />
                )
              )}
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune nouvelle formation disponible
                </h3>
                <p className="text-gray-600">
                  Les formations seront ajoutées prochainement par nos
                  formateurs.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
