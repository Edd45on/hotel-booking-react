import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import { X, ExternalLink, Copy, Save, ChevronLeft } from 'lucide-react';

export default function AdminPanel() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsInquiry, setDetailsInquiry] = useState<any>(null);
  
  const [currentStep, setCurrentStep] = useState<'selection' | 'draft'>('selection');
  const [draftQuotes, setDraftQuotes] = useState<any[]>([]);
  const [validUntil, setValidUntil] = useState<string>('');

  useEffect(() => {
    fetchInquiries();
    fetchHotels();
  }, []);

  const fetchInquiries = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select(`
        *,
        quotations (
          id,
          is_customer_chosen,
          hotels (
            id,
            name,
            address,
            room_type
          )
        )
      `)
      .order('created_at', { ascending: false });
      
    if (data) setInquiries(data);
  };

  const fetchHotels = async () => {
    const { data } = await supabase.from('hotels').select('*');
    if (data) setHotels(data);
  };

  const toggleHotelSelection = (hotelId: string) => {
    setSelectedHotelIds(prev => {
      if (prev.includes(hotelId)) return prev.filter(id => id !== hotelId);
      if (prev.length >= 3) return prev;
      return [...prev, hotelId];
    });
  };

  const proceedToDraft = () => {
    if (selectedHotelIds.length !== 3) {
      alert('Please select exactly 3 hotels.');
      return;
    }
    
    const selectedHotels = selectedHotelIds.map(id => hotels.find(h => h.id === id));
    setDraftQuotes(selectedHotels.map((hotel, index) => ({
      hotel: hotel,
      customTitle: hotel?.name || '',
      customDescription: index === 1 ? 'Best balance of price and location.' : index === 0 ? 'The most affordable choice.' : 'Top-tier comfort and amenities.',
      customBestFor: index === 1 ? 'Families / value travelers' : index === 0 ? 'Budget-conscious travelers' : 'Luxury & business travelers',
      customFacilities: hotel?.facilities || 'No Free Toiletries, AC, No Smoking, Free Wifi, Car Parking',
      
      // 🟢 FIXED: Explicitly passing these 4 strings into the draft state
      customRoomOnly: hotel?.custom_room_only || 'Room only',
      customPayAtHotel: hotel?.custom_pay_at_hotel || 'Pay at hotel',
      customNonRefundable: hotel?.custom_non_refundable || 'Non-refundable',
      customNoBreakfast: hotel?.custom_no_breakfast || 'No breakfast',
    })));
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    setValidUntil(futureDate.toISOString().split('T')[0]);

    setCurrentStep('draft');
  };

  const generateQuotation = async () => {
    if (!selectedInquiry) return;

    setLoading(true);
    try {
      // 🟢 FIXED: Ensure we explicitly map the custom fields into the Supabase insert
      const inserts = draftQuotes.map((draft) => ({
        inquiry_id: selectedInquiry.id,
        hotel_id: draft.hotel.id,
        room_type: 'Standard Room',
        total_price: draft.hotel.price_per_night || 1500,
        is_customer_chosen: false,
        facilities: draft.customFacilities,
        custom_room_only: draft.customRoomOnly,
        custom_pay_at_hotel: draft.customPayAtHotel,
        custom_non_refundable: draft.customNonRefundable,
        custom_no_breakfast: draft.customNoBreakfast,
      }));

      console.log('📤 Sending to Supabase:', inserts); // This helps debug in the Vercel logs

      const { error } = await supabase.from('quotations').insert(inserts);
      if (error) throw error;

      const customerLink = `${window.location.origin}/quotation?id=${selectedInquiry.id}`;
      
      try {
        await navigator.clipboard.writeText(customerLink);
        alert(`✅ Quotation generated!\n\nThe customer link has been copied to your clipboard:\n\n${customerLink}`);
      } catch (err) {
        alert(`✅ Quotation generated!\n\nCopy this link manually:\n\n${customerLink}`);
      }

      setSelectedInquiry(null);
      setSelectedHotelIds([]);
      setDraftQuotes([]);
      setCurrentStep('selection');
      fetchInquiries();
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
      console.error('🔥 Supabase Insert Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getQuotationLink = (id: string) => {
    return `${window.location.origin}/quotation?id=${id}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">🛠️ Admin Dashboard</h1>
          <button onClick={() => window.location.href = '/'} className="text-[#E11D48] hover:underline">
            ← Back to Site
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {inquiries.map((inq) => {
            const chosenQuotation = inq.quotations?.find((q: any) => q.is_customer_chosen === true);
            const chosenHotelName = chosenQuotation?.hotels?.name || 'N/A';
            const hasQuotation = inq.quotations?.length > 0;

            return (
              <div key={inq.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                <div className="flex-1">
                  <p className="font-bold text-[#0F172A]">{inq.destination}</p>
                  <p className="text-sm text-[#475569]">
                    {inq.check_in} → {inq.check_out} | {inq.adults} Adults, {inq.rooms} Rooms
                  </p>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {chosenQuotation ? (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                        ✅ Booked: {chosenHotelName}
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                        {hasQuotation ? '📄 Quotation Sent' : '🆕 New Inquiry'}
                      </span>
                    )}

                    {hasQuotation && (
                      <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-3 py-1 text-xs font-mono text-[#0F172A]">
                        <span className="max-w-[200px] truncate">
                          {getQuotationLink(inq.id)}
                        </span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(getQuotationLink(inq.id));
                            alert('📋 Link copied to clipboard!');
                          }}
                          className="text-[#64748B] hover:text-[#E11D48] transition p-1"
                          title="Copy link"
                        >
                          <Copy size={14} />
                        </button>
                        <a 
                          href={getQuotationLink(inq.id)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#64748B] hover:text-[#E11D48] transition p-1"
                          title="Open link"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0">
                  <button
                    onClick={() => setDetailsInquiry(inq)}
                    className="bg-[#F8FAFC] text-[#0F172A] px-4 py-2 rounded-xl font-semibold border border-[#E2E8F0] hover:bg-[#E2E8F0] transition flex-1 md:flex-none"
                  >
                    Details
                  </button>

                  <button
                    onClick={() => setSelectedInquiry(inq)}
                    className="bg-[#E11D48] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#BE123C] transition flex-1 md:flex-none"
                  >
                    {hasQuotation ? 'Resend Quote' : 'Generate Quotation'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DRAFT EDITOR MODAL */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white max-w-4xl w-full rounded-3xl shadow-2xl p-6 relative">
            
            <button 
              onClick={() => {
                setSelectedInquiry(null);
                setSelectedHotelIds([]);
                setDraftQuotes([]);
                setCurrentStep('selection');
              }}
              className="absolute top-4 right-4 text-[#475569] hover:text-[#0F172A] transition"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-[#E2E8F0] pb-4">
              {currentStep === 'draft' && (
                <button 
                  onClick={() => setCurrentStep('selection')}
                  className="flex items-center gap-1 text-[#64748B] hover:text-[#0F172A] transition text-sm font-medium"
                >
                  <ChevronLeft size={16} /> Back to Selection
                </button>
              )}
              <h2 className="text-2xl font-bold flex-1 text-center">
                {currentStep === 'selection' ? `Select 3 Hotels for ${selectedInquiry.destination}` : 'Preview & Edit Draft Quotation'}
              </h2>
            </div>

            {/* STEP 1: SELECTION */}
            {currentStep === 'selection' && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {hotels.map((hotel) => (
                  <button
                    key={hotel.id}
                    onClick={() => toggleHotelSelection(hotel.id)}
                    className={`p-4 border-2 rounded-xl text-left transition ${
                      selectedHotelIds.includes(hotel.id)
                        ? 'border-[#E11D48] bg-[#FFF1F2]'
                        : 'border-[#E2E8F0] hover:border-[#E11D48]'
                    }`}
                    disabled={!selectedHotelIds.includes(hotel.id) && selectedHotelIds.length >= 3}
                  >
                    <p className="font-bold">{hotel.name}</p>
                    <p className="text-sm text-[#475569]">{hotel.city}</p>
                    <p className="text-sm font-semibold text-[#E11D48]">₱{hotel.price_per_night}/night</p>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 2: DRAFT EDITOR */}
            {currentStep === 'draft' && (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Quotation Valid Until</label>
                  <input 
                    type="date" 
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>

                {draftQuotes.map((draft, index) => (
                  <div key={index} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        Option {index + 1}
                      </span>
                      <span className="text-xs bg-white border border-[#E2E8F0] rounded-full px-3 py-1 text-[#475569]">
                        ₱{draft.hotel.price_per_night}/night
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1">Display Title</label>
                      <input 
                        type="text" 
                        value={draft.customTitle}
                        onChange={(e) => {
                          const newDraft = [...draftQuotes];
                          newDraft[index].customTitle = e.target.value;
                          setDraftQuotes(newDraft);
                        }}
                        className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1">Why we picked it (Description)</label>
                      <input 
                        type="text" 
                        value={draft.customDescription}
                        onChange={(e) => {
                          const newDraft = [...draftQuotes];
                          newDraft[index].customDescription = e.target.value;
                          setDraftQuotes(newDraft);
                        }}
                        className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1">Best For</label>
                      <input 
                        type="text" 
                        value={draft.customBestFor}
                        onChange={(e) => {
                          const newDraft = [...draftQuotes];
                          newDraft[index].customBestFor = e.target.value;
                          setDraftQuotes(newDraft);
                        }}
                        className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] mb-1">Facilities (Comma separated)</label>
                      <textarea 
                        rows={2}
                        value={draft.customFacilities}
                        onChange={(e) => {
                          const newDraft = [...draftQuotes];
                          newDraft[index].customFacilities = e.target.value;
                          setDraftQuotes(newDraft);
                        }}
                        className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48] resize-none"
                        placeholder="Free WiFi, AC, Parking, Pool"
                      />
                    </div>

                    {/* 🟢 FIXED: Correctly mapped 4 checkmark text fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">Line 1 (Room only)</label>
                        <input 
                          type="text" 
                          value={draft.customRoomOnly}
                          onChange={(e) => {
                            const newDraft = [...draftQuotes];
                            newDraft[index].customRoomOnly = e.target.value;
                            setDraftQuotes(newDraft);
                          }}
                          className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">Line 2 (Pay at hotel)</label>
                        <input 
                          type="text" 
                          value={draft.customPayAtHotel}
                          onChange={(e) => {
                            const newDraft = [...draftQuotes];
                            newDraft[index].customPayAtHotel = e.target.value;
                            setDraftQuotes(newDraft);
                          }}
                          className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">Line 3 (Non-refundable)</label>
                        <input 
                          type="text" 
                          value={draft.customNonRefundable}
                          onChange={(e) => {
                            const newDraft = [...draftQuotes];
                            newDraft[index].customNonRefundable = e.target.value;
                            setDraftQuotes(newDraft);
                          }}
                          className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">Line 4 (No breakfast)</label>
                        <input 
                          type="text" 
                          value={draft.customNoBreakfast}
                          onChange={(e) => {
                            const newDraft = [...draftQuotes];
                            newDraft[index].customNoBreakfast = e.target.value;
                            setDraftQuotes(newDraft);
                          }}
                          className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={() => {
                  setSelectedInquiry(null);
                  setSelectedHotelIds([]);
                  setDraftQuotes([]);
                  setCurrentStep('selection');
                }}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition"
              >
                Cancel
              </button>

              {currentStep === 'selection' && (
                <button
                  onClick={proceedToDraft}
                  className="px-4 py-2 rounded-xl bg-[#E11D48] text-white font-bold hover:bg-[#BE123C] transition"
                >
                  Preview & Edit Draft
                </button>
              )}

              {currentStep === 'draft' && (
                <button
                  onClick={generateQuotation}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-[#E11D48] text-white font-bold hover:bg-[#BE123C] transition disabled:opacity-70 flex items-center gap-2"
                >
                  {loading ? 'Saving...' : <><Save size={18} /> Generate Quotation</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {detailsInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setDetailsInquiry(null)}
              className="absolute top-4 right-4 text-[#475569] hover:text-[#0F172A] transition"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Booking Details</h2>
            <p className="text-sm text-[#64748B] mb-4">Review the customer's request, details, and chosen hotel.</p>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4">
              <p className="text-blue-700 font-bold text-sm mb-2">👤 Customer Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-[#64748B]">First Name:</span>
                  <span className="font-semibold text-[#0F172A] block">
                    {detailsInquiry.first_name || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B]">Last Name:</span>
                  <span className="font-semibold text-[#0F172A] block">
                    {detailsInquiry.last_name || 'Not provided'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#64748B]">Email:</span>
                  <span className="font-semibold text-[#0F172A] block">
                    {detailsInquiry.email || 'Not provided'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#64748B]">Phone:</span>
                  <span className="font-semibold text-[#0F172A] block">
                    {detailsInquiry.phone || 'Not provided'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4 bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-[#64748B]">Destination:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.destination}</span></div>
                <div><span className="text-[#64748B]">Guests:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.adults} Adults, {detailsInquiry.children} Children</span></div>
                <div><span className="text-[#64748B]">Check-in:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.check_in}</span></div>
                <div><span className="text-[#64748B]">Check-out:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.check_out}</span></div>
                <div><span className="text-[#64748B]">Rooms:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.rooms}</span></div>
                <div className="col-span-2"><span className="text-[#64748B]">Budget:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.budget}</span></div>
                {detailsInquiry.special_request && (
                  <div className="col-span-2"><span className="text-[#64748B]">Special Request:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.special_request}</span></div>
                )}
              </div>
            </div>

            {detailsInquiry.quotations?.find((q:any) => q.is_customer_chosen) && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                <p className="text-green-700 font-bold text-sm mb-1">✅ Chosen Hotel</p>
                <p className="font-bold text-[#0F172A] text-lg">
                  {detailsInquiry.quotations.find((q:any) => q.is_customer_chosen).hotels.name}
                </p>
                <p className="text-sm text-[#475569] mb-2">
                  {detailsInquiry.quotations.find((q:any) => q.is_customer_chosen).hotels.address}
                </p>
                <button 
                  onClick={() => {
                    const chosen = detailsInquiry.quotations.find((q:any) => q.is_customer_chosen);
                    navigator.clipboard.writeText(
                      `Customer: ${detailsInquiry.first_name || 'N/A'} ${detailsInquiry.last_name || 'N/A'}\n` +
                      `Email: ${detailsInquiry.email || 'N/A'}\n` +
                      `Phone: ${detailsInquiry.phone || 'N/A'}\n` +
                      `Destination: ${detailsInquiry.destination}\n` +
                      `Rooms: ${detailsInquiry.rooms}\n` +
                      `Hotel: ${chosen.hotels.name}\n` +
                      `Address: ${chosen.hotels.address}\n` +
                      `Dates: ${detailsInquiry.check_in} to ${detailsInquiry.check_out}\n` +
                      `Guests: ${detailsInquiry.adults} Adults, ${detailsInquiry.children} Children`
                    );
                    alert('📋 Full booking details copied to clipboard!');
                  }}
                  className="w-full mt-2 bg-white border border-green-200 text-green-700 py-2 rounded-xl font-semibold hover:bg-green-50 transition"
                >
                  Copy to Clipboard for RedSeller
                </button>
              </div>
            )}

            {!detailsInquiry.quotations?.find((q:any) => q.is_customer_chosen) && (
              <p className="text-center text-[#64748B] text-sm py-4">
                The customer has not chosen a room yet. Generate a quotation to get started.
              </p>
            )}

          </div>
        </div>
      )}
    </div>
  );
}