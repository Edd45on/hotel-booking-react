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

export default function SearchForm() {
  const [loading, setLoading] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [selectedPurpose, setSelectedPurpose] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);
  const otherInputRef = useRef<HTMLInputElement>(null);

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
      checkIn: formData.get('checkin'),
      checkOut: formData.get('checkout'),
      adults: formData.get('adults'),
      children: formData.get('children'),
      rooms: formData.get('rooms'),
      purpose: selectedPurpose || 'Not specified',
      priority: selectedPriority || 'Not specified',
      budget: formData.get('budget'),
      specialRequest: formData.get('special-request') || ''
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
    <section id="search" className="quick-search">
      <div className="container">
        <div className="search-container">
          <div className="search-header">
            <h2>Find your perfect stay</h2>
            <p>Fill in the details or choose a popular request to get started</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="search-form">
            
            {/* 1. WHERE ARE YOU GOING? */}
            <div className="form-group">
              <label htmlFor="destination">Where are you going?</label>
              <select 
                id="destination" 
                name="destination" 
                className="form-select" 
                required
                onChange={handleDestinationChange}
              >
                <option value="" disabled selected>Select a destination</option>
                {destinations.map((dest) => (
                  <option key={dest} value={dest}>{dest}</option>
                ))}
              </select>

              {showOtherInput && (
                <div className="other-wrapper" style={{ marginTop: '0.75rem' }}>
                  <label htmlFor="other-destination" className="other-label">
                    Please specify your destination:
                  </label>
                  <input
                    ref={otherInputRef}
                    type="text"
                    id="other-destination"
                    name="other-destination"
                    className="form-input"
                    placeholder="Type your destination here..."
                    required
                  />
                </div>
              )}
            </div>

            {/* 2. WHEN? */}
            <div className="form-group date-group">
              <label>When?</label>
              <div className="date-inputs">
                <div className="date-wrapper">
                  <span className="date-label">Check-in</span>
                  <input type="date" id="checkin" name="checkin" className="form-input" required />
                </div>
                <div className="date-wrapper">
                  <span className="date-label">Check-out</span>
                  <input type="date" id="checkout" name="checkout" className="form-input" required />
                </div>
              </div>
            </div>

            {/* 3. WHO'S TRAVELING? */}
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

            {/* 4. WHAT'S THE PURPOSE OF YOUR STAY? */}
            <div className="form-group">
              <label>What's the purpose of your stay?</label>
              <div className="button-group">
                {purposes.map((purpose) => (
                  <button
                    key={purpose.label}
                    type="button"
                    className={`option-btn purpose-btn ${selectedPurpose === purpose.label ? 'active' : ''}`}
                    onClick={() => setSelectedPurpose(purpose.label)}
                  >
                    <purpose.icon className="purpose-icon" size={16} strokeWidth={2} />
                    <span>{purpose.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. WHAT'S IMPORTANT? */}
            <div className="form-group">
              <label>What's important?</label>
              <div className="button-group">
                {priorities.map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    className={`option-btn ${selectedPriority === priority ? 'active' : ''}`}
                    onClick={() => setSelectedPriority(priority)}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. BUDGET? */}
            <div className="form-group">
              <label htmlFor="budget">Budget?</label>
              <select id="budget" name="budget" className="form-select">
                <option value="" disabled selected>Select your budget range</option>
                {budgets.map((budget) => (
                  <option key={budget.value} value={budget.value}>{budget.label}</option>
                ))}
              </select>
            </div>

            {/* 7. SPECIAL REQUEST */}
            <div className="form-group">
              <label htmlFor="special-request">Special request <span className="optional">(Optional)</span></label>
              <textarea
                id="special-request"
                name="special-request"
                className="form-textarea"
                rows={3}
                placeholder="Any specific hotel, location, or amenity you're looking for?"
              ></textarea>
            </div>

            {/* PAYMENT ASSURANCE BADGE */}
            <div className="payment-badge">
              <CreditCard className="payment-icon" size={18} />
              <span>We book your room – You pay directly at the hotel</span>
            </div>

            {/* SUBMIT */}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                '⏳ SENDING...'
              ) : (
                <>
                  <Search className="btn-icon" size={20} />
                  FIND MY HOTEL
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Embedded CSS from your Astro file */}
      <style>{`
        .quick-search { padding: 5rem 0; background: #F8FAFC; }
        .search-container { background: #ffffff; padding: 3rem; border-radius: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08); max-width: 800px; margin: 0 auto; }
        @media (max-width: 768px) { .search-container { padding: 2rem 1.5rem; } }
        .search-header { text-align: center; margin-bottom: 1.5rem; }
        .search-header h2 { font-size: 2rem; font-weight: 800; color: #0F172A; margin-bottom: 0.5rem; }
        .search-header p { color: #475569; font-size: 1.125rem; }

        .form-group { margin-bottom: 2rem; }
        .form-group label { display: block; font-weight: 600; color: #0F172A; margin-bottom: 0.75rem; font-size: 1rem; }
        .form-select { width: 100%; padding: 0.75rem 1rem; border: 2px solid #E2E8F0; border-radius: 12px; background: #ffffff; font-size: 1rem; color: #0F172A; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; transition: border-color 0.2s ease; cursor: pointer; }
        .form-select:focus { outline: none; border-color: #E11D48; box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1); }
        .other-wrapper { animation: fadeSlideIn 0.3s ease-out; }
        .other-label { display: block; font-size: 0.875rem; color: #64748b; font-weight: 500; margin-bottom: 0.5rem; }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .date-group { margin-bottom: 2rem; }
        .date-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 500px) { .date-inputs { grid-template-columns: 1fr; } }
        .date-wrapper { display: flex; flex-direction: column; gap: 0.25rem; }
        .date-label { font-size: 0.875rem; color: #64748b; font-weight: 500; }
        .form-input[type="date"] { width: 100%; padding: 0.75rem 1rem; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 1rem; color: #0F172A; transition: border-color 0.2s ease; cursor: pointer; }
        .form-input[type="date"]:focus { outline: none; border-color: #E11D48; box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1); }

        .form-input { width: 100%; padding: 0.75rem 1rem; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 1rem; color: #0F172A; transition: border-color 0.2s ease; }
        .form-input:focus { outline: none; border-color: #E11D48; box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1); }

        .guest-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        @media (max-width: 500px) { .guest-grid { grid-template-columns: 1fr 1fr; } }
        .guest-field { display: flex; flex-direction: column; gap: 0.25rem; }
        .guest-field label { font-size: 0.875rem; color: #64748b; font-weight: 500; margin-bottom: 0; }
        .form-input[type="number"] { width: 100%; padding: 0.75rem 1rem; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 1rem; color: #0F172A; transition: border-color 0.2s ease; }
        .form-input[type="number"]::-webkit-inner-spin-button, .form-input[type="number"]::-webkit-outer-spin-button { opacity: 1; }

        .button-group { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .option-btn { padding: 0.5rem 1.25rem; border: 2px solid #E2E8F0; background: #ffffff; border-radius: 50px; color: #475569; font-weight: 500; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease; }
        .option-btn:hover { border-color: #E11D48; color: #E11D48; background: #FFF1F2; }
        .option-btn.active { border-color: #E11D48; background: #E11D48; color: #ffffff; }
        .purpose-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; }
        .purpose-icon { color: #64748B; transition: color 0.2s ease; }
        .purpose-btn:hover .purpose-icon { color: #E11D48; }
        .purpose-btn.active .purpose-icon { color: #ffffff; }

        .optional { font-weight: 400; color: #94a3b8; font-size: 0.875rem; }
        .form-textarea { width: 100%; padding: 0.75rem 1rem; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 1rem; color: #0F172A; font-family: inherit; resize: vertical; transition: border-color 0.2s ease; }
        .form-textarea:focus { outline: none; border-color: #E11D48; box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.1); }

        .payment-badge { display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: #FFF1F2; border: 1px solid #FECDD3; color: #BE123C; padding: 0.75rem 1rem; border-radius: 12px; margin-top: 0.5rem; margin-bottom: 1rem; font-weight: 600; font-size: 0.95rem; }
        .payment-icon { display: inline-block; flex-shrink: 0; }

        .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem; width: 100%; background: #E11D48; color: #ffffff; padding: 1rem 2.5rem; border-radius: 12px; font-weight: 700; font-size: 1.125rem; border: none; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.3); margin-top: 0.5rem; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(225, 29, 72, 0.4); background: #BE123C; }
        .btn-primary:active { transform: translateY(0); }
        .btn-icon { display: inline-block; }
      `}</style>
    </section>
  );
}