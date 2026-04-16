import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../utils/toastWithSound';
// Import your logo
import logo2 from '../../assets/logo2.png';   // adjust the path if needed

export function Login() {
  const { login, user, setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await login(formData.email, formData.password, formData.remember);
      if (success) {
        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const token = credentialResponse.credential;
    if (!token) {
      toast.error('Google login failed – no token received');
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.remember) {
          localStorage.setItem('tamcc_token', data.token);
          localStorage.setItem('tamcc_user', JSON.stringify(data.user));
        } else {
          sessionStorage.setItem('tamcc_token', data.token);
          sessionStorage.setItem('tamcc_user', JSON.stringify(data.user));
        }
        setUser(data.user);
        toast.success('Google login successful!');
        navigate('/');
      } else {
        toast.error(data.error || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Could not verify Google login');
    }
  };

  const handleGoogleError = () => {
    console.error('Google login failed');
    toast.error('Google login failed – please try again');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
         style={{ backgroundImage: `url('https://www.outlooktravelmag.com/media/MAIN-Grenada-Landmark-Attractions.webp')` }}>
      <div className="absolute inset-0 bg-black/50"></div>
      <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {/* Replace the blue "T" box with your logo */}
            <img src={logo2} alt="Marryshow's Mealhouse" className="w-48 h-48 object-contain" />
          </div>
          <CardTitle className="text-2xl">Sign in to Marryshow's Mealhouse</CardTitle>
          <p className="text-gray-600 text-sm mt-2">Enter your credentials to access your account</p>
        </CardHeader>
        <CardContent>
          {/* rest of the component unchanged */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@tamcc.edu.gd"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {/* eye icon */}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="w-4 h-4 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Remember Me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-[#074af2] hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" className="w-full bg-[#074af2] hover:bg-[#0639c0]" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap />
          </div>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/register" className="text-[#074af2] hover:underline font-medium">Create one now</Link>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">By signing in, you agree to our <Link to="/terms" className="text-[#074af2] hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#074af2] hover:underline">Privacy Policy</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}