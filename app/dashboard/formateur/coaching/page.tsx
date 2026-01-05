
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Edit2, Trash2, Eye, EyeOff, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { CLIENT_TYPE_LABELS } from '@/lib/types';

export default function CoachingPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    content: '',
    isVisible: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated' && session?.user?.role === 'APPRENANT') {
      router.push('/dashboard/apprenant');
    }
  }, [status, session, router]);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/coaching/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const fetchNotes = async (clientId?: string) => {
    try {
      const url = clientId
        ? `/api/coaching?clientId=${clientId}`
        : '/api/coaching';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'APPRENANT') {
      fetchClients();
      fetchNotes();
    }
  }, [status, session]);

  useEffect(() => {
    if (selectedClient) {
      fetchNotes(selectedClient.id);
    } else {
      fetchNotes();
    }
  }, [selectedClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingNote) {
      // Mettre à jour
      try {
        const res = await fetch(`/api/coaching/${editingNote.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          toast.success('Note mise à jour');
          setShowDialog(false);
          setEditingNote(null);
          resetForm();
          fetchNotes(selectedClient?.id);
        } else {
          toast.error('Erreur lors de la mise à jour');
        }
      } catch (error) {
        toast.error('Erreur lors de la mise à jour');
      }
    } else {
      // Créer
      try {
        const res = await fetch('/api/coaching', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          toast.success('Note créée');
          setShowDialog(false);
          resetForm();
          fetchNotes(selectedClient?.id);
        } else {
          toast.error('Erreur lors de la création');
        }
      } catch (error) {
        toast.error('Erreur lors de la création');
      }
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }

    try {
      const res = await fetch(`/api/coaching/${noteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Note supprimée');
        fetchNotes(selectedClient?.id);
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (note: any) => {
    setEditingNote(note);
    setFormData({
      clientId: note.clientId,
      title: note.title,
      content: note.content,
      isVisible: note.isVisible,
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setFormData({
      clientId: selectedClient?.id || '',
      title: '',
      content: '',
      isVisible: true,
    });
    setEditingNote(null);
  };

  const handleToggleVisibility = async (note: any) => {
    try {
      const res = await fetch(`/api/coaching/${note.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVisible: !note.isVisible }),
      });

      if (res.ok) {
        toast.success(note.isVisible ? 'Note masquée' : 'Note rendue visible');
        fetchNotes(selectedClient?.id);
      } else {
        toast.error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[600px]" />
            <Skeleton className="h-[600px] lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Suivi de Coaching</h1>
                <p className="text-muted-foreground">
                  Gérez les notes de coaching de vos apprenants
                </p>
              </div>
            </div>
            <Dialog open={showDialog} onOpenChange={(open) => {
              setShowDialog(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingNote ? 'Modifier la note' : 'Nouvelle note de coaching'}
                    </DialogTitle>
                    <DialogDescription>
                      Créez une note de coaching pour un apprenant
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {!editingNote && (
                      <div className="space-y-2">
                        <Label htmlFor="client">Apprenant</Label>
                        <Select
                          value={formData.clientId}
                          onValueChange={(value) =>
                            setFormData({ ...formData, clientId: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un apprenant" />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => {
                              const clientTypeLabel = client.clientType && client.clientType in CLIENT_TYPE_LABELS 
                                ? CLIENT_TYPE_LABELS[client.clientType as keyof typeof CLIENT_TYPE_LABELS]
                                : 'Non spécifié';
                              return (
                                <SelectItem key={client.id} value={client.id}>
                                  {client.fullName} - {clientTypeLabel}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Ex: Évaluation mensuelle"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Contenu</Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) =>
                          setFormData({ ...formData, content: e.target.value })
                        }
                        placeholder="Détails de la note de coaching..."
                        rows={6}
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="visible"
                        checked={formData.isVisible}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isVisible: checked })
                        }
                      />
                      <Label htmlFor="visible">
                        Visible par l'apprenant
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowDialog(false);
                      resetForm();
                    }}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingNote ? 'Mettre à jour' : 'Créer'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Grille clients + notes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des clients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Apprenants</CardTitle>
              <CardDescription>
                {clients.length} apprenant{clients.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-2">
                <Button
                  variant={!selectedClient ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedClient(null)}
                >
                  <span>Tous les apprenants</span>
                </Button>
                {clients.map((client) => (
                  <Button
                    key={client.id}
                    variant={selectedClient?.id === client.id ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={client.image || undefined} />
                        <AvatarFallback>
                          {client.fullName?.[0]?.toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium truncate">{client.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {client.clientType && client.clientType in CLIENT_TYPE_LABELS 
                            ? CLIENT_TYPE_LABELS[client.clientType as keyof typeof CLIENT_TYPE_LABELS]
                            : 'Non spécifié'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {client._count?.coachingReceived || 0}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Liste des notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">
                Notes de coaching
                {selectedClient && ` - ${selectedClient.fullName}`}
              </CardTitle>
              <CardDescription>
                {notes.length} note{notes.length > 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">Aucune note</p>
                  <p className="text-sm">
                    Créez votre première note de coaching
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <Card key={note.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">
                                {note.title}
                              </CardTitle>
                              {note.isVisible ? (
                                <Badge variant="default" className="text-xs">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Visible
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Masqué
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {!selectedClient && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-5 h-5">
                                    <AvatarImage src={note.client?.image || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {note.client?.fullName?.[0]?.toUpperCase() || 'A'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-muted-foreground">
                                    {note.client?.fullName}
                                  </span>
                                  <span className="text-muted-foreground">•</span>
                                </div>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(note.createdAt), {
                                  addSuffix: true,
                                  locale: fr,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleVisibility(note)}
                            >
                              {note.isVisible ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(note)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(note.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
