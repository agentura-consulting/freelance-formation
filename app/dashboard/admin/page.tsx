

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/header";
import { AdminUsersList } from "@/components/admin/admin-users-list";
import { AdminFormationsList } from "@/components/admin/admin-formations-list";
import { AdminStats } from "@/components/admin/admin-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, BarChart, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const userRole = (session.user as any)?.role;
  if (userRole !== "ADMIN") {
    redirect("/dashboard/apprenant");
  }

  // Récupérer les statistiques
  const [
    totalUsers,
    totalFormations,
    totalEnrollments,
    recentUsers,
    recentFormations,
    allUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.formation.count(),
    prisma.enrollment.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true }
    }),
    prisma.formation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { fullName: true } } }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        email: true, 
        fullName: true, 
        role: true, 
        createdAt: true,
        _count: {
          select: {
            formations: true,
            enrollments: true
          }
        }
      }
    })
  ]);

  const formations = await prisma.formation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      creator: { select: { fullName: true, email: true } },
      _count: { select: { enrollments: true } }
    }
  });

  const stats = {
    totalUsers,
    totalFormations,
    totalEnrollments,
    publishedFormations: formations.filter(f => f.isPublished).length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de Bord Administrateur
          </h1>
          <p className="text-gray-600">
            Contrôle complet de la plateforme Digital Mada Academy
          </p>
        </div>

        {/* Statistiques rapides */}
        <AdminStats stats={stats} />

        {/* Onglets de gestion */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="formations">
              <BookOpen className="h-4 w-4 mr-2" />
              Formations
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart className="h-4 w-4 mr-2" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          {/* Gestion des utilisateurs */}
          <TabsContent value="users">
            <AdminUsersList users={allUsers.map(user => ({
              ...user,
              createdAt: user.createdAt.toISOString()
            }))} />
          </TabsContent>

          {/* Gestion des formations */}
          <TabsContent value="formations">
            <AdminFormationsList formations={formations.map(formation => ({
              ...formation,
              createdAt: formation.createdAt.toISOString()
            }))} />
          </TabsContent>

          {/* Statistiques détaillées */}
          <TabsContent value="stats">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques Détaillées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-600 mb-2">Utilisateurs récents</p>
                      <ul className="space-y-1">
                        {recentUsers.map((user) => (
                          <li key={user.id} className="flex justify-between">
                            <span>{user.fullName}</span>
                            <span className="text-gray-500">{user.role}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-600 mb-2">Formations récentes</p>
                      <ul className="space-y-1">
                        {recentFormations.map((formation) => (
                          <li key={formation.id} className="text-sm">
                            <p className="font-medium">{formation.title}</p>
                            <p className="text-gray-500">par {formation.creator.fullName}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

