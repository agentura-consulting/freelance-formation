
"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { GraduationCap, LogOut, BookOpen, Users, MessageCircle, ClipboardList } from "lucide-react";

export function Header() {
  const { data: session, status } = useSession() || {};

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  // Pendant le chargement
  if (status === "loading") {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Digital Mada Academy</span>
          </div>
          <div className="w-32 h-8 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </header>
    );
  }

  // Si pas de session
  if (!session) {
    return null;
  }

  const userRole = session?.user && (session.user as any).role;
  const isFormateur = userRole === "FORMATEUR_ADMIN";
  const isAdmin = userRole === "ADMIN";

  const getDashboardLink = () => {
    if (isAdmin) return "/dashboard/admin";
    if (isFormateur) return "/dashboard/formateur";
    return "/dashboard/apprenant";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between max-w-6xl mx-auto px-4">
        <div className="flex items-center space-x-4">
          <Link href={getDashboardLink()} className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Digital Mada Academy</span>
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          {isAdmin ? (
            <>
              <Link href="/dashboard/admin">
                <Button variant="ghost" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Administration
                </Button>
              </Link>
            </>
          ) : isFormateur ? (
            <>
              <Link href="/dashboard/formateur">
                <Button variant="ghost" size="sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Formations
                </Button>
              </Link>
              <Link href="/dashboard/formateur/coaching">
                <Button variant="ghost" size="sm">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Coaching
                </Button>
              </Link>
              <Link href="/dashboard/formateur/create">
                <Button variant="outline" size="sm">
                  Créer Formation
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/dashboard/apprenant">
              <Button variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Mes Formations
              </Button>
            </Link>
          )}
          
          <Link href="/formations">
            <Button variant="ghost" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Catalogue
            </Button>
          </Link>
          
          <Link href="/community">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Communauté
            </Button>
          </Link>
          
          <Link href="/messages">
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              Messages
            </Button>
          </Link>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {session?.user?.name}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
