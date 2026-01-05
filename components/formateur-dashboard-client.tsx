

"use client";

import { useState } from "react";
import { FormateurFormationCard } from "./formateur-formation-card";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";

interface Formation {
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
}

interface FormateurDashboardClientProps {
  formations: Formation[];
}

export function FormateurDashboardClient({ formations: initialFormations }: FormateurDashboardClientProps) {
  const [formations, setFormations] = useState(initialFormations);

  const handleFormationDeleted = (formationId: string) => {
    setFormations(formations.filter(f => f.id !== formationId));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Mes formations
        </h2>
        {formations.length > 0 && (
          <Badge variant="secondary">
            {formations.length} formation{formations.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      
      {formations.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((formation) => (
            <FormateurFormationCard
              key={formation.id}
              formation={formation}
              onFormationDeleted={handleFormationDeleted}
            />
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune formation créée
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer votre première formation pour partager vos connaissances.
            </p>
            <Link href="/dashboard/formateur/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer ma première formation
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

