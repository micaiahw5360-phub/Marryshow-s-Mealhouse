import React, { useState, useEffect } from 'react';   // ADDED useState, useEffect
import { Link } from 'react-router';
import { Leaf, DollarSign, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { itemsService } from '../services/api';   // ADDED (replaces popularItems import)
import { YouTubePlayer } from '../components/YouTubePlayer';

const campusImage = 'https://www.tamcc.edu.gd/wp-content/uploads/2024/01/Drone-Shot-Tanteen-scaled.jpg';
const cafeteriaImage = 'https://images.unsplash.com/photo-1696217061787-05412204462f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWZldGVyaWElMjBkaW5pbmclMjBoYWxsJTIwZm9vZHxlbnwxfHx8fDE3NzQ1NjgyMTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

export function Landing() {
  // ADDED state and effect for popular items
  const [popularItems, setPopularItems] = useState([]);

  useEffect(() => {
  itemsService.getItems().then(items => {
    const itemsWithNumberPrice = items.map(item => ({
      ...item,
      price: typeof item.price === 'string' ? parseFloat(item.price) : item.price
    }));
    setPopularItems(itemsWithNumberPrice.slice(0, 3));
  });
}, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[500px] bg-gray-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${campusImage})` }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Marryshow's Mealhouse
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Fresh, affordable meals made daily for the TAMCC community. Order online and skip
              the line!
            </p>
            <Link to="/menu">
              <Button size="lg" className="bg-[#f97316] hover:bg-[#ea580c] text-white">
                View Our Menu
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-[#10b981]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Fresh Ingredients</h3>
                <p className="text-gray-600">
                  We use only the freshest local ingredients to prepare your meals daily.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-[#f97316]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-[#f97316]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Student Budget</h3>
                <p className="text-gray-600">
                  Affordable prices designed with students in mind. Great value, great taste!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-6">
                <div className="w-16 h-16 bg-[#074af2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-[#074af2]" />
                </div>
                <h3 className="text-xl font-bold mb-2">Right on Campus</h3>
                <p className="text-gray-600">
                  Conveniently located in the heart of TAMCC. Quick pickup between classes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Menu Items</h2>
            <p className="text-gray-600">Try our customer favorites</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {popularItems.map((item) => (   // CHANGED: now uses state variable
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#074af2]">
                      ${item.price.toFixed(2)}
                    </span>
                    <Link to="/menu">
                      <Button size="sm" className="bg-[#f97316] hover:bg-[#ea580c]">
                        Order Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/menu">
              <Button variant="outline" size="lg">
                View Full Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">About Marryshow's Mealhouse</h2>
              <p className="text-gray-600 mb-4">
                Located in the heart of T.A. Marryshow Community College, our cafeteria has been
                serving the TAMCC community for over a decade. We're committed to providing
                nutritious, delicious, and affordable meals to students, staff, and faculty.
              </p>
              <p className="text-gray-600 mb-6">
                Our online ordering system makes it easy to skip the line and get your food when
                you need it. Simply browse our menu, place your order, and pick it up at your
                convenience.
              </p>
              <Link to="/register">
                <Button className="bg-[#074af2] hover:bg-[#0639c0]">Get Started Today</Button>
              </Link>
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg bg-gray-100">
              <YouTubePlayer 
                videoId="xThoN4jrq58"   // ← replace with your actual YouTube video ID
                  controls={true}
                />
            </div>
          </div>
        </div>
      </section>

      {/* Opening Hours Section */}
      <section className="py-16 bg-[#074af2] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
         <Clock className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-8">Opening Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold mb-2 text-[#f97316]">Weekdays</h3>
          <p className="text-white/90">Monday - Friday</p>
          <p className="text-lg">8:00 AM - 4:00 PM</p>
        </div>
        <div>
          <h3 className="font-bold mb-2 text-[#f97316]">Weekends</h3>
          <p className="text-white/90">Saturday - Sunday</p>
          <p className="text-lg">Closed</p>
        </div>
        <div>
          <h3 className="font-bold mb-2 text-[#f97316]">Public Holidays</h3>
          <p className="text-lg">Check Email</p>
        </div>
      </div>
    </div>
  </div>
      </section>
    </div>
  );
}