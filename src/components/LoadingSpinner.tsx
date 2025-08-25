"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 16, className }) => {
  return (
    <Loader2 size={size} className={cn("animate-spin", className)} />
  );
};

export default LoadingSpinner;