import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import { ChevronDown, ChevronUp, Star, X, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuotationView() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [inquiry, setInquiry] = useState<any>(null);
  const [openFacilitiesId, setOpenFacilitiesId] = useState<string | null>(null);
  const [activeImages, setActiveImages] = useState<Record<string, string>>({});
  
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

    // 🟢 PERFECTLY FORMATTED SELECT QUERY
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
        hotel_name,
        image_url
      `)
      .eq('inquiry_id', inquiryId);
    
    if (error) console.error('Supabase Error:', error);

    const sortedData = qData ? qData.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) : [];

    setQuotations(sortedData.slice(0, 1)); // We only show 1 quotation now since we generate 1 per click
  };

  const openBookingModal = (quotationId: string) => {
    setSelectedQuotationId(quotationId);
  };

  const closeBookingModal = () => {
    setSelectedQuotationId(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
  };

  const confirmBooking = async () => {
    if (!firstName || !lastName || !email || !phone) {
      toast.error('Please fill in all fields to confirm your booking.');
      return;
    }

    if (!inquiry || !selectedQuotationId) return;

    try {
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

      const { error: quoteError } = await supabase
        .from('quotations')
        .update({ is_customer_chosen: true })
        .eq('id', selectedQuotationId);

      if (quoteError) throw quoteError;

      closeBookingModal();
      toast.success('Booking confirmed! We will process your reservation.', {
        duration: 5000,
        style: { background: '#10B981', color: '#ffffff', fontWeight: 'bold' },
        icon: '✅',
      });

      fetchQuotation(inquiry.id);
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  if (!inquiry) return <div className="text-center py-20">Loading your quotation...</div>;

  const nights = getNights(inquiry.check_in, inquiry.check_out);
  const referenceId = `#STY-${String(inquiry.id).slice(-6).toUpperCase()}`;

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 md:py-20">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-12 border-b border-[#E2E8F0] pb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-[#0F172A] tracking-tight mb-2">
            YOUR HOTEL QUOTATION
          </h1>
          <p className="text-lg md:text-xl text-[#0F172A] font-semibold mt-2 uppercase tracking-wide">
            {inquiry.destination}
          </p>
          <p className="text-md text-[#64748B] mt-1">
            {formatDateRange(inquiry.check_in, inquiry.check_out)} · {inquiry.adults} Adults · {inquiry.rooms} Room
          </p>
          <p className="text-sm text-[#64748B] mt-1">{quotations.length} options found</p>
          <p className="text-xs font-mono text-[#94a3b8] mt-4 tracking-widest">{referenceId}</p>
        </div>

        {/* QUOTATION CARDS */}
        <div className="grid grid-cols-1 gap-10 md:gap-12">
          {quotations.map((q: any) => {
            const imageArray = q.image_url ? [q.image_url] : [];
            const currentActiveImage = activeImages[q.id] || (imageArray.length > 0 ? imageArray[0] : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80');
            const isOpen = openFacilitiesId === q.id;
            const totalPrice = q.total_price * nights;

            const renderButton = () => {
              const isAnyCardChosen = quotations.some(item => item.is_customer_chosen === true);
              
              if (q.is_customer_chosen) {
                return (
                  <div className="w-full bg-green-100 border border-green-300 text-green-700 py-3 rounded-xl font-bold text-center mt-2 flex items-center justify-center gap-3">
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
                  <div className="w-full bg-[#E2E8F0] text-[#94a3b8] py-3 rounded-xl font-bold text-center mt-2 cursor-not-allowed">
                    Option Unavailable
                  </div>
                );
              } else {
                return (
                  <button 
                    onClick={() => openBookingModal(q.id)}
                    className="w-full bg-[#E11D48] text-white py-3 rounded-xl font-bold hover:bg-[#BE123C] transition shadow-md hover:shadow-lg mt-2"
                  >
                    SELECT THIS OPTION
                  </button>
                );
              }
            };

            return (
              <div key={q.id} className="bg-white rounded-3xl shadow-lg border border-[#E2E8F0] overflow-hidden p-6 md:p-8 relative flex flex-col gap-5">
                
                {/* IMAGE */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 w-full">
                  <img 
                    key={currentActiveImage}
                    src={currentActiveImage} 
                    alt={q.hotel_name} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* TITLE & PRICE */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mt-1">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#0F172A] leading-tight">
                      {q.hotel_name}
                    </h2>
                    <p className="text-sm text-[#64748B] mt-1">{q.room_type || 'Standard Room'}</p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="text-[#E11D48] font-bold text-2xl md:text-3xl font-serif">
                      ₱{q.total_price} <span className="text-sm font-normal text-[#64748B]">/ night</span>
                    </div>
                    <div className="text-[#64748B] text-sm">
                      ₱{totalPrice.toLocaleString()} total · {nights} nights
                    </div>
                  </div>
                </div>

                {/* CHECKMARKS */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#475569] mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#E11D48] text-xs font-bold">✓</span> 
                    <span className="text-sm">{q.custom_room_only && q.custom_room_only.trim() !== '' ? q.custom_room_only : 'Room only'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#E11D48] text-xs font-bold">✓</span> 
                    <span className="text-sm">{q.custom_pay_at_hotel && q.custom_pay_at_hotel.trim() !== '' ? q.custom_pay_at_hotel : 'Pay at hotel'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#E11D48] text-xs font-bold">✓</span> 
                    <span className="text-sm">{q.custom_non_refundable && q.custom_non_refundable.trim() !== '' ? q.custom_non_refundable : 'Non-refundable'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#E11D48] text-xs font-bold">✓</span> 
                    <span className="text-sm">{q.custom_no_breakfast && q.custom_no_breakfast.trim() !== '' ? q.custom_no_breakfast : 'No breakfast'}</span>
                  </div>
                </div>

                {/* WHY WE PICKED IT */}
                <div className="bg-[#F8FAFC] rounded-xl p-4 md:p-5 border border-[#E2E8F0] mt-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">Why we picked it</p>
                  <p className="text-[#0F172A] leading-relaxed">
                    {q.custom_description && q.custom_description.trim() !== '' ? q.custom_description : 'Best value for your budget.'}
                  </p>
                  <p className="text-xs text-[#64748B] mt-2">Best for: {q.custom_best_for || 'Couples / leisure'}</p>
                </div>

                {/* VIEW FACILITIES */}
                <div className="mt-1">
                  <button 
                    onClick={() => setOpenFacilitiesId(isOpen ? null : q.id)}
                    className="flex items-center gap-1 text-sm font-medium text-[#E11D48] hover:underline transition"
                  >
                    {isOpen ? 'HIDE' : 'VIEW'} Facilities
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {isOpen && (
                    <div className="mt-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <div className="flex flex-wrap gap-2">
                        {q.facilities ? q.facilities.split(',').map((fac: string, i: number) => (
                          <span key={i} className="px-3 py-1 bg-white border border-[#E2E8F0] rounded-full text-xs text-[#475569]">{fac.trim()}</span>
                        )) : (<p className="text-xs text-[#94a3b8]">No facilities listed</p>)}
                      </div>
                    </div>
                  )}
                </div>

                {renderButton()}
              </div>
            );
          })}
        </div>

        {/* CHAT WITH US & IMPORTANT SECTION */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="text-[#0F172A] font-medium text-lg mb-3">Need help choosing?</p>
            <button 
              onClick={() => alert('Chat feature coming soon!')}
              className="inline-flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] px-6 py-3 rounded-full font-semibold hover:bg-white hover:shadow-md transition"
            >
              <MessageCircle className="text-[#E11D48]" size={20} />
              Chat with us
            </button>
          </div>

          <div className="pt-8 border-t border-[#E2E8F0] text-sm text-[#64748B]">
            <p className="font-semibold uppercase tracking-wider text-xs mb-2">IMPORTANT</p>
            <p>Rates and availability are subject to change until booking confirmation.</p>
            <p className="mt-1">
              Quotation valid until: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} · 8:00 PM
            </p>
          </div>
        </div>
      </div>

      {/* CUSTOMER DETAILS MODAL */}
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