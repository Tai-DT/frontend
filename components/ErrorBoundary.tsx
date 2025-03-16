"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

const DefaultFallback = ({ error, resetError }: { error?: Error; resetError: () => void }) => (
  <Card className="w-full max-w-md mx-auto shadow-lg border-red-200 animate-in slide-in-from-bottom duration-300">
    <CardHeader className="bg-red-50 text-red-900">
      <div className="flex items-center gap-2">
        <ExclamationTriangleIcon className="h-5 w-5" />
        <CardTitle>Something went wrong</CardTitle>
      </div>
      <CardDescription className="text-red-700">
        An error occurred while rendering this component
      </CardDescription>
    </CardHeader>
    
    <CardContent className="pt-6">
      {error && (
        <div className="bg-gray-50 p-3 rounded-md overflow-auto text-sm text-gray-800">
          <p className="font-mono">{error.message}</p>
        </div>
      )}
    </CardContent>
    
    <CardFooter>
      <Button 
        onClick={resetError} 
        variant="outline" 
        className="w-full hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        Try again
      </Button>
    </CardFooter>
  </Card>
);

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError() {
    this.setState({ hasError: false, error: undefined });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <DefaultFallback error={this.state.error} resetError={this.resetError} />;
    }
    return this.props.children;
  }
}
