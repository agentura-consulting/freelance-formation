
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, MessageCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

function MessagesPageContent() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('user');

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [formateurs, setFormateurs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (otherUserId: string) => {
    try {
      const res = await fetch(`/api/messages/${otherUserId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        // Rafraîchir les conversations pour mettre à jour le statut de lecture
        fetchConversations();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const fetchFormateurs = async () => {
    try {
      const res = await fetch('/api/messages/formateurs');
      if (res.ok) {
        const data = await res.json();
        setFormateurs(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des formateurs:', error);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchConversations();
      if (session?.user?.role === 'APPRENANT') {
        fetchFormateurs();
      }
    }
  }, [status, session]);

  useEffect(() => {
    if (userId && status === 'authenticated') {
      // Chercher l'utilisateur dans les conversations existantes
      const conversation = conversations.find(c => c.otherUser.id === userId);
      if (conversation) {
        setSelectedUser(conversation.otherUser);
        fetchMessages(userId);
      } else {
        // Sinon, chercher dans la liste des formateurs
        const formateur = formateurs.find(f => f.id === userId);
        if (formateur) {
          setSelectedUser(formateur);
          fetchMessages(userId);
        }
      }
    }
  }, [userId, conversations, formateurs, status]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedUser) {
      return;
    }

    setIsSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedUser.id);
        fetchConversations();
      } else {
        toast.error('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsSending(false);
    }
  };

  const handleStartConversation = (user: any) => {
    setSelectedUser(user);
    setMessages([]);
    setShowNewMessageDialog(false);
    router.push(`/messages?user=${user.id}`);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[600px]" />
            <Skeleton className="h-[600px] md:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Messagerie</h1>
                <p className="text-muted-foreground">
                  Communiquez directement avec vos formateurs
                </p>
              </div>
            </div>
            {session?.user?.role === 'APPRENANT' && formateurs.length > 0 && (
              <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Nouveau message
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Démarrer une conversation</DialogTitle>
                    <DialogDescription>
                      Choisissez un formateur pour commencer une conversation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    {formateurs.map((formateur) => (
                      <div
                        key={formateur.id}
                        className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleStartConversation(formateur)}
                      >
                        <Avatar>
                          <AvatarImage src={formateur.image || undefined} />
                          <AvatarFallback>
                            {formateur.fullName?.[0]?.toUpperCase() || 'F'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{formateur.fullName}</p>
                          {formateur.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {formateur.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Grille conversations + messages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Liste des conversations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune conversation</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.otherUser.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedUser?.id === conversation.otherUser.id
                            ? 'bg-primary/10'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          setSelectedUser(conversation.otherUser);
                          fetchMessages(conversation.otherUser.id);
                          router.push(`/messages?user=${conversation.otherUser.id}`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={conversation.otherUser.image || undefined} />
                            <AvatarFallback>
                              {conversation.otherUser.fullName?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold truncate">
                                {conversation.otherUser.fullName}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <Badge variant="default" className="ml-2">
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage.content}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Zone de messages */}
          <Card className="md:col-span-2">
            {selectedUser ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedUser.image || undefined} />
                      <AvatarFallback>
                        {selectedUser.fullName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedUser.fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.role === 'FORMATEUR_ADMIN' ? 'Formateur' : 'Apprenant'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[480px] p-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Aucun message</p>
                        <p className="text-sm">Envoyez votre premier message !</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isOwn = message.senderId === session?.user?.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-lg p-3 ${
                                  isOwn
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  }`}
                                >
                                  {formatDistanceToNow(new Date(message.createdAt), {
                                    addSuffix: true,
                                    locale: fr,
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Textarea
                        placeholder="Écrivez votre message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={2}
                        className="resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <Button
                        type="submit"
                        disabled={isSending || !newMessage.trim()}
                        className="h-auto"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center text-muted-foreground">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold mb-2">
                    Sélectionnez une conversation
                  </p>
                  <p className="text-sm">
                    Choisissez une conversation pour commencer à échanger
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Chargement...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}
