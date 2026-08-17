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

      {/* PARTNER HOTELS */}
      <section className="py-8 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider text-center mb-6">Featured Hotels</h3>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            {['reddoorz-logo', 'sans-hotel', 'urbanview-hotel', 'sunerra-hotels', 'koolkost'].map((logo, i) => (
              <div key={i} className="bg-[#F8FAFC] px-4 py-3 md:px-6 rounded-xl border border-[#E2E8F0] hover:border-[#E11D48] transition">
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
        <div className="container">
          <div className="search-container">
            <div className="search-header">
              <h2>Find your perfect stay</h2>
              <p>Fill in the details to get started</p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="search-form">
              <div className="form-group">
                <label htmlFor="destination">Where are you going?</label>
                <select id="destination" name="destination" className="form-select" required onChange={handleDestinationChange}>
                  <option value="" disabled selected>Select a destination</option>
                  {destinations.map((dest) => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
                {showOtherInput && (
                  <div className="other-wrapper" style={{ marginTop: '0.75rem' }}>
                    <label htmlFor="other-destination" className="other-label">Please specify your destination:</label>
                    <input ref={otherInputRef} type="text" id="other-destination" name="other-destination" className="form-input" placeholder="Type your destination here..." required />
                  </div>
                )}
              </div>

              <div className="form-group date-group">
                <label>When?</label>
                <div className="date-inputs">
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

              <div className="form-group">
                <label>Who's traveling?</label>
                <div className="guest-grid">
                  <div className="guest-field">
                    <label htmlFor="adults">Adults</label>
                    <input type="number" id="adults" name="adults" min="1" max="10" defaultValue="2" className="form-input" />
                  </div>
                  <div className="guest-field">
                    <label htmlFor="children">Children</label>
                    <input type="number" id="children" name="children" min="0" max="10" defaultValue="0" className="form-input" />
                  </div>
                  <div className="guest-field">
                    <label htmlFor="rooms">Rooms</label>
                    <input type="number" id="rooms" name="rooms" min="1" max="10" defaultValue="1" className="form-input" />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>What's the purpose of your stay?</label>
                <div className="button-group">
                  {purposes.map((purpose) => (
                    <button key={purpose.label} type="button" className={`option-btn purpose-btn ${selectedPurpose === purpose.label ? 'active' : ''}`} onClick={() => setSelectedPurpose(purpose.label)}>
                      <purpose.icon className="purpose-icon" size={16} strokeWidth={2} />
                      <span>{purpose.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>What's important?</label>
                <div className="button-group">
                  {priorities.map((priority) => (
                    <button key={priority} type="button" className={`option-btn ${selectedPriority === priority ? 'active' : ''}`} onClick={() => setSelectedPriority(priority)}>
                      {priority}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="budget">Budget?</label>
                <select id="budget" name="budget" className="form-select">
                  <option value="" disabled selected>Select your budget range</option>
                  {budgets.map((budget) => (
                    <option key={budget.value} value={budget.value}>{budget.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="special-request">Special request <span className="optional">(Optional)</span></label>
                <textarea id="special-request" name="special-request" className="form-textarea" rows={3} placeholder="Any specific hotel, location, or amenity you're looking for?"></textarea>
              </div>

              <div className="payment-badge">
                <CreditCard className="payment-icon" size={18} />
                <span>We book your room – You pay directly at the hotel</span>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '⏳ SENDING...' : <><Search className="btn-icon" size={20} /> FIND MY HOTEL</>}
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

    </main>
  );
}