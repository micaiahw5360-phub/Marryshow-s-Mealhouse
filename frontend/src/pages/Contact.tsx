import { useState } from 'react';
import { useNavigate } from 'react-router';  // ADDED for navigation
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { toast } from '../utils/toastWithSound';
import { Send, MessageSquare, Phone, Mail, MapPin, Clock } from 'lucide-react';

export function Contact() {
  const navigate = useNavigate();  // ADDED for navigation
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'general',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      category: 'general',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-[#074af2] rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Have questions, feedback, or suggestions? We'd love to hear from you!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-6 w-6 text-[#074af2]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Phone</h3>
            <p className="text-gray-600 mb-2">Call us during business hours</p>
            <a href="tel:+14734401389" className="text-[#074af2] font-medium hover:underline">
              +1 (473) 440-1389
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-[#f97316]" />
            </div>
            <h3 className="font-bold text-lg mb-2">Email</h3>
            <p className="text-gray-600 mb-2">Send us an email anytime</p>
            <a href="mailto:deli@tamcc.edu.gd" className="text-[#074af2] font-medium hover:underline">
              deli@tamcc.edu.gd
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Location</h3>
            <p className="text-gray-600 mb-2">Visit us on campus</p>
            <p className="text-gray-900 font-medium">
              Main Campus Cafeteria<br />
              St. George's, Grenada
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Category *</Label>
                  <RadioGroup
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="general" id="general" />
                      <Label htmlFor="general" className="font-normal cursor-pointer">General Inquiry</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="feedback" id="feedback" />
                      <Label htmlFor="feedback" className="font-normal cursor-pointer">Feedback</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="complaint" id="complaint" />
                      <Label htmlFor="complaint" className="font-normal cursor-pointer">Complaint</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="suggestion" id="suggestion" />
                      <Label htmlFor="suggestion" className="font-normal cursor-pointer">Menu Suggestion</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your message"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your inquiry, feedback, or suggestion..."
                    rows={6}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg">
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-[#074af2]" />
                <span>Operating Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium text-gray-900">Monday - Friday</span>
                  <span className="text-gray-600">8:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium text-gray-900">Saturday - Sunday</span>
                  <span className="text-red-600 font-medium">Closed</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium text-gray-900">Public Holidays</span>
                  <span className="text-green-600">Check Email</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-orange-50 border-0">
            <CardContent className="pt-6">
              <h3 className="font-bold text-lg mb-3">Quick Tips</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-[#074af2] mr-2">•</span>
                  <span>For urgent order issues, please call us directly for faster assistance</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#074af2] mr-2">•</span>
                  <span>Include your order number when contacting about a specific order</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#074af2] mr-2">•</span>
                  <span>We typically respond to emails within 24 hours during business days</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#074af2] mr-2">•</span>
                  <span>Check our Help Center for answers to common questions</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-12 w-12 text-[#074af2] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Need immediate help?</h3>
              <p className="text-gray-600 mb-4">
                Visit our Help Center for instant answers to common questions
              </p>
              {/* Fixed: Visit Help Center button navigates to /help */}
              <Button variant="outline" className="w-full" onClick={() => navigate('/help')}>
                Visit Help Center
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}