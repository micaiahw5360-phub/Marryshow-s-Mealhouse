import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from '../../utils/toastWithSound';
import { authService } from '../../services/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset link sent! Check your email (or console log).');
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 bg-cover bg-center"
           style={{ backgroundImage: `url('https://www.outlooktravelmag.com/media/MAIN-Grenada-Landmark-Attractions.webp')` }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm">
          <CardHeader><CardTitle className="text-center">Check Your Email</CardTitle></CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">If an account exists for {email}, you will receive a password reset link shortly.</p>
            <Link to="/login"><Button>Back to Login</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 bg-cover bg-center"
         style={{ backgroundImage: `url('https://www.outlooktravelmag.com/media/MAIN-Grenada-Landmark-Attractions.webp')` }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center">Reset Password</CardTitle>
          <p className="text-gray-600 text-sm text-center">Enter your email address and we'll send you a link to reset your password.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@tamcc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-[#074af2]" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <div className="text-center text-sm">
              <Link to="/login" className="text-[#074af2] hover:underline">Back to Login</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}