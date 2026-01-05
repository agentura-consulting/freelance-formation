
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, Eye, EyeOff, Save, Trash2, Download, Play } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
// Fonction helper pour télécharger les fichiers
const downloadFileHelper = async (cloud_storage_path: string, filename: string) => {
  try {
    const response = await fetch(`/api/files/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cloud_storage_path })
    });
    
    if (response.ok) {
      const { signedUrl } = await response.json();
      const link = document.createElement('a');
      link.href = signedUrl;
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      throw new Error('Erreur lors du téléchargement');
    }
  } catch (error) {
    throw error;
  }
};
import { VideoPlayer } from "@/components/video-player";

export default function FormationDetailPage() {
  const { data: session } = useSession() || {};
  const params = useParams();
  const router = useRouter();
  const [formation, setFormation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  
  const [uploadForm, setUploadForm] = useState({
    title: "",
    file: null as File | null,
    order: 0
  });

  useEffect(() => {
    if (params?.id) {
      fetchFormation();
    }
  }, [params?.id]);

  const fetchFormation = async () => {
    try {
      const response = await fetch(`/api/formations/${params?.id}`);
      if (response.ok) {
        const data = await response.json();
        setFormation(data);
      } else {
        setError("Formation non trouvée");
      }
    } catch (error) {
      setError("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async () => {
    try {
      const response = await fetch(`/api/formations/${params?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          isPublished: !formation?.isPublished 
        })
      });

      if (response.ok) {
        const updatedFormation = await response.json();
        setFormation(updatedFormation);
        toast.success(updatedFormation.isPublished ? "Formation publiée !" : "Formation dépubliée !");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file || !uploadForm.title) {
      toast.error("Fichier et titre requis");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("title", uploadForm.title);
      formData.append("order", uploadForm.order.toString());

      const response = await fetch(`/api/formations/${params?.id}/files`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        toast.success("Fichier uploadé avec succès !");
        setUploadForm({ title: "", file: null, order: 0 });
        fetchFormation(); // Recharger les données
      } else {
        const data = await response.json();
        toast.error(data.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (cloud_storage_path: string, filename: string) => {
    try {
      await downloadFileHelper(cloud_storage_path, filename);
      toast.success("Téléchargement démarré !");
    } catch (error) {
      toast.error("Erreur lors du téléchargement");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error || !formation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Alert variant="destructive">
            <AlertDescription>{error || "Formation non trouvée"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const videoFiles = formation.files?.filter((f: any) => f.fileType === 'video') || [];
  const documentFiles = formation.files?.filter((f: any) => f.fileType === 'document') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link href="/dashboard/formateur">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {formation.title}
              </h1>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">{formation.category}</Badge>
                <Badge variant="secondary">{formation.level.toLowerCase()}</Badge>
                <Badge variant={formation.isPublished ? "default" : "secondary"}>
                  {formation.isPublished ? (
                    <><Eye className="h-3 w-3 mr-1" /> Publié</>
                  ) : (
                    <><EyeOff className="h-3 w-3 mr-1" /> Brouillon</>
                  )}
                </Badge>
              </div>
            </div>
            
            <Button onClick={togglePublish}>
              {formation.isPublished ? (
                <><EyeOff className="h-4 w-4 mr-2" /> Dépublier</>
              ) : (
                <><Eye className="h-4 w-4 mr-2" /> Publier</>
              )}
            </Button>
          </div>
          
          <p className="text-gray-600 mb-4">{formation.description}</p>
          <p className="text-sm text-gray-500">
            {formation._count?.enrollments || 0} apprenant{(formation._count?.enrollments || 0) > 1 ? 's' : ''}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Section Upload */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Ajouter du contenu
              </CardTitle>
              <CardDescription>
                Uploadez vos vidéos et documents de formation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du fichier</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Introduction - Partie 1"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Fichier</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="video/*,.pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => setUploadForm(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Formats supportés: MP4, PDF, DOC, DOCX, PPT, PPTX
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Ordre</Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    value={uploadForm.order}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <Button type="submit" disabled={uploading} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Upload en cours..." : "Uploader le fichier"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Section Contenu */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Contenu de la formation</CardTitle>
              <CardDescription>
                {formation.files?.length || 0} fichier{(formation.files?.length || 0) > 1 ? 's' : ''} uploadé{(formation.files?.length || 0) > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Vidéos */}
                {videoFiles.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Play className="h-4 w-4 mr-2" />
                      Vidéos ({videoFiles.length})
                    </h4>
                    <div className="space-y-2">
                      {videoFiles.map((file: any) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{file.title}</p>
                            <p className="text-xs text-gray-500">{file.filename}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(file.cloud_storage_path, file.filename)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {documentFiles.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Documents ({documentFiles.length})
                    </h4>
                    <div className="space-y-2">
                      {documentFiles.map((file: any) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{file.title}</p>
                            <p className="text-xs text-gray-500">{file.filename}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(file.cloud_storage_path, file.filename)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formation.files?.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun fichier uploadé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
