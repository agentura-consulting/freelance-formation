
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Award, 
  Heart, 
  ChevronRight,
  Target,
  Briefcase,
  UserPlus,
  Coffee,
  Rocket,
  Bell,

  Monitor,
  Camera,
  Megaphone,
  Globe,
  Headphones,
  MessageCircle
} from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession() || {};
  const router = useRouter();

  useEffect(() => {
    if (session) {
      const userRole = (session.user as any)?.role;
      if (userRole === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (userRole === "FORMATEUR_ADMIN") {
        router.push("/dashboard/formateur");
      } else {
        router.push("/dashboard/apprenant");
      }
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Formations <span className="text-blue-600">gratuites</span> pour tous
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Développez vos compétences avec des formations de qualité, accessibles gratuitement. 
              Notre mission : démocratiser l&apos;accès à l&apos;éducation professionnelle.
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                <BookOpen className="h-5 w-5 mr-2" />
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/formations">
              <Button variant="outline" size="lg" className="px-8">
                Découvrir les formations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Parcours Gratuits Section */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explorez nos parcours gratuits
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Nous proposons des formations dans plusieurs domaines pour répondre aux besoins du marché 
            et aider chacun à développer de nouvelles compétences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Monitor className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <span className="font-medium text-gray-800">Assistannat virtuel</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Camera className="h-6 w-6 text-purple-600 flex-shrink-0" />
            <span className="font-medium text-gray-800">Audiovisuel & montage vidéo</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Megaphone className="h-6 w-6 text-orange-600 flex-shrink-0" />
            <span className="font-medium text-gray-800">Marketing digital</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Globe className="h-6 w-6 text-green-600 flex-shrink-0" />
            <span className="font-medium text-gray-800">Freelancing & travail en ligne</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <Headphones className="h-6 w-6 text-teal-600 flex-shrink-0" />
            <span className="font-medium text-gray-800">Service client (SAV)</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <MessageCircle className="h-6 w-6 text-pink-600 flex-shrink-0" />
            <span className="font-medium text-gray-800">Community management</span>
          </div>
        </div>

        <div className="text-center mt-8">
          <Badge variant="secondary" className="px-4 py-2 text-lg">
            Et bien d&apos;autres à venir...
          </Badge>
        </div>
      </section>

      {/* Pour qui Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pour qui est cette plateforme ?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Pour les étudiants</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Acquérir des compétences pratiques et utiles pour votre avenir professionnel.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Pour les demandeurs d&apos;emploi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Se former rapidement et retrouver un revenu grâce à de nouvelles compétences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Pour les freelances</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Compléter leur savoir-faire et améliorer leur offre de services.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Coffee className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle>Pour les passionnés</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Apprendre par curiosité et enrichir leurs connaissances personnelles.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Notre Mission Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="space-y-8">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">Notre mission sociale</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Nous voulons donner une seconde chance à celles et ceux qui ont perdu leur emploi, 
              en rendant l&apos;éducation professionnelle accessible gratuitement à tous les Malgaches, 
              peu importe où ils se trouvent.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Rocket className="h-8 w-8" />
              <h2 className="text-4xl font-bold">Coming Soon 🚀</h2>
            </div>
            <p className="text-xl opacity-90">Un espace emploi et freelances arrive bientôt !</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <UserPlus className="h-8 w-8 mx-auto mb-4 opacity-90" />
              <p className="font-medium">Les freelances pourront publier leur profil et CV</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-4 opacity-90" />
              <p className="font-medium">Les recruteurs auront accès à une base de talents locaux</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Briefcase className="h-8 w-8 mx-auto mb-4 opacity-90" />
              <p className="font-medium">Offres d&apos;emplois & missions à distance ou sur place</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <Target className="h-8 w-8 mx-auto mb-4 opacity-90" />
              <p className="font-medium">Connexion directe entre compétences et opportunités</p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="px-8"
              onClick={() => {
                window.alert("Merci pour votre intérêt ! Nous vous notifierons dès que l'espace emploi sera disponible. 🚀");
              }}
            >
              <Bell className="h-5 w-5 mr-2" />
              Être notifié au lancement
            </Button>
          </div>
        </div>
      </section>

      {/* Devenez Formateur Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Users className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Devenez formateur
            </h2>
            <p className="text-xl text-gray-600">
              Partagez vos compétences et aidez des centaines d&apos;étudiants à se lancer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Créez vos parcours de formation</h3>
              <p className="text-gray-600 text-sm">Organisez votre expertise en modules d&apos;apprentissage structurés</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Gagnez en visibilité et reconnaissance</h3>
              <p className="text-gray-600 text-sm">Devenez une référence dans votre domaine d&apos;expertise</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Faites grandir la communauté</h3>
              <p className="text-gray-600 text-sm">Contribuez à l&apos;éducation gratuite et accessible pour tous</p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                <ChevronRight className="h-5 w-5 mr-2" />
                Proposer une formation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">
              Prêt à développer vos compétences ?
            </h2>
            <p className="text-xl text-gray-300">
              Créez votre compte gratuitement et accédez immédiatement à toutes nos formations.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="px-8">
                  <Award className="h-5 w-5 mr-2" />
                  Créer mon compte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center text-gray-600">
            <p>© 2024 Digital Mada Academy. Une plateforme dédiée à l&apos;apprentissage pour tous.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
