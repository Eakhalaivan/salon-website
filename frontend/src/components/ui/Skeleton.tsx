import React from 'react';
import clsx from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded-md bg-surface-container-high/50",
        className
      )}
      {...props}
    />
  );
}

export function ProductSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 flex flex-col h-[400px]">
      <Skeleton className="w-full h-[65%] rounded-none" />
      <div className="p-5 flex flex-col flex-1 gap-4">
        <div>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex items-center justify-between mt-auto">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ServiceSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 flex h-[180px]">
      <Skeleton className="w-[140px] h-full rounded-none" />
      <div className="p-5 flex flex-col flex-1 gap-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center justify-between mt-auto pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-9 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
