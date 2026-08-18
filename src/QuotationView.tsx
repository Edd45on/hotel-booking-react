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

  const [timeLeft, setTimeLeft] = useState<Record<string, string>>({});

  // Helper: Format dates
  const formatDateRange = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const startStr = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} – ${endStr}`;
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
        new_price,
        is_customer_chosen,
        is_admin_confirmed,
        is_redseller_booked,
        inquiry_id,
        created_at,
        facilities,
        custom_room_only,
        custom_pay_at_hotel,
        custom_non_refundable,
        custom_no_breakfast,
        custom_description,
        hotel_name,
        image_url,
        valid_until,
        address,
        room_type,
        hotels ( price_per_night )
      `)
      .eq('inquiry_id', inquiryId);
    
    if (error) console.error('Supabase Error:', error);

    setQuotations(qData ? qData.slice(0, 3) : []);
  };

  // 🟢 LIVE COUNTDOWN TIMER
  useEffect(() => {
    if (!quotations || quotations.length === 0) return;

    const updateTimer = () => {
      const now = new Date();
      const newTimeLeft: Record<string, string> = {};

      quotations.forEach((q) => {
        if (q.valid_until) {
          const expiry = new Date(q.valid_until);
          const diff = expiry.getTime() - now.getTime();

          if (diff <= 0) {
            newTimeLeft[q.id] = 'Expired';
          } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            newTimeLeft[q.id] = hours + 'h ' + minutes + 'm ' + seconds + 's';
          }
        }
      });

      setTimeLeft(newTimeLeft);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [quotations]);

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
      toast.success('OPTION SELECTED! Checking latest availability...', {
        duration: 3000,
        style: { background: '#10B981', color: '#ffffff', fontWeight: 'bold' },
        icon: '⏳',
      });

      fetchQuotation(inquiry.id);
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  if (!inquiry) return <div className="text-center py-20">Loading your quotation...</div>;

  const nights = getNights(inquiry.check_in, inquiry.check_out);
  const referenceId = `#STY-${String(inquiry.id).slice(-6).toUpperCase()}`;

  const getBadgeByPrice = (price: number, allPrices: number[], purpose: string) => {
    const sorted = [...allPrices].sort((a, b) => a - b);
    const lowestPrice = sorted[0];
    const highestPrice = sorted[sorted.length - 1];
    const midPrice = sorted.length > 2 ? sorted[1] : lowestPrice;

    if (price >= highestPrice && (highestPrice - midPrice) > 500) {
      return { label: 'PREMIUM OPTION', color: 'bg-purple-500 text-white', icon: '💎', description: 'A more elevated stay with added comfort and convenience.', bestFor: 'Travelers who prefer a more comfortable experience.' };
    }
    if (purpose?.toLowerCase().includes('airport') || purpose?.toLowerCase().includes('flight')) {
      return { label: 'NEAR DESTINATION', color: 'bg-sky-500 text-white', icon: '✈️', description: 'Conveniently located near the area you requested, so you can spend less time traveling.', bestFor: 'Travelers who prioritize location.' };
    }
    if (purpose?.toLowerCase().includes('family')) {
      return { label: 'FAMILY PICK', color: 'bg-emerald-500 text-white', icon: '👨‍👩‍👧‍👦', description: 'A practical choice designed around a more comfortable family stay.', bestFor: 'Families traveling together.' };
    }
    if (purpose?.toLowerCase().includes('business')) {
      return { label: 'BUSINESS PICK', color: 'bg-indigo-500 text-white', icon: '💼', description: 'A convenient choice for work trips where location and a hassle-free stay matter.', bestFor: 'Business travelers.' };
    }
    if (price === lowestPrice) {
      return { label: 'BUDGET OPTION', color: 'bg-blue-500 text-white', icon: '💰', description: 'One of the most affordable suitable options within your budget.', bestFor: 'Budget-conscious travelers.' };
    }
    if (price === midPrice) {
      return { label: 'BEST VALUE', color: 'bg-yellow-400 text-[#0F172A]', icon: '⭐', description: 'A smart balance of price, location, and comfort.', bestFor: 'Travelers looking for great value.' };
    }
    return { label: 'POPULAR CHOICE', color: 'bg-rose-500 text-white', icon: '🔥', description: 'A well-liked option with a dependable mix of comfort, location, and value.', bestFor: 'Travelers who prefer a popular choice.' };
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-12 px-4 md:py-20">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="text-center mb-12 border-b border-[#E2E8F0] pb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-medium text-[#0F172A] tracking-tight mb-2">
            YOUR HOTEL QUOTATION
          </h1>
          <p className="text-lg md:text-xl text-[#0F172A] font-semibold mt-2 uppercase tracking-wide">
            {inquiry.destination}, Philippines
          </p>
          <p className="text-md text-[#64748B] mt-1">
            {formatDateRange(inquiry.check_in, inquiry.check_out)} · {inquiry.adults} Adults · {inquiry.rooms} Room
          </p>
          <p className="text-sm text-[#64748B] mt-1">{quotations.length} options found</p>
          <p className="text-xs font-mono text-[#94a3b8] mt-4 tracking-widest">{referenceId}</p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex justify-between items-center w-full px-2">
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 border border-green-200">
                ✓
              </div>
              <span className="text-[10px] text-[#64748B] mt-1 text-center leading-tight">Request<br />Received</span>
            </div>
            <div className="h-[2px] flex-1 bg-green-200 mx-1"></div>

            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 border border-green-200">
                ✓
              </div>
              <span className="text-[10px] text-[#64748B] mt-1 text-center leading-tight">Options<br />Selected</span>
            </div>
            <div className="h-[2px] flex-1 bg-green-200 mx-1"></div>

            <div className="flex flex-col items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-500 ${
                quotations.some(q => q.is_admin_confirmed) 
                  ? 'bg-green-100 text-green-600 border-green-200' 
                  : quotations.some(q => q.is_customer_chosen) 
                    ? 'border-yellow-400 bg-yellow-50 text-yellow-600 animate-pulse' 
                    : 'border-[#E2E8F0] bg-white text-[#94a3b8]'
              }`}>
                {quotations.some(q => q.is_admin_confirmed) 
                  ? '✓' 
                  : quotations.some(q => q.is_customer_chosen) 
                    ? '●' 
                    : '○'}
              </div>
              <span className="text-[10px] text-[#64748B] mt-1 text-center leading-tight">Availability<br />Check</span>
            </div>
            <div className="h-[2px] flex-1 bg-[#E2E8F0] mx-1"></div>

            <div className="flex flex-col items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-500 ${
                quotations.some(q => q.is_redseller_booked) 
                  ? 'bg-green-100 text-green-600 border-green-200' 
                  : 'border-[#E2E8F0] bg-white text-[#94a3b8]'
              }`}>
                {quotations.some(q => q.is_redseller_booked) ? '✓' : '○'}
              </div>
              <span className="text-[10px] text-[#64748B] mt-1 text-center leading-tight">Booking<br />Confirmation</span>
            </div>
          </div>
        </div>

        {/* QUOTATION CARDS */}
        <div className="grid grid-cols-1 gap-10 md:gap-12">
          {quotations.map((q: any) => {
            const allPrices = quotations.map(item => item.total_price);
            const badge = getBadgeByPrice(q.total_price, allPrices, inquiry.purpose);
            const imageArray = q.image_url ? q.image_url.split(',').map((url: string) => url.trim()) : [];
            const currentActiveImage = activeImages[q.id] || (imageArray.length > 0 ? imageArray[0] : 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=600&q=80');
            const isOpen = openFacilitiesId === q.id;
            const totalPrice = q.new_price * nights;

            const renderButton = () => {
              const isAnyCardChosen = quotations.some(item => item.is_customer_chosen === true);
              
              if (q.is_admin_confirmed) {
                return (
                  <div className="w-full bg-yellow-50 border border-yellow-200 text-yellow-800 py-3 rounded-xl text-center mt-2 flex flex-col items-center justify-center gap-2">
                    <span className="font-bold text-lg">⏳ OPTION SELECTED</span>
                    <span className="text-xs text-yellow-700 font-medium">
                      We're checking the latest availability and rate before confirming your booking.
                    </span>
                    <span className="text-[10px] text-yellow-600 font-medium mt-1">
                      Booking is not confirmed yet.
                    </span>
                  </div>
                );
              } 
              else if (q.is_customer_chosen && !q.is_admin_confirmed) {
                return (
                  <div className="w-full bg-yellow-50 border border-yellow-200 text-yellow-800 py-3 rounded-xl text-center mt-2 flex flex-col items-center justify-center gap-2">
                    <span className="font-bold text-lg">⏳ OPTION SELECTED</span>
                    <span className="text-xs text-yellow-700 font-medium">
                      We're checking the latest availability and rate before confirming your booking.
                    </span>
                    <span className="text-[10px] text-yellow-600 font-medium mt-1">
                      Booking is not confirmed yet.
                    </span>
                    <button 
                      onClick={() => {
                        toast((t) => (
                          <div className="flex flex-col gap-2 p-2">
                            <span className="font-bold text-[#0F172A]">
                              Are you sure you want to change your hotel choice?
                            </span>
                            <div className="flex justify-end gap-2 mt-1">
                              <button 
                                onClick={() => toast.dismiss(t.id)}
                                className="px-3 py-1 bg-[#E2E8F0] text-[#475569] rounded-lg text-sm font-semibold hover:bg-[#CBD5E1] transition"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={async () => {
                                  toast.dismiss(t.id);
                                  await supabase.from('quotations').update({ is_customer_chosen: false }).eq('id', q.id);
                                  if (inquiry) {
                                    fetchQuotation(inquiry.id);
                                  }
                                }}
                                className="px-3 py-1 bg-[#E11D48] text-white rounded-lg text-sm font-semibold hover:bg-[#BE123C] transition"
                              >
                                Yes, Change
                              </button>
                            </div>
                          </div>
                        ), {
                          duration: 10000,
                          position: 'top-center',
                        });
                      }}
                      className="mt-2 text-xs bg-white border border-yellow-200 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-50 focus:outline-none transition"
                    >
                      Change
                    </button>
                  </div>
                );
              } 
              else if (isAnyCardChosen && !q.is_customer_chosen) {
                return (
                  <div className="w-full bg-[#E2E8F0] text-[#94a3b8] py-3 rounded-xl font-bold text-center mt-2 cursor-not-allowed">
                    Option Unavailable
                  </div>
                );
              } 
              else {
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
                
                <div className={`absolute top-4 left-4 ${badge.color} text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-1`}>
                  <span>{badge.icon}</span> {badge.label}
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 w-full">
                  <img 
                    key={currentActiveImage}
                    src={currentActiveImage} 
                    alt={q.hotel_name} 
                    className="w-full h-full object-cover" 
                  />
                  {imageArray.length > 1 && (
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      {imageArray.slice(0, 5).map((url: string, i: number) => (
                        <button 
                          key={i}
                          onClick={() => setActiveImages(prev => ({ ...prev, [q.id]: url }))}
                          className={`w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm transition-all hover:scale-110 ${
                            currentActiveImage === url ? 'ring-2 ring-[#E11D48]' : ''
                          }`}
                        >
                          <img src={url} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mt-1">
                  <div className="flex-1">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#0F172A] leading-tight">
                      {q.hotel_name}
                    </h2>
                    <p className="text-sm text-[#64748B] mt-1">{q.room_type || 'Standard Room'}</p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="flex flex-col items-end sm:items-end gap-1">
                      <div className="flex items-center gap-2 sm:justify-end flex-wrap">
                        {(() => {
                          const originalPrice = q.total_price > 0 ? q.total_price : q.hotels?.price_per_night || 0;
                          if (originalPrice > 0 && q.new_price > 0 && originalPrice !== q.new_price) {
                            return (
                              <span className="text-sm text-[#94a3b8] line-through decoration-2">
                                ₱{originalPrice}
                              </span>
                            );
                          }
                          return null;
                        })()}
                        <div className="text-[#E11D48] font-bold text-2xl md:text-3xl font-serif">
                          ₱{q.new_price} <span className="text-sm font-normal text-[#64748B]">/ night</span>
                        </div>
                      </div>
                      <div className="text-[#64748B] text-sm">
                        ₱{totalPrice.toLocaleString()} total · {nights} nights
                      </div>
                    </div>
                  </div>
                </div>

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

                <div className="bg-[#F8FAFC] rounded-xl p-4 md:p-5 border border-[#E2E8F0] mt-1 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">Why we picked it</p>
                  <p className="text-[#0F172A] leading-relaxed">
                    {q.custom_description && q.custom_description.trim() !== '' ? q.custom_description : badge.description}
                  </p>
                  <p className="text-xs text-[#64748B] mt-2">
                    Best for: {badge.bestFor}
                  </p>

                  <div className="pt-2 border-t border-[#E2E8F0]">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q.hotel_name + ', ' + (q.address || ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-[#E11D48] hover:underline transition"
                    >
                      <span>📍 View on Google Maps</span>
                    </a>
                    <p className="text-xs text-[#64748B] mt-1">
                      {q.address || 'No address listed'}
                    </p>
                  </div>
                </div>

                {/* ROOM AMENITIES */}
                <div className="mt-4">
                  <button 
                    onClick={() => setOpenFacilitiesId(isOpen ? null : q.id)}
                    className="flex items-center gap-1 text-sm font-medium text-[#E11D48] hover:underline transition mb-2"
                  >
                    {isOpen ? 'HIDE' : 'VIEW'} Facilities
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {isOpen && (
                    <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">Room Amenities</p>
                      {(() => {
                        const items = q.facilities ? q.facilities.split(',').map((f: string) => f.trim()) : [];
                        const roomItems = items.filter(i => ['Chairs', 'Wardrobe', 'TV', 'AC', 'Iron', 'Bed', 'Mirror'].includes(i));
                        const bathItems = items.filter(i => ['Towel', 'Hot Shower', 'Hair Dryer'].includes(i));
                        const otherItems = items.filter(i => ![...roomItems, ...bathItems].includes(i));

                        return (
                          <div className="space-y-3">
                            {roomItems.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-[#0F172A] mb-1">Room Facilities</p>
                                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                                  {roomItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-[#475569]">
                                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {bathItems.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-[#0F172A] mb-1">Bathroom Facilities</p>
                                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                                  {bathItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-[#475569]">
                                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {otherItems.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-[#0F172A] mb-1">Others</p>
                                <div className="grid grid-cols-2 gap-y-1 gap-x-4">
                                  {otherItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-[#475569]">
                                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                                      {item}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* PROPERTY POLICIES */}
                <div className="mt-2 text-sm text-[#475569] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-1">Property Policies</p>
                  <div className="space-y-1 text-xs">
                    <p><span className="font-medium text-[#0F172A]">Check-in:</span> From 2:00 PM to 4:00 AM (next day)</p>
                    <p><span className="font-medium text-[#0F172A]">Check-out:</span> Before 12:00 PM (noon)</p>
                  </div>
                </div>

                {renderButton()}
              </div>
            );
          })}
        </div>

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
            {quotations.length > 0 && quotations[0]?.valid_until && (
              <p className="mt-1 flex items-center justify-center gap-2">
                <span>⏳</span>
                <span>
                  Quotation valid for: <span className="font-bold text-[#0F172A]">
                    {timeLeft[quotations[0].id] || 'Loading...'}
                  </span>
                </span>
              </p>
            )}
            {quotations[0]?.valid_until && (
              <p className="mt-1">
                Quotation valid until: {new Date(quotations[0].valid_until).toLocaleDateString()} · {new Date(quotations[0].valid_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed inset-0 bg-black/100 flex items-center justify-center z-50 p-4">
        {selectedQuotationId && (
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
        )}
      </div>
    </main>
  );
}