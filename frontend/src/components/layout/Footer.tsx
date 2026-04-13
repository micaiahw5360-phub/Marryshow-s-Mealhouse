import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 mt-16 border-t border-gray-700">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-white text-xl font-bold mb-3">Marryshow's Mealhouse</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Fresh, affordable meals made daily for the TAMCC community. Order online and skip the line!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
              <li><Link to="/terms" className="hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-orange-400" /> TAMCC Campus, St. George's</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-orange-400" /> 473-440-2000</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-orange-400" /> deli@tamcc.edu.gd</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Marryshow's Mealhouse. All rights reserved.
        </div>
      </div>
    </footer>
  );
}