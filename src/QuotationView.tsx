import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuotationView() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [inquiry, setInquiry] = useState<any>(null);
  const [openFacilitiesId, setOpenFacilitiesId] = useState<string | null>(null);
  const [activeImages, setActiveImages] = useState<Record<string, string>>({});
  
  // 🟢 State for the Booking Modal
  const [bookingHotelId, setBookingHotelId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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

    // 🟢 Sort in JavaScript (prevents Supabase alias 400 errors)
    const sortedData = qData ? qData.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) : [];

    setQuotations(sortedData.slice(0, 3));
  };

  // 🟢 Handle opening the modal
  const openBookingModal = (quotationId: string) => {
    setBookingHotelId(quotationId);
  };

  // 🟢 Handle finalizing the booking
  const confirmBooking = async () => {
    if (!firstName || !lastName || !email || !phone) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (!inquiry || !bookingHotelId) return;

    try {
      // 1. Update the inquiry with the customer's personal details
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
        .eq('id', bookingHotelId);

      if (quoteError) throw quoteError;

      // 3. Close modal and show success
      setBookingHotelId(null);
      toast.success('Booking confirmed! We will process your reservation.', {
        duration: 5000,
        style: { background: '#10B981', color: '#ffffff', fontWeight: 'bold' },
        icon: '✅',
      });

      // Refresh data to show the "Booked" state
      fetchQuotation(inquiry.id);

    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  if (!inquiry) return <div className="text-center py-20">Loading your quotation...</div>;

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0F172A] text-center mb-2">Your Hotel Quotation</h1>
        <p className="text-center text-[#475569] mb-12">
          {inquiry.destination} · {inquiry.adults} Adults · {inquiry.rooms} Room(s)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quotations.map((q: any) => {
            const isOpen = openFacilitiesId === q.id;
            const imageArray = q.hotels?.images ? q.hotels.images.split(',').map((url: string) => url.trim()) : [];
            const fallbackImage = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80';
            const currentActiveImage = activeImages[q.id] || (imageArray.length > 0 ? imageArray[0] : fallbackImage);

            return (
              <div key={q.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#E2E8F0] flex flex-col h-full">
                
                {/* Image Gallery */}
                <div className="relative flex h-52 w-full border-b border-[#E2E8F0]">
                  <div className="flex-1 h-full relative">
                    <img key={currentActiveImage} src={currentActiveImage} alt={q.hotels?.name} className="w-full h-full object-cover" />
                  </div>
                  {imageArray.length > 1 && (
                    <div className="w-20 h-full bg-black/5 flex flex-col gap-1.5 p-1.5 overflow-hidden">
                      {imageArray.slice(1, 6).map((url: string, i: number) => (
                        <button 
                          key={i}
                          onClick={() => setActiveImages(prev => ({ ...prev, [q.id]: url }))}
                          className={`flex-1 w-full rounded-md overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                            currentActiveImage === url ? 'border-[#E11D48]' : 'border-transparent'
                          }`}
                        >
                          <img src={url} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold font-serif text-[#0F172A] leading-tight pr-4">
                      {q.hotels?.name}
                    </h3>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-[#E11D48] font-bold text-xl font-serif">₱{q.total_price}</span>
                      <span className="text-[#94a3b8] text-[10px] uppercase tracking-widest font-semibold">Per Night</span>
                    </div>
                  </div>

                  {q.hotels?.room_type && (
					<p className="text-sm font-semibold text-[#0F172A] tracking-wide text-[#475569]/70 mb-2">
					{q.hotels.room_type}
					</p>
)}

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#475569] mb-4">
                    <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs">✦</span> Room Only</div>
                    <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs">✦</span> Pay at Hotel</div>
                    <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs">✦</span> Non-Refundable</div>
                    <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs">✦</span> No Breakfast</div>
                  </div>

                  <p className="text-xs text-[#94a3b8] leading-relaxed mb-4 line-clamp-2">
                    {q.hotels?.address || 'No address listed'}
                  </p>

                  <div className="mb-4">
                    <button onClick={() => setOpenFacilitiesId(isOpen ? null : q.id)} className="flex items-center gap-2 text-xs font-bold text-[#E11D48] uppercase tracking-wider hover:underline transition">
                      {isOpen ? 'Hide' : 'View'} Facilities {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {isOpen && (
                      <div className="mt-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <div className="flex flex-wrap gap-2">
                          {q.hotels?.facilities ? q.hotels.facilities.split(',').map((fac: string, i: number) => (
                            <span key={i} className="inline-block px-3 py-1 bg-white border border-[#E2E8F0] rounded-full text-[10px] font-medium text-[#475569]">{fac.trim()}</span>
                          )) : (<p className="text-xs text-[#94a3b8]">No facilities listed</p>)}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => openBookingModal(q.id)}
                    className="w-full bg-[#E11D48] text-white py-3 rounded-xl font-bold hover:bg-[#BE123C] transition mt-auto shadow-md hover:shadow-lg"
                  >
                    Book This Room
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🟢 CLIENT DETAILS MODAL */}
      {bookingHotelId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
            
            {/* Close Button */}
            <button 
              onClick={() => setBookingHotelId(null)}
              className="absolute top-4 right-4 text-[#475569] hover:text-[#0F172A] transition"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Confirm Your Booking</h2>
            <p className="text-sm text-[#64748B] mb-4">Please enter your details to finalize your reservation.</p>

            {/* Form Fields */}
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