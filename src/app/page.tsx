'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bot, Users, Target } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to signup page after a short delay
    const timer = setTimeout(() => {
      router.push('/auth/signup');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Bot className="h-16 w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Career Counselor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your AI-powered career guidance companion. Get personalized advice, 
            explore career paths, and make informed professional decisions.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <MessageSquare className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Personalized Guidance</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get tailored career advice based on your unique goals and circumstances.
            </p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Target className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Goal-Oriented</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Set and track your career objectives with actionable insights and strategies.
            </p>
          </Card>
          
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <Users className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Expert Knowledge</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Access professional career counseling expertise powered by advanced AI.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => router.push('/auth/signup')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Start Your Career Journey
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Redirecting to signup in a few seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
