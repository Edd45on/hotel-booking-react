import { useState, useRef } from 'react';
import {
  Search,
  CreditCard,
  Plane,
  Briefcase,
  Users,
  Heart,
  Sun,
  Calendar,
  MoreHorizontal,
  Home
} from 'lucide-react';

import HowItWorks from './HowItWorks';
import TrustSection from './TrustSection';
import FAQ from './FAQ';
import DatePickerInput from './components/DatePickerInput';

// Data
const destinations = ["Batangas", "Cebu", "Clark", "Davao", "Metro Manila", "Tagaytay", "Other"];
const priorities = ["Cheapest", "Best Value", "Near Airport", "Family", "Business"];
const budgets = [
  { label: "Under ₱1,000", value: "under-1000" },
  { label: "₱1,000 – ₱1,500", value: "1000-1500" },
  { label: "₱1,500 – ₱2,500", value: "1500-2500" },
  { label: "₱2,500 – ₱5,000", value: "2500-5000" },
  { label: "₱5,000+", value: "5000+" }
];
const purposes = [
  { label: "Airport / Flight", icon: Plane },
  { label: "Business", icon: Briefcase },
  { label: "Vacation", icon: Sun },
  { label: "Family", icon: Users },
  { label: "Couple", icon: Heart },
  { label: "Event", icon: Calendar },
  { label: "Staycation", icon: Home },
  { label: "Other", icon: MoreHorizontal }
];

export default function App() {
  const [loading, setLoading] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

  // Admin Access via Headline Tap
  const [tapCount, setTapCount] = useState(0);
  const handleSecretTap = () => {
    setTapCount(prev => prev + 1);
    if (tapCount + 1 >= 5) {
      setTapCount(0);
      window.location.href = '/admin';
    }
    setTimeout(() => setTapCount(0), 2000);
  };

  const destinationsR2 = [
    { name: "Metro Manila", region: "Luzon", image: "https://pub-520fe91b713446edb95e193ae19ef26f.r2.dev/images/metro-manila.jpg" },
    { name: "Tagaytay", region: "Luzon", image: "https://pub-520fe91b713446edb95e193ae19ef26f.r2.dev/images/tagaytay.jpg" },
    { name: "Cebu", region: "Visayas", image: "https://pub-520fe91b713446edb95e193ae19ef26f.r2.dev/images/cebu.jpg" },
    { name: "Clark", region: "Luzon", image: "https://pub-520fe91b713446edb95e193ae19ef26f.r2.dev/images/clark.jpg" },
    { name: "Batangas", region: "Luzon", image: "https://pub-520fe91b713446edb95e193ae19ef26f.r2.dev/images/batangas.jpg" },
    { name: "Davao", region: "Mindanao", image: "https://pub-520fe91b713446edb95e193ae19ef26f.r2.dev/images/davao.jpg" }
  ];

  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'Other') {
      setShowOtherInput(true);
      setTimeout(() => otherInputRef.current?.focus(), 50);
    } else {
      setShowOtherInput(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!checkInDate || !checkOutDate) {
      setDateError('Please select both a Check-in and Check-out date.');
      return;
    }

    setDateError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    let finalDestination = formData.get('destination') as string;
    
    if (finalDestination === 'Other') {
      finalDestination = formData.get('other-destination') as string;
      if (!finalDestination?.trim()) {
        alert('Please type your destination.');
        setLoading(false);
        return;
      }
    }

    const data = {
      destination: finalDestination,
      checkIn: checkInDate.toISOString().split('T')[0],
      checkOut: checkOutDate.toISOString().split('T')[0],
      adults: formData.get('adults')?.toString() || '2',
      children: formData.get('children')?.toString() || '0',
      rooms: formData.get('rooms')?.toString() || '1',
      purpose: selectedPurpose || 'Not specified',
      priority: selectedPriority || 'Not specified',
      budget: formData.get('budget')?.toString() || '',
      specialRequest: formData.get('special-request')?.toString() || ''
    };

    try {
      const response = await fetch('/api/submit-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert(`✅ Thank you! Your request for ${data.destination} is saved. We will contact you with suitable hotel options shortly.`);
        formRef.current?.reset();
        setSelectedPurpose(null);
        setSelectedPriority(null);
        setShowOtherInput(false);
        setCheckInDate(null);
        setCheckOutDate(null);
      } else {
        alert('❌ Server error. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('❌ Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans">

      {/* HERO */}
      <section className="bg-[#E11D48] text-white py-12 md:py-24 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <h1 
              className="text-4xl md:text-6xl font-black leading-tight mb-6 cursor-pointer select-none"
              onClick={handleSecretTap}
            >
              Your Personal Hotel Booking Assistant
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">Tell us your destination, travel dates and budget. We'll help you find suitable hotel options in the Philippines.</p>
            <a href="#search" className="inline-block bg-white text-[#E11D48] px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition w-full md:w-auto text-center">FIND MY HOTEL</a>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20 mt-4 lg:mt-0">
            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80" alt="Hotel" className="w-full h-64 md:h-96 object-cover" />
          </div>
        </div>
      </section>

      {/* ... The rest of your components (Partner Hotels, HowItWorks, Popular Destinations, Form, Footer) remain exactly the same ... */}

    </main>
  );
}