import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import { ChevronDown, ChevronUp, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuotationView() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [inquiry, setInquiry] = useState<any>(null);
  const [openFacilitiesId, setOpenFacilitiesId] = useState<string | null>(null);
  const [activeImages, setActiveImages] = useState<Record<string, string>>({});
  
  // 🟢 RESTORED: State for the Customer Booking Modal
  const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Helper: Format dates
  const formatDateRange = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr}–${endStr}`;
  };

  // Helper: Calculate number of nights
  const getNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inquiryId = params.get('id');
    if (inquiryId) fetchQuotation(inquiryId);
  }, []);

  const fetchQuotation = async (inquiryId: string) => {
    const { data: inqData } = await supabase.from('inquiries').select('*').eq('id', inquiryId).single();
    setInquiry(inqData);

    const { data: qData, error } = await supabase
      .from('quotations')
      .select(`
        id,
        total_price,
        is_customer_chosen,
        inquiry_id,
        created_at,
        facilities,
        custom_room_only,
        custom_pay_at_hotel,
        custom_non_refundable,
        custom_no_breakfast,
        custom_description,
        hotels (
          id,
          name,
          address,
          images,
          facilities,
          room_type
        )
      `)
      .eq('inquiry_id', inquiryId);
    
    if (error) console.error('Supabase Error:', error);

    const sortedData = qData ? qData.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) : [];

    const seenNames = new Set();
    const uniqueData = sortedData.filter((item: any) => {
      const name = item.hotels?.name || '';
      if (seenNames.has(name)) return false;
      seenNames.add(name);
      return true;
    });

    setQuotations(uniqueData.slice(0, 3));
  };

  // 🟢 RESTORED: Open Modal Logic
  const openBookingModal = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
  };

  // 🟢 RESTORED: Close Modal Logic
  const closeBookingModal = () => {
    setSelectedQuotationId(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
  };

  // 🟢 RESTORED: Final Confirmation Logic
  const confirmBooking = async () => {
    if (!firstName || !lastName || !email || !phone) {
      toast.error('Please fill in all fields to confirm your booking.');
      return;
    }

    if (!inquiry || !selectedQuotationId) return;

    try {
      // 1. Update inquiry with customer details
      const { error: updateError } = await supabase
        .from('inquiries')
        .update({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
        })
        .eq('id', inquiry.id);

      if (updateError) throw updateError;

      // 2. Mark the quotation as chosen
      const { error: quoteError } = await supabase
        .from('quotations')
        .update({ is_customer_chosen: true })
        .eq('id', selectedQuotationId);

      if (quoteError) throw quoteError;

      // 3. Close modal and show success
      closeBookingModal();
      toast.success('Booking confirmed! We will process your reservation.', {
        duration: 5000,
        style: { background: '#10B981', color: '#ffffff', fontWeight: 'bold' },
        icon: '✅',
      });

      // 4. Refresh data
      fetchQuotation(inquiry.id);

    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  if (!inquiry) return <div className="text-center py-20">Loading your quotation...</div>;

  const nights = getNights(inquiry.check_in, inquiry.check_out);
  const referenceId = `#STY-${String(inquiry.id).slice(-6).toUpperCase()}`;

  // 🟢 FIX: Badges assigned based on actual price, not array index
  const getBadgeByPrice = (price: number, allPrices: number[]) => {
    const sorted = [...allPrices].sort((a, b) => a - b); // Sort cheapest to most expensive
    
    if (price === sorted[0]) {
      return { label: 'BUDGET OPTION', color: 'bg-blue-500 text-white', text: 'The most affordable choice.', bestFor: 'Budget-conscious travelers' };
    }
    if (price === sorted[sorted.length - 1]) {
      return { label: 'PREMIUM OPTION', color: 'bg-purple-500 text-white', text: 'Top-tier comfort and amenities.', bestFor: 'Luxury & business travelers' };
    }
    // If there are 3 items, the middle one is Best Value
    return { label: 'BEST VALUE', color: 'bg-yellow-400 text-[#0F172A]', text: 'Best balance of price and location.', bestFor: 'Families / value travelers' };
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 md:py-20">
      <div className="max-w-4xl mx-auto">
        
        {/* BRANDED HEADER */}
        <div className="text-center mb-10 border-b border-[#E2E8F0] pb-8">
          <h1 className="text-4xl font-bold font-serif text-[#0F172A] tracking-tight">YOUR HOTEL QUOTATION</h1>
          <p className="text-lg text-[#0F172A] font-medium mt-2">{inquiry.destination}</p>
          <p className="text-md text-[#64748B] mt-1">
            {formatDateRange(inquiry.check_in, inquiry.check_out)} · {inquiry.adults} Adults
          </p>
          <p className="text-sm text-[#64748B] mt-1">{quotations.length} suitable options found</p>
          <p className="text-xs font-mono text-[#94a3b8] mt-4 tracking-widest">{referenceId}</p>
        </div>

        {/* QUOTATION CARDS */}
        <div className="grid grid-cols-1 gap-8">
          {quotations.map((q: any) => {
            const badge = getBadgeByPrice(q.total_price, allPrices);
            const imageArray = q.hotels?.images ? q.hotels.images.split(',').map((url: string) => url.trim()) : [];
            const fallbackImage = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80';
            const currentActiveImage = activeImages[q.id] || (imageArray.length > 0 ? imageArray[0] : fallbackImage);
            const isOpen = openFacilitiesId === q.id;
            const totalPrice = q.total_price * nights;

            // 🟢 EXTRACTED BUTTON LOGIC (Fixes the TS error)
            const renderButton = () => {
              const isAnyCardChosen = quotations.some(item => item.is_customer_chosen === true);
              
              if (q.is_customer_chosen) {
                return (
                  <div className="w-full bg-green-100 border border-green-300 text-green-700 py-3 rounded-xl font-bold text-center mt-1 flex items-center justify-center gap-3">
                    <span>✅ Booking Confirmed</span>
                    <button 
                      onClick={() => {
                        supabase.from('quotations').update({ is_customer_chosen: false }).eq('id', q.id)
                          .then(() => fetchQuotation(inquiry.id));
                      }}
                      className="text-xs bg-white border border-green-300 text-green-700 px-3 py-1 rounded-full hover:bg-green-50 transition"
                    >
                      Change
                    </button>
                  </div>
                );
              } else if (isAnyCardChosen) {
                return (
                  <div className="w-full bg-[#E2E8F0] text-[#94a3b8] py-3 rounded-xl font-bold text-center mt-1 cursor-not-allowed">
                    Option Unavailable
                  </div>
                );
              } else {
                return (
                  <button 
                    onClick={() => openBookingModal(q.id)}
                    className="w-full bg-[#E11D48] text-white py-3 rounded-xl font-bold hover:bg-[#BE123C] transition shadow-md hover:shadow-lg mt-1"
                  >
                    Select This Option
                  </button>
                );
              }
            };

            return (
              <div key={q.id} className="bg-white rounded-3xl shadow-lg border border-[#E2E8F0] overflow-hidden p-6 relative flex flex-col gap-5">
                {/* ... rest of your card JSX stays exactly the same ... */}

                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold font-serif text-[#0F172A]">{q.hotels?.name}</h2>
                    <p className="text-sm text-[#475569]">{q.hotels?.room_type || 'Standard Room'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[#E11D48] font-bold text-xl font-serif">₱{q.total_price}<span className="text-sm font-normal text-[#475569]">/night</span></div>
                    <div className="text-[#475569] text-sm">₱{totalPrice.toLocaleString()} total <span className="text-[#94a3b8]">· {nights} nights</span></div>
                  </div>
                </div>

                {/* DYNAMIC CHECKMARKS */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#475569]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#E11D48] text-xs font-bold">✓</span> 
                    <span>{q.custom_room_only && q.custom_room_only.trim() !== '' ? q.custom_room_only : 'Room only'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#E11D48] text-xs font-bold">✓</span> 
                    <span>{q.custom_pay_at_hotel && q.custom_pay_at_hotel.trim() !== '' ? q.custom_pay_at_hotel : 'Pay at hotel'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#E11D48] text-xs font-bold">✓</span> 
                    <span>{q.custom_non_refundable && q.custom_non_refundable.trim() !== '' ? q.custom_non_refundable : 'Non-refundable'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#E11D48] text-xs font-bold">✓</span> 
                    <span>{q.custom_no_breakfast && q.custom_no_breakfast.trim() !== '' ? q.custom_no_breakfast : 'No breakfast'}</span>
                  </div>
                </div>

                {/* WHY WE PICKED IT */}
                <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">Why we picked it</p>
                  <p className="text-sm text-[#0F172A]">
                    {q.custom_description && q.custom_description.trim() !== '' ? q.custom_description : badge.text}
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">Best for: {badge.bestFor}</p>
                </div>

                {/* VIEW FACILITIES TOGGLE */}
                <div className="mb-1">
                  <button 
                    onClick={() => setOpenFacilitiesId(isOpen ? null : q.id)}
                    className="text-xs font-bold text-[#E11D48] uppercase tracking-wider hover:underline transition flex items-center gap-1"
                  >
                    {isOpen ? 'HIDE' : 'VIEW'} Facilities
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {isOpen && (
                    <div className="mt-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <div className="flex flex-wrap gap-2">
                        {q.hotels?.facilities ? q.hotels.facilities.split(',').map((fac: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-white border border-[#E2E8F0] rounded-full text-xs text-[#475569]">{fac.trim()}</span>
                        )) : (<p className="text-xs text-[#94a3b8]">No facilities listed</p>)}
                      </div>
                    </div>
                  )}
                </div>

                {/* 🟢 LOGIC: CHECK IF ANY ROOM IS ALREADY CHOSEN */}
                {(() => {
                  // Check if ANY of the 3 cards is confirmed
                  const isAnyCardChosen = quotations.some(item => item.is_customer_chosen === true);
                  
                  // If THIS card is the chosen one
                  if (q.is_customer_chosen) {
                    return (
                      <div className="w-full bg-green-100 border border-green-300 text-green-700 py-3 rounded-xl font-bold text-center mt-1 flex items-center justify-center gap-3">
                        <span>✅ Booking Confirmed</span>
                        <button 
                          onClick={() => {
                            // Cancel this selection so they can pick again
                            supabase.from('quotations').update({ is_customer_chosen: false }).eq('id', q.id)
                              .then(() => fetchQuotation(inquiry.id));
                          }}
                          className="text-xs bg-white border border-green-300 text-green-700 px-3 py-1 rounded-full hover:bg-green-50 transition"
                        >
                          Change
                        </button>
                      </div>
                    );
                  } 
                  
                  // If a DIFFERENT card is chosen, DISABLE this one
                  else if (isAnyCardChosen) {
                    return (
                      <div className="w-full bg-[#E2E8F0] text-[#94a3b8] py-3 rounded-xl font-bold text-center mt-1 cursor-not-allowed">
                        Option Unavailable
                      </div>
                    );
                  }
                  
                  // If NO card is chosen yet, show the active red button
                  else {
                    return (
                      <button 
                        onClick={() => openBookingModal(q.id)}
                        className="w-full bg-[#E11D48] text-white py-3 rounded-xl font-bold hover:bg-[#BE123C] transition shadow-md hover:shadow-lg mt-1"
                      >
                        Select This Option
                      </button>
                    );
                  }
                })()}
                )}
              </div>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="mt-16 pt-8 border-t border-[#E2E8F0] text-center text-sm text-[#64748B] max-w-2xl mx-auto">
          <p className="font-semibold uppercase tracking-wider text-xs mb-2">Important</p>
          <p>Rates and availability are subject to confirmation.</p>
          <p className="mt-1">Quotation valid until: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          <p className="mt-4 text-[#E11D48] font-medium hover:underline cursor-pointer">Need help deciding? Chat with us</p>
        </div>
      </div>

      {/* 🟢 CUSTOMER DETAILS MODAL (Restored!) */}
      {selectedQuotationId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
            
            <button 
              onClick={closeBookingModal}
              className="absolute top-4 right-4 text-[#475569] hover:text-[#0F172A] transition"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold font-serif text-[#0F172A] mb-1">Confirm Your Booking</h2>
            <p className="text-sm text-[#64748B] mb-4">Please enter your details to finalize your room selection.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#E11D48] transition"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#E11D48] transition"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#E11D48] transition"
                  placeholder="john.doe@email.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#E11D48] transition"
                  placeholder="+63 912 345 6789"
                />
              </div>

              <button 
                onClick={confirmBooking}
                className="w-full bg-[#E11D48] text-white py-3 rounded-xl font-bold hover:bg-[#BE123C] transition mt-2 shadow-md"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}