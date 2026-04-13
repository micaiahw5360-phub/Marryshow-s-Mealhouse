import React from 'react';
import { Link } from 'react-router';
import { Home, SearchX } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <SearchX className="w-12 h-12 text-gray-400" />
          </div>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or
          deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="bg-[#074af2] hover:bg-[#0639c0]">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </Link>
          <Link to="/menu">
            <Button variant="outline">Browse Menu</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
