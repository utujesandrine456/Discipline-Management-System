import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-24 text-center rounded-md border border-[#0A0E2E]/10 bg-[#0A0E2E]/[0.02]', className)}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-[#0A0E2E]/10 rounded-full blur-xl scale-150 animate-pulse" />
        <div className="relative rounded-md bg-[#0A0E2E] p-5 shadow-2xl shadow-[#0A0E2E]/30">
          <Icon className="h-10 w-10 text-white" />
        </div>
      </div>
      <h3 className="text-2xl font-black text-[#0A0E2E] mb-2 tracking-tight">{title}</h3>
      <p className="text-sm font-semibold text-[#0A0E2E]/60 max-w-sm mb-8 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="rounded-md bg-[#0A0E2E] text-white px-8 py-6 h-auto text-sm font-bold shadow-lg shadow-[#0A0E2E]/20 hover:bg-[#1a264a] transition-all hover:scale-105 active:scale-95"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
