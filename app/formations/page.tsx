
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/header";
import { FormationCard } from "@/components/formation-card";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FormationsPage() {
  const session = await getServerSession(authOptions);

  // Récupérer toutes les formations publiées
  const formations = await prisma.formation.findMany({
    where: { isPublished: true },
    include: {
      creator: { select: { fullName: true } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Récupérer les catégories uniques
  const categories = [...new Set(formations.map(f => f.category))];
  
  return (
    <div className="min-h-screen bg-gray-50">
      {session && <Header />}
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {!session && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Digital Mada Academy</span>
              </div>
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button variant="ghost">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>
                    Créer un compte
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Catalogue des formations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez toutes nos formations gratuites pour développer vos compétences professionnelles
          </p>
        </div>

        {/* Filtres */}
        <Card className="border-0 shadow-md mb-8">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher une formation..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="cursor-pointer">
                  Toutes
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant="outline"
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des formations */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {formations.length} formation{formations.length > 1 ? 's' : ''} disponible{formations.length > 1 ? 's' : ''}
            </h2>
            <Badge variant="outline" className="text-green-600">
              Gratuit pour tous
            </Badge>
          </div>
          
          {formations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formations.map((formation) => (
                <FormationCard
                  key={formation.id}
                  formation={formation}
                  isEnrolled={false}
                />
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-md">
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Aucune formation disponible
                </h3>
                <p className="text-gray-600 mb-4">
                  Les formations seront ajoutées prochainement par nos formateurs.
                </p>
                {!session && (
                  <Link href="/auth/signup">
                    <Button>
                      Créer un compte pour être notifié
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* CTA pour non connectés */}
        {!session && formations.length > 0 && (
          <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Prêt à commencer votre apprentissage ?
            </h3>
            <p className="text-blue-100 mb-6">
              Créez votre compte gratuit pour accéder à toutes ces formations
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary">
                  Créer un compte gratuit
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
