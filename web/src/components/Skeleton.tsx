import { type HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div 
      className={`bg-gray-200 animate-pulse rounded-md ${className}`} 
      {...props} 
    />
  );
}