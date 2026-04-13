import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Search, HelpCircle, Clock, ShoppingCart, CreditCard, User, MapPin, Phone, Mail } from 'lucide-react';

const faqCategories = [
  {
    id: 'ordering',
    title: 'Ordering',
    icon: ShoppingCart,
    questions: [
      {
        question: 'How do I place an order?',
        answer: 'You can place an order by browsing our menu, adding items to your cart, and proceeding to checkout. You can pay using cash, your TAMCC wallet, or credit/debit card.',
      },
      {
        question: 'Can I customize my order?',
        answer: 'Yes! Most menu items have customization options. When you select an item, you\'ll see available options like spice level, protein choice, dressing type, and more.',
      },
      {
        question: 'What is the minimum order amount?',
        answer: 'There is no minimum order amount. You can order a single item if you wish.',
      },
      {
        question: 'Can I save my favorite items?',
        answer: 'Yes! Click the heart icon on any menu item to save it to your favorites for quick access later.',
      },
    ],
  },
  {
    id: 'pickup',
    title: 'Pickup & Delivery',
    icon: MapPin,
    questions: [
      {
        question: 'Where can I pick up my order?',
        answer: 'All orders are available for pickup at the Main Campus Deli located in the TAMCC cafeteria building. Look for the "Marryshow\'s Mealhouse" signage.',
      },
      {
        question: 'How long does it take to prepare my order?',
        answer: 'Most orders are ready within 10-15 minutes. You\'ll receive a notification when your order is ready for pickup.',
      },
      {
        question: 'What are your operating hours?',
        answer: 'We\'re open Monday to Friday, 7:00 AM - 6:00 PM, and Saturday 9:00 AM - 3:00 PM. We\'re closed on Sundays and public holidays.',
      },
      {
        question: 'Do you offer delivery?',
        answer: 'Currently, we only offer pickup service. Delivery may be available in the future for on-campus locations.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Payment',
    icon: CreditCard,
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept cash, credit/debit cards (Visa, Mastercard, American Express), and TAMCC wallet payments.',
      },
      {
        question: 'How do I add funds to my TAMCC wallet?',
        answer: 'You can add funds to your TAMCC wallet through the Wallet page in your account. We accept credit/debit card payments for wallet top-ups.',
      },
      {
        question: 'Can I get a refund?',
        answer: 'Refunds are available for cancelled orders that haven\'t been prepared yet. Contact us within 5 minutes of placing your order for cancellation and refund.',
      },
      {
        question: 'Are there any transaction fees?',
        answer: 'There are no transaction fees for any payment method. The price you see is the price you pay.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account',
    icon: User,
    questions: [
      {
        question: 'Do I need an account to order?',
        answer: 'Yes, you need to create a free account with your TAMCC email to place orders. This helps us track your orders and preferences.',
      },
      {
        question: 'How do I reset my password?',
        answer: 'On the login page, click "Forgot Password?" and follow the instructions to reset your password via email.',
      },
      {
        question: 'Can I update my profile information?',
        answer: 'Yes! Go to your Profile page to update your name, email, phone number, and other account details.',
      },
      {
        question: 'How do I view my order history?',
        answer: 'Navigate to the Order History page from your account menu to see all your past orders.',
      },
    ],
  },
  {
    id: 'menu',
    title: 'Menu & Nutrition',
    icon: HelpCircle,
    questions: [
      {
        question: 'Are nutritional information available?',
        answer: 'Yes! Click on any menu item to view detailed nutritional information including calories, protein, carbs, and fat content.',
      },
      {
        question: 'Do you have vegetarian/vegan options?',
        answer: 'Yes, we offer several vegetarian options. Look for items marked with dietary indicators on the menu.',
      },
      {
        question: 'How often does the menu change?',
        answer: 'We update our menu seasonally and add special items regularly. Follow our notifications to stay updated on new menu items.',
      },
      {
        question: 'Can I suggest menu items?',
        answer: 'Absolutely! We love hearing from our customers. Use the Contact page to send us your suggestions.',
      },
    ],
  },
];

export function Help() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-[#074af2] rounded-full flex items-center justify-center mx-auto mb-4">
          <HelpCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about ordering, pickup, payment, and more
        </p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try searching with different keywords</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-[#074af2]" />
                    </div>
                    <span>{category.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-12 bg-gradient-to-br from-blue-50 to-orange-50 border-0">
        <CardContent className="py-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Still need help?</h3>
            <p className="text-gray-700 mb-6">
              Can't find what you're looking for? Get in touch with our support team
            </p>
            <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <Phone className="h-6 w-6 text-[#074af2] mx-auto mb-2" />
                <p className="font-medium text-gray-900 mb-1">Call Us</p>
                <p className="text-sm text-gray-600">+1 (473) 440-1389</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <Mail className="h-6 w-6 text-[#074af2] mx-auto mb-2" />
                <p className="font-medium text-gray-900 mb-1">Email Us</p>
                <p className="text-sm text-gray-600">deli@tamcc.edu.gd</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <Clock className="h-6 w-6 text-[#074af2] mx-auto mb-2" />
                <p className="font-medium text-gray-900 mb-1">Hours</p>
                <p className="text-sm text-gray-600">Mon-Fri: 8AM-4PM</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
