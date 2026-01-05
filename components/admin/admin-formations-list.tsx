

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Search, Eye, EyeOff, Trash2, Edit, Users } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Formation {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  isPublished: boolean;
  createdAt: Date | string;
  creator: {
    fullName: string;
    email: string;
  };
  _count: {
    enrollments: number;
  };
}

interface AdminFormationsListProps {
  formations: Formation[];
}

export function AdminFormationsList({ formations: initialFormations }: AdminFormationsListProps) {
  const [formations, setFormations] = useState(initialFormations);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(false);

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         formation.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "published" && formation.isPublished) ||
                         (selectedStatus === "draft" && !formation.isPublished);
    return matchesSearch && matchesStatus;
  });

  const handleTogglePublish = async (formationId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/formations/${formationId}/toggle-publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        setFormations(formations.map(f => 
          f.id === formationId ? { ...f, isPublished: !currentStatus } : f
        ));
        toast.success(currentStatus ? "Formation dépubliée" : "Formation publiée");
      } else {
        toast.error("Erreur lors de la modification");
      }
    } catch (error) {
      toast.error("Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFormation = async (formationId: string, title: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la formation "${title}" ?`)) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/formations/${formationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFormations(formations.filter(f => f.id !== formationId));
        toast.success("Formation supprimée avec succès");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Gestion des formations ({filteredFormations.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par titre ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="published">Publiées</SelectItem>
              <SelectItem value="draft">Brouillons</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Liste des formations */}
        <div className="space-y-4">
          {filteredFormations.map((formation) => (
            <div key={formation.id} className="p-4 border rounded-lg bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-lg">{formation.title}</h3>
                    <Badge variant={formation.isPublished ? "default" : "secondary"}>
                      {formation.isPublished ? (
                        <><Eye className="h-3 w-3 mr-1" /> Publié</>
                      ) : (
                        <><EyeOff className="h-3 w-3 mr-1" /> Brouillon</>
                      )}
                    </Badge>
                    <Badge variant="outline">{formation.level}</Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {formation.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="font-medium">{formation.category}</span>
                    <span>par {formation.creator.fullName}</span>
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {formation._count.enrollments} inscription(s)
                    </span>
                    <span>Créé le {new Date(formation.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Link href={`/dashboard/formateur/formation/${formation.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Button
                    variant={formation.isPublished ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleTogglePublish(formation.id, formation.isPublished)}
                    disabled={loading}
                  >
                    {formation.isPublished ? (
                      <><EyeOff className="h-4 w-4" /></>
                    ) : (
                      <><Eye className="h-4 w-4" /></>
                    )}
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteFormation(formation.id, formation.title)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredFormations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucune formation trouvée
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

