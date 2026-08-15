import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import { ChevronDown, ChevronUp,} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuotationView() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [inquiry, setInquiry] = useState<any>(null);
  const [openFacilitiesId, setOpenFacilitiesId] = useState<string | null>(null);
  const [activeImages, setActiveImages] = useState<Record<string, string>>({});

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

    // 1. Sort by newest first
    const sortedData = qData ? qData.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) : [];

    // 2. Remove duplicate hotels (keep the first occurrence of each unique hotel)
    const seenNames = new Set();
    const uniqueData = sortedData.filter((item: any) => {
      const name = item.hotels?.name || '';
      if (seenNames.has(name)) return false;
      seenNames.add(name);
      return true;
    });

    // 3. Take only the first 3 unique options
    setQuotations(uniqueData.slice(0, 3));
  };

  const chooseHotel = async (quotationId: string) => {
    await supabase.from('quotations').update({ is_customer_chosen: true }).eq('id', quotationId);
    toast.success('Booking confirmed! We will process your reservation.', {
      duration: 4000,
      style: { background: '#10B981', color: '#ffffff', fontWeight: 'bold' },
      icon: '✅',
    });
  };

  if (!inquiry) return <div className="text-center py-20">Loading your quotation...</div>;

  const nights = getNights(inquiry.check_in, inquiry.check_out);
  const referenceId = `#STY-${String(inquiry.id).slice(-6).toUpperCase()}`;

  // Helper: Assign badges based on price ranking
  const getBadge = (index: number, total: number) => {
    if (total === 3 && index === 1) return { label: 'BEST VALUE', color: 'bg-yellow-500', text: 'Best balance of price and location.' };
    if (index === 0) return { label: 'BUDGET OPTION', color: 'bg-blue-500', text: 'The most affordable choice.' };
    return { label: 'PREMIUM OPTION', color: 'bg-purple-500', text: 'Top-tier comfort and amenities.' };
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 md:py-20">
      <div className="max-w-4xl mx-auto">
        
        {/* 🟢 BRANDED HEADER */}
        <div className="text-center mb-12 border-b border-[#E2E8F0] pb-8">
          <h1 className="text-4xl font-bold font-serif text-[#0F172A] tracking-tight">YOUR HOTEL QUOTATION</h1>
          <p className="text-lg text-[#0F172A] font-medium mt-2">{inquiry.destination}</p>
          <p className="text-md text-[#64748B] mt-1">
            {formatDateRange(inquiry.check_in, inquiry.check_out)} · {inquiry.adults} Adults · {inquiry.rooms} Room{inquiry.rooms > 1 && 's'}
          </p>
          <p className="text-sm text-[#64748B] mt-1">{quotations.length} suitable options found</p>
          <p className="text-xs font-mono text-[#94a3b8] mt-4 tracking-widest">
  {referenceId}
</p>
        </div>

        {/* 🟢 QUOTATION CARDS */}
        <div className="grid grid-cols-1 gap-10">
          {quotations.map((q: any, index: number) => {
            const badge = getBadge(index, quotations.length);
            const imageArray = q.hotels?.images ? q.hotels.images.split(',').map((url: string) => url.trim()) : [];
            const fallbackImage = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80';
            const currentActiveImage = activeImages[q.id] || (imageArray.length > 0 ? imageArray[0] : fallbackImage);
            const isOpen = openFacilitiesId === q.id;
            const totalPrice = q.total_price * nights;

            return (
              <div key={q.id} className="bg-white rounded-3xl shadow-lg border border-[#E2E8F0] overflow-hidden flex flex-col md:flex-row p-6 md:p-8 gap-6 relative">
                
                {/* 🟢 BADGE (Top Left) */}
                <div className={`absolute -top-3 left-6 ${badge.color} text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-sm z-10`}>
                  {badge.label}
                </div>

                {/* LEFT COLUMN: IMAGES */}
                <div className="w-full md:w-1/3 flex flex-col gap-2">
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100">
                    <img 
                      key={currentActiveImage}
                      src={currentActiveImage} 
                      alt={q.hotels?.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  {imageArray.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {imageArray.slice(1, 6).map((url: string, i: number) => (
                        <button 
                          key={i}
                          onClick={() => setActiveImages(prev => ({ ...prev, [q.id]: url }))}
                          className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                            currentActiveImage === url ? 'border-[#E11D48]' : 'border-transparent'
                          }`}
                        >
                          <img src={url} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: INFO */}
                <div className="w-full md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-bold font-serif text-[#0F172A]">{q.hotels?.name}</h2>
                      <div className="text-right">
                        <div className="text-[#E11D48] font-bold text-2xl font-serif">₱{q.total_price}<span className="text-sm font-normal text-[#475569]">/night</span></div>
                        <div className="text-[#475569] text-sm">₱{totalPrice.toLocaleString()} total</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-[#475569] mt-2 mb-3">{q.hotels?.room_type || 'Standard Room'}</p>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#475569] mb-4">
                      <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs">✓</span> Room only</div>
                      <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs">✓</span> Pay at hotel</div>
                      <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs">✓</span> Non-refundable</div>
                      <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs">✓</span> No breakfast</div>
                    </div>

                    {/* 🟢 WHY WE PICKED IT */}
                    <div className={`absolute -top-3 left-6 ${badge.color} text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-sm z-10 w-fit`}>
					{badge.label}
					</div>

                    {/* 🟢 FACILITIES */}
                    <div className="mb-4">
                      <button 
                        onClick={() => setOpenFacilitiesId(isOpen ? null : q.id)}
                        className="text-xs font-bold text-[#E11D48] uppercase tracking-wider hover:underline transition flex items-center gap-1"
                      >
                        {isOpen ? 'Hide' : 'View'} Facilities
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
                  </div>

                  {/* 🟢 SELECT BUTTON */}
                  <button 
                    onClick={() => chooseHotel(q.id)}
                    className="w-full bg-[#E11D48] text-white py-3 rounded-xl font-bold hover:bg-[#BE123C] transition shadow-md hover:shadow-lg mt-2"
                  >
                    Select This Option
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🟢 FOOTER / IMPORTANT INFO */}
        <div className="mt-16 pt-8 border-t border-[#E2E8F0] text-center text-sm text-[#64748B] max-w-2xl mx-auto">
          <p className="font-semibold uppercase tracking-wider text-xs mb-2">Important</p>
          <p>Rates and availability are subject to confirmation.</p>
          <p className="mt-1">Quotation valid until: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
          <p className="mt-4 text-[#E11D48] font-medium hover:underline cursor-pointer">Need help deciding? Chat with us</p>
        </div>
      </div>
    </main>
  );
}