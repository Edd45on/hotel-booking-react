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
  Home,
  Tag,
  Bed,
  UserCircle,
  MessageCircle,
  ShieldCheck,
  MapPin,
  ThumbsUp,
  Plane as PlaneIcon,
} from 'lucide-react';

import HowItWorks from './HowItWorks';
import TrustSection from './TrustSection';
import FAQ from './FAQ';
import DatePickerInput from './components/DatePickerInput';

// ------------------ DATA ------------------
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

// ------------------ MAIN APP ------------------
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

  // 🟢 SECRET TAP SHORTCUT
  const [tapCount, setTapCount] = useState(0);
  const handleSecretTap = () => {
    setTapCount(prev => prev + 1);
    if (tapCount + 1 >= 5) {
      setTapCount(0);
      window.location.href = '/admin';
    }
    setTimeout(() => setTapCount(0), 2000);
  };

  // Destinations R2 URLs
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

  // 🟢 SVG SOCIAL ICONS (No dependency needed)
  const FacebookSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
  const InstagramSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
  const YoutubeSvg = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 12a1.5 1.5 0 0 1 1.5-1.5h16a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5v-6z" />
      <path d="M10 7l6 3-6 3V7z" />
    </svg>
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] font-sans">

      {/* 🟢 CLEAN & SIMPLE HERO */}
      <section className="bg-white text-[#0F172A] py-12 md:py-20 px-4 border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* LEFT COLUMN: BRANDING */}
          <div className="flex flex-col gap-5">
            {/* Logo */}
            <div className="w-48 mx-auto md:mx-0 mb-2">
              <img src="/reddoorzuki-logo.png" alt="RedDoorzuki PH Logo" className="w-full h-auto object-contain" />
            </div>

            {/* Headlines */}
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-semibold text-[#64748B] uppercase tracking-wider">
                Hotel Booking Made Easy
              </h2>
              <p className="text-4xl md:text-6xl font-black text-[#0F172A] leading-[1.1] md:leading-tight">
                ACROSS THE<br />
                PHILIPPINES
              </p>
            </div>

            {/* Benefit Icons Strip (White with Red Icons) */}
            <div className="flex flex-wrap gap-6 md:gap-10 mt-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-full shadow-sm">
                  <Tag size={24} className="text-[#E11D48]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#0F172A]">SMART RATES</p>
                  <p className="text-[10px] text-[#64748B]">Best value for every trip</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-full">
                  <Bed size={24} className="text-[#E11D48]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#0F172A]">GREAT STAYS</p>
                  <p className="text-[10px] text-[#64748B]">Quality hotels you can trust</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-full">
                  <UserCircle size={24} className="text-[#E11D48]" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#0F172A]">PERSONAL ASSISTANCE</p>
                  <p className="text-[10px] text-[#64748B]">We're here to help you</p>
                </div>
              </div>
            </div>

            {/* Red CTA Bar */}
            <div className="mt-2 bg-[#E11D48] text-white p-5 md:p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Tell us your destination & dates</p>
                  <p className="text-xs font-bold uppercase tracking-wider">We'll find your best options!</p>
                </div>
              </div>
              <a 
                href="#search" 
                className="bg-white text-[#E11D48] px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 whitespace-nowrap"
              >
                Find My Hotel →
              </a>
            </div>
          </div>

          {/* RIGHT COLUMN: IMAGE + BADGE */}
          <div className="relative flex justify-center lg:justify-end mt-8 md:mt-0">
            {/* Room Image */}
            <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-xl border border-[#E2E8F0]">
              <img 
                src="/hero-room.png" 
                alt="Hotel Room Preview" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
            </div>

            {/* Floating Trusted Partner Badge */}
            <div className="absolute -right-2 md:-right-6 top-1/2 -translate-y-1/2 bg-white border-2 border-[#E11D48] rounded-full w-28 h-28 md:w-32 md:h-32 flex flex-col items-center justify-center shadow-xl text-center p-2 z-10">
              <div className="flex flex-col items-center">
                <div className="flex gap-1 text-[#E11D48] text-[10px]"><span>★</span><span>★</span><span>★</span></div>
                <p className="text-[10px] font-bold text-[#0F172A] leading-tight mt-1">TRUSTED</p>
                <p className="text-[10px] font-bold text-[#E11D48] leading-tight">REDDOORZ</p>
                <p className="text-[10px] font-bold text-[#0F172A] leading-tight">PARTNER</p>
                <div className="flex gap-1 text-[#E11D48] text-[10px] mt-1"><span>★</span><span>★</span><span>★</span></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PARTNER HOTELS */}
      <section className="py-8 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider text-center mb-6">Featured Hotels</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 max-w-xl md:max-w-4xl mx-auto">
            {['reddoorz-logo', 'sans-hotel', 'urbanview-hotel', 'sunerra-hotels', 'koolkost'].map((logo, i) => (
              <div key={i} className="bg-[#F8FAFC] px-4 py-4 md:px-6 rounded-xl border border-[#E2E8F0] hover:border-[#E11D48] transition flex items-center justify-center">
                <img src={`https://pub-520fe91b713446edb95e193ae19ef26f.r2.dev/images/${logo}.png`} alt={logo} className="h-6 md:h-8 object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* POPULAR DESTINATIONS */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-[#0F172A] text-center mb-4">Where to next?</h2>
          <p className="text-center text-[#475569] mb-12">Pick a destination to get started</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {destinationsR2.map((city) => (
              <a
                key={city.name}
                href={'#search?destination=' + city.name}
                className="block relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer border border-[#E2E8F0] bg-slate-200"
              >
                <img
                  src={city.image}
                  alt={city.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold text-lg">{city.name}</h3>
                  <p className="text-xs opacity-80">{city.region}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR REQUESTS */}
      <section className="pb-20 bg-[#F8FAFC] px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-6 text-center">Popular Requests</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Near NAIA', icon: Plane },
              { label: 'Business hotel', icon: Briefcase },
              { label: 'Family stay', icon: Users },
              { label: 'Couple getaway', icon: Heart },
              { label: 'Staycation', icon: Sun },
            ].map((req) => (
              <div key={req.label} className="bg-white px-4 py-6 md:px-8 rounded-2xl border border-[#E2E8F0] flex flex-col items-center justify-center gap-3 hover:border-[#E11D48] transition cursor-pointer">
                <div className="w-12 h-12 bg-[#FFF1F2] text-[#E11D48] rounded-xl flex items-center justify-center">
                  <req.icon size={24} />
                </div>
                <span className="text-xs md:text-sm font-semibold text-[#0F172A] text-center">{req.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DATE PICKER FORM */}
      <section id="search" className="py-12 md:py-20 bg-[#F8FAFC] px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-[#E2E8F0]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#0F172A]">Find your perfect stay</h2>
              <p className="text-[#475569] mt-2">Fill in the details to get started</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="destination" className="block font-semibold text-[#0F172A] text-sm">Where are you going?</label>
                <select id="destination" name="destination" className="w-full p-3 border border-[#E2E8F0] rounded-xl bg-white text-sm focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] outline-none" required onChange={handleDestinationChange}>
                  <option value="" disabled selected>Select a destination</option>
                  {destinations.map((dest) => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
                {showOtherInput && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label htmlFor="other-destination" className="block text-sm font-medium text-[#64748B] mb-1">Please specify your destination:</label>
                    <input ref={otherInputRef} type="text" id="other-destination" name="other-destination" className="w-full p-3 border border-[#E2E8F0] rounded-xl bg-white text-sm focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] outline-none" placeholder="Type your destination here..." required />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-[#0F172A] text-sm">When?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DatePickerInput
                    label="Check-in"
                    selected={checkInDate}
                    onChange={(date) => {
                      setCheckInDate(date);
                      if (checkOutDate && date && checkOutDate <= date) {
                        setCheckOutDate(null);
                      }
                      setDateError(null);
                    }}
                    minDate={new Date()}
                    placeholder="Pick check-in date"
                  />
                  <DatePickerInput
                    label="Check-out"
                    selected={checkOutDate}
                    onChange={(date) => {
                      setCheckOutDate(date);
                      setDateError(null);
                    }}
                    minDate={checkInDate || new Date()}
                    placeholder="Pick check-out date"
                  />
                </div>
                {dateError && (
                  <p className="mt-2 text-sm font-medium text-[#E11D48] animate-in fade-in slide-in-from-top-2 duration-200">
                    {dateError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-[#0F172A] text-sm">Who's traveling?</label>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="adults" className="block text-xs text-[#64748B] font-medium">Adults</label>
                    <input type="number" id="adults" name="adults" min="1" max="10" defaultValue="2" className="w-full p-3 border border-[#E2E8F0] rounded-xl bg-white text-sm focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="children" className="block text-xs text-[#64748B] font-medium">Children</label>
                    <input type="number" id="children" name="children" min="0" max="10" defaultValue="0" className="w-full p-3 border border-[#E2E8F0] rounded-xl bg-white text-sm focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="rooms" className="block text-xs text-[#64748B] font-medium">Rooms</label>
                    <input type="number" id="rooms" name="rooms" min="1" max="10" defaultValue="1" className="w-full p-3 border border-[#E2E8F0] rounded-xl bg-white text-sm focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-[#0F172A] text-sm">What's the purpose of your stay?</label>
                <div className="flex flex-wrap gap-2">
                  {purposes.map((purpose) => (
                    <button key={purpose.label} type="button" className={`flex items-center gap-2 px-4 py-2 border-2 rounded-full text-sm font-medium transition-all ${selectedPurpose === purpose.label ? 'border-[#E11D48] bg-[#FFF1F2] text-[#E11D48]' : 'border-[#E2E8F0] hover:border-[#E11D48] text-[#475569]'}`} onClick={() => setSelectedPurpose(purpose.label)}>
                      <purpose.icon size={16} />
                      <span>{purpose.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-[#0F172A] text-sm">What's important?</label>
                <div className="flex flex-wrap gap-2">
                  {priorities.map((priority) => (
                    <button key={priority} type="button" className={`px-4 py-2 border-2 rounded-full text-sm font-medium transition-all ${selectedPriority === priority ? 'border-[#E11D48] bg-[#FFF1F2] text-[#E11D48]' : 'border-[#E2E8F0] hover:border-[#E11D48] text-[#475569]'}`} onClick={() => setSelectedPriority(priority)}>
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="budget" className="block font-semibold text-[#0F172A] text-sm">Budget?</label>
                <select id="budget" name="budget" className="w-full p-3 border border-[#E2E8F0] rounded-xl bg-white text-sm focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] outline-none">
                  <option value="" disabled selected>Select your budget range</option>
                  {budgets.map((budget) => (
                    <option key={budget.value} value={budget.value}>{budget.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="special-request" className="block font-semibold text-[#0F172A] text-sm">Special request <span className="font-normal text-[#94a3b8] text-xs">(Optional)</span></label>
                <textarea id="special-request" name="special-request" className="w-full p-3 border border-[#E2E8F0] rounded-xl bg-white text-sm focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48] outline-none resize-y" rows={3} placeholder="Any specific hotel, location, or amenity you're looking for?"></textarea>
              </div>

              <div className="bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] p-3 rounded-xl text-center font-medium text-sm flex justify-center items-center gap-2">
                <CreditCard size={18} />
                <span>We book your room – You pay directly at the hotel</span>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#E11D48] text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-[#BE123C] hover:shadow-lg transition disabled:opacity-70 flex justify-center items-center gap-2">
                {loading ? '⏳ SENDING...' : <><Search size={20} /> FIND MY HOTEL</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      <TrustSection />
      <FAQ />

      {/* FINAL CTA */}
      <section className="bg-[#0F172A] text-white py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to find your hotel?</h2>
          <p className="text-[#94a3b8] mb-8">Tell us your destination, dates and budget.</p>
          <a href="#search" className="inline-block bg-[#E11D48] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#BE123C] transition">
            FIND MY HOTEL
          </a>
          
          {/* HIDDEN ADMIN LINK */}
          <a 
            href="/admin" 
            className="block mt-8 text-[#475569] text-xs hover:text-[#94a3b8] transition"
          >
            Admin
          </a>
        </div>
      </section>
            {/* 🟢 SOCIAL MEDIA FOOTER */}
      <section className="bg-[#F8FAFC] border-t border-[#E2E8F0] py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#64748B]">
            © {new Date().getFullYear()} RedDoorzuki PH. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
                        <a 
              href="https://www.facebook.com/profile.php?id=61593648383338" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#E11D48] hover:border-[#E11D48] transition group"
              aria-label="Facebook"
            >
              <FacebookSvg className="w-5 h-5 text-[#64748B] group-hover:text-white transition" />
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#E11D48] hover:border-[#E11D48] transition group"
              aria-label="Instagram"
            >
              <InstagramSvg className="w-5 h-5 text-[#64748B] group-hover:text-white transition" />
            </a>
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center hover:bg-[#E11D48] hover:border-[#E11D48] transition group"
              aria-label="YouTube"
            >
              <YoutubeSvg className="w-5 h-5 text-[#64748B] group-hover:text-white transition" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}