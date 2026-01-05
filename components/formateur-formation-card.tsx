

"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { BookOpen, Users, Clock, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface FormateurFormationCardProps {
  formation: {
    id: string;
    title: string;
    description: string;
    thumbnail?: string | null;
    category: string;
    level: string;
    isPublished: boolean;
    createdAt: Date;
    creator: {
      fullName: string;
    };
    _count?: {
      enrollments: number;
    };
  };
  onFormationDeleted: (formationId: string) => void;
}

export function FormateurFormationCard({ formation, onFormationDeleted }: FormateurFormationCardProps) {
  const [loading, setLoading] = useState(false);

  const levelColors = {
    DEBUTANT: "bg-green-100 text-green-800",
    INTERMEDIAIRE: "bg-yellow-100 text-yellow-800",
    AVANCE: "bg-red-100 text-red-800"
  };

  const handleDeleteFormation = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la formation "${formation.title}" ?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/formations/${formation.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Formation supprimée avec succès");
        onFormationDeleted(formation.id);
      } else {
        const error = await response.json();
        toast.error(error.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="absolute top-3 right-3">
          <Badge variant={formation.isPublished ? "default" : "secondary"}>
            {formation.isPublished ? (
              <><Eye className="h-3 w-3 mr-1" /> Publié</>
            ) : (
              <><EyeOff className="h-3 w-3 mr-1" /> Brouillon</>
            )}
          </Badge>
        </div>
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
        <div className="flex gap-2 w-full">
          <Link href={`/dashboard/formateur/formation/${formation.id}`} className="flex-1">
            <Button variant="outline" className="w-full" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleDeleteFormation}
            disabled={loading}
            className="px-3"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

