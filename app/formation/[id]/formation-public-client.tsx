
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Clock, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Session } from "next-auth";

interface FormationPublicClientProps {
  formation: any;
  session: Session | null;
  isEnrolled: boolean;
}

export function FormationPublicClient({ 
  formation, 
  session, 
  isEnrolled: initialIsEnrolled 
}: FormationPublicClientProps) {
  const router = useRouter();
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);

  const handleEnroll = async () => {
    if (!session) {
      toast.error("Vous devez être connecté pour vous inscrire");
      router.push("/auth/signin");
      return;
    }

    if ((session.user as any)?.role !== "APPRENANT") {
      toast.error("Seuls les apprenants peuvent s'inscrire aux formations");
      return;
    }

    setEnrolling(true);

    try {
      const response = await fetch(`/api/formations/${formation.id}/enroll`, {
        method: "POST"
      });

      if (response.ok) {
        toast.success("Inscription réussie !");
        setIsEnrolled(true);
        router.push(`/formation/${formation.id}/learn`);
      } else {
        const data = await response.json();
        toast.error(data.error || "Erreur lors de l'inscription");
      }
    } catch (error) {
      toast.error("Erreur lors de l'inscription");
    } finally {
      setEnrolling(false);
    }
  };

  const levelColors = {
    DEBUTANT: "bg-green-100 text-green-800",
    INTERMEDIAIRE: "bg-yellow-100 text-yellow-800",
    AVANCE: "bg-red-100 text-red-800"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {session && <Header />}
      
      {/* Header pour utilisateurs non connectés */}
      {!session && (
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
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
        </header>
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* En-tête de la formation */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <Badge variant="outline">{formation.category}</Badge>
                <Badge className={levelColors[formation.level as keyof typeof levelColors] || levelColors.DEBUTANT}>
                  {formation.level.toLowerCase()}
                </Badge>
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  Gratuit
                </Badge>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {formation.title}
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                {formation.description}
              </p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{formation._count?.enrollments || 0} apprenants</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Par {formation.creator?.fullName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{formation.files?.length || 0} ressources</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            {!session ? (
              <>
                <Link href="/auth/signup">
                  <Button size="lg" className="px-8">
                    Créer un compte gratuit
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg" className="px-8">
                    Se connecter
                  </Button>
                </Link>
              </>
            ) : isEnrolled ? (
              <Link href={`/formation/${formation.id}/learn`}>
                <Button size="lg" className="px-8">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Continuer la formation
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                className="px-8"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? "Inscription..." : "S'inscrire gratuitement"}
              </Button>
            )}
          </div>
        </div>

        {/* Contenu de la formation */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Contenu de la formation</CardTitle>
                <CardDescription>
                  {formation.files?.length || 0} ressources disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formation.files?.length > 0 ? (
                  <div className="space-y-3">
                    {formation.files?.map((file: any, index: number) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{file.title}</p>
                            <p className="text-sm text-gray-500 capitalize">{file.fileType}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {file.fileType === 'video' ? 'Vidéo' : 'Document'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Le contenu sera bientôt disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>À propos du formateur</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {formation.creator?.fullName?.charAt(0) || "F"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{formation.creator?.fullName}</p>
                      <p className="text-sm text-gray-500">Formateur expert</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Formateur passionné, prêt à partager ses connaissances avec la communauté 
                      d&apos;apprenants de Digital Mada Academy.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
