import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-2xl max-w-lg">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              দুঃখিত, একটি অনাকাঙ্ক্ষিত ত্রুটি হয়েছে
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              আমরা সমস্যাটি সমাধান করার চেষ্টা করছি। অনুগ্রহ করে পেজটি রিলোড করুন অথবা হোমে ফিরে যান।
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()} variant="outline">
                রিলোড করুন
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                হোমপেজ
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
