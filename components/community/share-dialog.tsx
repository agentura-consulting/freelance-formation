
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  onShare?: () => void;
};

export function ShareDialog({ open, onOpenChange, postId, onShare }: ShareDialogProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleShare = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/community/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });

      if (res.ok) {
        toast.success('Publication partagée !');
        setComment('');
        onOpenChange(false);
        onShare?.();
      } else {
        toast.error('Erreur lors du partage');
      }
    } catch (error) {
      toast.error('Erreur lors du partage');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Partager cette publication</DialogTitle>
          <DialogDescription>
            Ajoutez un commentaire optionnel à votre partage
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Pourquoi partagez-vous cette publication ? (optionnel)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleShare} disabled={isSubmitting}>
            {isSubmitting ? 'Partage...' : 'Partager'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
