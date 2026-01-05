
"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { BookOpen, Users, Clock, Star } from "lucide-react";

interface FormationCardProps {
  formation: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string | null;
    category: string;
    level: string;
    createdAt: Date;
    creator: {
      fullName: string;
    };
    _count?: {
      enrollments: number;
    };
  };
  isEnrolled?: boolean;
  showEnrollButton?: boolean;
  href?: string;
}

export function FormationCard({ formation, isEnrolled, showEnrollButton = true, href }: FormationCardProps) {
  const levelColors = {
    DEBUTANT: "bg-green-100 text-green-800",
    INTERMEDIAIRE: "bg-yellow-100 text-yellow-800",
    AVANCE: "bg-red-100 text-red-800"
  };

  const linkHref = href || (isEnrolled ? `/formation/${formation.id}/learn` : `/formation/${formation.id}`);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
      <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
        {formation.thumbnail ? (
          <Image
            src={formation.thumbnail}
            alt={formation.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
            <BookOpen className="h-12 w-12 text-blue-500" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className={`text-xs font-medium ${levelColors[formation.level as keyof typeof levelColors] || levelColors.DEBUTANT}`}>
            {formation.level.toLowerCase()}
          </Badge>
        </div>
        {isEnrolled && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Inscrit
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {formation.category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formation.createdAt.toLocaleDateString('fr-FR')}
          </span>
        </div>
        <CardTitle className="line-clamp-2 text-lg">{formation.title}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {formation.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{formation._count?.enrollments || 0} apprenants</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Par {formation.creator.fullName}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={linkHref} className="w-full">
          <Button className="w-full" variant={isEnrolled ? "default" : "outline"}>
            {isEnrolled ? "Continuer" : "Découvrir"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
