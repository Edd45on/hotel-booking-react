import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
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

  // Math logic to figure out the badges
  const getBadge = (index: number, total: number) => {
    if (total === 3 && index === 1) {
      return { label: 'BEST VALUE', color: 'bg-yellow-400 text-[#0F172A]', text: 'Best balance of price and location.', bestFor: 'Families / value travelers' };
    }
    if (index === 0) {
      return { label: 'BUDGET OPTION', color: 'bg-blue-500 text-white', text: 'The most affordable choice.', bestFor: 'Budget-conscious travelers' };
    }
    return { label: 'PREMIUM OPTION', color: 'bg-purple-500 text-white', text: 'Top-tier comfort and amenities.', bestFor: 'Luxury & business travelers' };
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

        {/* QUOTATION CARDS - New Vertical Layout */}
        <div className="grid grid-cols-1 gap-8">
          {quotations.map((q: any, index: number) => {
            const badge = getBadge(index, quotations.length);
            const imageArray = q.hotels?.images ? q.hotels.images.split(',').map((url: string) => url.trim()) : [];
            const fallbackImage = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80';
            const currentActiveImage = activeImages[q.id] || (imageArray.length > 0 ? imageArray[0] : fallbackImage);
            const isOpen = openFacilitiesId === q.id;
            const totalPrice = q.total_price * nights;

            return (
              <div key={q.id} className="bg-white rounded-3xl shadow-lg border border-[#E2E8F0] overflow-hidden p-6 relative flex flex-col gap-5">
                
                {/* BADGE - Top Left */}
                <div className={`absolute top-4 left-4 ${badge.color} text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm z-10 flex items-center gap-1`}>
                  <Star size={12} className="fill-current" /> {badge.label}
                </div>

                {/* MAIN PHOTO */}
                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 w-full">
                  <img 
                    key={currentActiveImage}
                    src={currentActiveImage} 
                    alt={q.hotels?.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* THUMBNAILS (Stretching horizontally) */}
                {imageArray.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 -mt-2">
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

                {/* HOTEL NAME & PRICE */}
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

                {/* CHECKMARKS GRID */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-[#475569]">
                  <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs font-bold">✓</span> Room only</div>
                  <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs font-bold">✓</span> Pay at hotel</div>
                  <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs font-bold">✓</span> Non-refundable</div>
                  <div className="flex items-center gap-2"><span className="text-[#E11D48] text-xs font-bold">✓</span> No breakfast</div>
                </div>

                {/* WHY WE PICKED IT */}
                <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">Why we picked it</p>
                  <p className="text-sm text-[#0F172A]">{badge.text}</p>
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

                {/* SELECT BUTTON */}
                <button 
                  onClick={() => chooseHotel(q.id)}
                  className="w-full bg-[#E11D48] text-white py-3 rounded-xl font-bold hover:bg-[#BE123C] transition shadow-md hover:shadow-lg mt-1"
                >
                  Select This Option
                </button>
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
    </main>
  );
}