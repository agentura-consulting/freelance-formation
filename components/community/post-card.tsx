
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  ThumbsUp, 
  Sparkles, 
  HandHeart,
  Pin,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { CommentSection } from './comment-section';
import { ShareDialog } from './share-dialog';
import { REACTION_TYPE_LABELS, CLIENT_TYPE_LABELS } from '@/lib/types';

type PostCardProps = {
  post: any;
  onUpdate?: () => void;
};

export function PostCard({ post, onUpdate }: PostCardProps) {
  const { data: session } = useSession() || {};
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userReaction, setUserReaction] = useState(
    post.reactions?.find((r: any) => r.userId === session?.user?.id)
  );

  const isAuthor = session?.user?.id === post.authorId;
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'FORMATEUR_ADMIN';

  const handleReaction = async (type: string) => {
    try {
      if (userReaction?.type === type) {
        // Supprimer la réaction
        const res = await fetch(`/api/community/posts/${post.id}/reactions`, {
          method: 'DELETE',
        });

        if (res.ok) {
          setUserReaction(null);
          onUpdate?.();
        }
      } else {
        // Ajouter ou modifier la réaction
        const res = await fetch(`/api/community/posts/${post.id}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type }),
        });

        if (res.ok) {
          const reaction = await res.json();
          setUserReaction(reaction);
          onUpdate?.();
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la réaction');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/community/posts/${post.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Publication supprimée');
        onUpdate?.();
      } else {
        toast.error('Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePin = async () => {
    try {
      const res = await fetch(`/api/community/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !post.isPinned }),
      });

      if (res.ok) {
        toast.success(post.isPinned ? 'Publication désépinglée' : 'Publication épinglée');
        onUpdate?.();
      } else {
        toast.error('Erreur lors de l\'épinglage');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'épinglage');
    }
  };

  const reactionCounts = post.reactions?.reduce((acc: any, r: any) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {}) || {};

  return (
    <>
      <Card className={post.isPinned ? 'border-primary' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={post.author?.image || undefined} />
                <AvatarFallback>
                  {post.author?.fullName?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{post.author?.fullName}</p>
                  {post.author?.clientType && (
                    <Badge variant="outline" className="text-xs">
                      {CLIENT_TYPE_LABELS[post.author.clientType as keyof typeof CLIENT_TYPE_LABELS]}
                    </Badge>
                  )}
                  {post.isPinned && (
                    <Badge variant="secondary" className="text-xs">
                      <Pin className="w-3 h-3 mr-1" />
                      Épinglé
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </p>
              </div>
            </div>

            {(isAuthor || isAdmin) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isAdmin && (
                    <DropdownMenuItem onClick={handlePin}>
                      <Pin className="w-4 h-4 mr-2" />
                      {post.isPinned ? 'Désépingler' : 'Épingler'}
                    </DropdownMenuItem>
                  )}
                  {(isAuthor || isAdmin) && (
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <p className="whitespace-pre-wrap">{post.content}</p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {/* Statistiques */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground w-full">
            {Object.keys(reactionCounts).length > 0 && (
              <div className="flex items-center gap-1">
                {Object.entries(reactionCounts).map(([type, count]) => {
                  const label = REACTION_TYPE_LABELS[type as keyof typeof REACTION_TYPE_LABELS];
                  return (
                    <span key={type} className="flex items-center">
                      {label || type} {String(count)}
                    </span>
                  );
                })}
              </div>
            )}
            {post._count?.comments > 0 && (
              <span>{post._count.comments} commentaire{post._count.comments > 1 ? 's' : ''}</span>
            )}
            {post._count?.shares > 0 && (
              <span>{post._count.shares} partage{post._count.shares > 1 ? 's' : ''}</span>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center gap-2 w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant={userReaction ? 'default' : 'ghost'} 
                  size="sm" 
                  className="flex-1"
                >
                  {userReaction ? (
                    <>
                      <span className="mr-2">
                        {REACTION_TYPE_LABELS[userReaction.type as keyof typeof REACTION_TYPE_LABELS]}
                      </span>
                      Réagi
                    </>
                  ) : (
                    <>
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Réagir
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleReaction('LIKE')}>
                  👍 J'aime
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReaction('LOVE')}>
                  ❤️ J'adore
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReaction('SUPPORT')}>
                  🙌 Soutien
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleReaction('CELEBRATE')}>
                  🎉 Bravo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Commenter
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => setShowShareDialog(true)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
          </div>

          {/* Section commentaires */}
          {showComments && (
            <CommentSection 
              postId={post.id} 
              comments={post.comments || []}
              onUpdate={onUpdate}
            />
          )}
        </CardFooter>
      </Card>

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        postId={post.id}
        onShare={onUpdate}
      />
    </>
  );
}
