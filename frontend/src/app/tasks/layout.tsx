'use client';

import React from 'react';
import Header from '@/components/Header';

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="py-6">
        {children}
      </main>
    </div>
  );
}