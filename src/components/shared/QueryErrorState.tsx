'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function QueryErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
      <AlertCircle className="size-6 text-destructive" />
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          ลองใหม่
        </Button>
      )}
    </div>
  );
}
