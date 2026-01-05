
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VideoPlayer } from "@/components/video-player";
import { ArrowLeft, Play, Download, FileText, Video } from "lucide-react";
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

export default function LearnFormationPage() {
  const { data: session } = useSession() || {};
  const params = useParams();
  const router = useRouter();
  const [formation, setFormation] = useState<any>(null);
  const [currentFile, setCurrentFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        
        // Sélectionner le premier fichier par défaut
        if (data.files?.length > 0) {
          setCurrentFile(data.files[0]);
        }
      } else {
        toast.error("Formation non trouvée");
      }
    } catch (error) {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
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

  const handleFileSelect = async (file: any) => {
    if (file.fileType === 'video') {
      try {
        const response = await fetch(`/api/files/download`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cloud_storage_path: file.cloud_storage_path })
        });
        
        if (response.ok) {
          const { signedUrl } = await response.json();
          setCurrentFile({ ...file, signedUrl });
        } else {
          throw new Error('Erreur lors du chargement');
        }
      } catch (error) {
        toast.error("Erreur lors du chargement de la vidéo");
      }
    } else {
      setCurrentFile(file);
    }
  };

  if (!session || (session.user as any)?.role !== "APPRENANT") {
    router.push("/auth/signin");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Alert variant="destructive">
            <AlertDescription>Formation non trouvée</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-4">
          <Link href="/dashboard/apprenant">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au tableau de bord
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg mb-6">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{formation.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{formation.category}</Badge>
                      <Badge variant="secondary">{formation.level.toLowerCase()}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Zone de contenu */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                {currentFile ? (
                  <div>
                    {currentFile.fileType === 'video' && currentFile.signedUrl ? (
                      <div className="aspect-video">
                        <VideoPlayer
                          src={currentFile.signedUrl}
                          title={currentFile.title}
                        />
                      </div>
                    ) : currentFile.fileType === 'document' ? (
                      <div className="p-8 text-center">
                        <div className="max-w-md mx-auto">
                          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">{currentFile.title}</h3>
                          <p className="text-gray-600 mb-4">
                            Document: {currentFile.filename}
                          </p>
                          <Button 
                            onClick={() => handleDownload(currentFile.cloud_storage_path, currentFile.filename)}
                            className="w-full"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger le document
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-gray-500">Chargement du contenu...</p>
                      </div>
                    )}
                    
                    {/* Titre du fichier actuel */}
                    <div className="p-6 border-t">
                      <h3 className="text-xl font-medium">{currentFile.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {currentFile.fileType === 'video' ? 'Vidéo' : 'Document'} • {currentFile.filename}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Sélectionnez un contenu
                    </h3>
                    <p className="text-gray-600">
                      Choisissez une vidéo ou un document dans la liste ci-contre pour commencer.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Liste des contenus */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Contenu de la formation</CardTitle>
                <CardDescription>
                  {formation.files?.length || 0} ressource{(formation.files?.length || 0) > 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {formation.files?.length > 0 ? (
                  <div className="space-y-1">
                    {formation.files?.map((file: any, index: number) => (
                      <button
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          currentFile?.id === file.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentFile?.id === file.id 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              {file.fileType === 'video' ? (
                                <Video className="h-3 w-3 text-blue-500" />
                              ) : (
                                <FileText className="h-3 w-3 text-green-500" />
                              )}
                              <span className="text-xs text-gray-500 capitalize">
                                {file.fileType}
                              </span>
                            </div>
                            <p className="font-medium text-sm leading-tight">
                              {file.title}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Aucun contenu disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
