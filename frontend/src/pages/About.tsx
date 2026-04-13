import { Card, CardContent } from '../components/ui/card';
import { Award, Users, Heart, Leaf, Clock, MapPin, Target, Shield } from 'lucide-react';
import { YouTubePlayer } from '../components/YouTubePlayer';

export function About() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Marryshow's Mealhouse</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted campus dining partner at T.A. Marryshow Community College
        </p>
      </div>

      <div className="mb-16">
        <YouTubePlayer
          videoId="NFKC3NwYcFY"   // ← replace with your actual YouTube video ID
          autoplay={true}
          muted={false}              // required for autoplay in most browsers
          controls={true}
          className="w-full h-[400px] rounded-lg shadow-lg overflow-hidden"
        />
      </div>

      <div className="prose prose-lg max-w-none mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
        <p className="text-gray-700 mb-4">
          Marryshow's Mealhouse has been serving the TAMCC community since 2024, providing delicious,
          nutritious meals to students, faculty, and staff. Named after our institution's founding father,
          T.A. Marryshow, we embody his vision of excellence and community service.
        </p>
        <p className="text-gray-700 mb-4">
          What started as a small cafeteria has grown into a beloved campus institution, serving over
          500 meals daily. We take pride in offering a diverse menu that celebrates Caribbean flavors
          while catering to various dietary preferences and restrictions.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Mission & Values</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-[#074af2]" />
              </div>
              <h3 className="font-bold text-lg mb-2">Quality First</h3>
              <p className="text-gray-600 text-sm">
                We source fresh, high-quality ingredients and prepare every meal with care and attention to detail.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-[#f97316]" />
              </div>
              <h3 className="font-bold text-lg mb-2">Community</h3>
              <p className="text-gray-600 text-sm">
                We're more than a cafeteria—we're a gathering place where the TAMCC family comes together.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Sustainability</h3>
              <p className="text-gray-600 text-sm">
                We prioritize locally sourced ingredients and eco-friendly practices to reduce our environmental impact.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Food Safety</h3>
              <p className="text-gray-600 text-sm">
                We maintain the highest standards of food safety and hygiene to ensure every meal is safe and delicious.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-16 bg-gradient-to-br from-blue-50 to-orange-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">By The Numbers</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-[#074af2] mb-2">500+</p>
            <p className="text-gray-700">Meals Served Daily</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-[#074af2] mb-2">50+</p>
            <p className="text-gray-700">Menu Items</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-[#074af2] mb-2">2</p>
            <p className="text-gray-700">Years Serving TAMCC</p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-bold text-[#074af2] mb-2">4.8★</p>
            <p className="text-gray-700">Average Rating</p>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">What Makes Us Special</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-[#074af2]" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Award-Winning Cuisine</h3>
              <p className="text-gray-600">
                Our Caribbean Chicken Bowl won the 2024 National Campus Dining Excellence Award,
                recognizing our commitment to authentic flavors and quality.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-[#f97316]" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Student Employment</h3>
              <p className="text-gray-600">
                We employ 15+ TAMCC students, providing valuable work experience and helping
                them earn money while pursuing their education.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Local Partnerships</h3>
              <p className="text-gray-600">
                We source 70% of our produce from local Grenadian farmers, supporting our community
                and ensuring the freshest ingredients.
              </p>
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Convenient Hours</h3>
              <p className="text-gray-600">
                Open from early morning to evening, we're here whenever you need a great meal
                between classes or during study sessions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <Card className="bg-[#074af2] text-white">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              We're always looking for passionate individuals to join the Marryshow's Mealhouse family.
              If you love food and serving others, we'd love to hear from you!
            </p>
            {/* Fixed: View Job Openings button opens Contact page in new tab */}
            <button 
              onClick={() => window.open('/contact', '_blank')} 
              className="bg-white text-[#074af2] px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              View Job Openings
            </button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Card>
          <CardContent className="py-8">
            <MapPin className="h-12 w-12 text-[#074af2] mx-auto mb-4" />
            <h3 className="font-bold text-xl mb-2">Visit Us</h3>
            <p className="text-gray-700 mb-1">Main Campus Cafeteria Building</p>
            <p className="text-gray-700 mb-4">T.A. Marryshow Community College<br />St. George's, Grenada</p>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Operating Hours:</p>
              <p>Monday - Friday: 8:00 AM - 4:00 PM</p>
              <p>Saturday - Sunday: Closed</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}