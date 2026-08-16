import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import { X, Save, ChevronLeft } from 'lucide-react';

export default function AdminPanel() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detailsInquiry, setDetailsInquiry] = useState<any>(null);
  
  // 🟢 NEW: Draft State for the Blank Form
  const [draft, setDraft] = useState({
    hotelName: '',
    roomType: '',
    pricePerNight: '',
    totalPrice: '',
    nights: '',
    customRoomOnly: 'Room only',
    customPayAtHotel: 'Pay at hotel',
    customNonRefundable: 'Non-refundable',
    customNoBreakfast: 'No breakfast',
    customDescription: 'Best value for your budget.',
    customBestFor: 'Couples / leisure',
    facilities: 'Free WiFi, AC, Parking',
    imageUrl: '',
  });
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    const { data } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setInquiries(data);
  };

  // 🟢 OPEN THE BLANK DRAFT EDITOR
  const openDraftEditor = (inq: any) => {
    setSelectedInquiry(inq);
    // Reset the form to blank defaults
    setDraft({
      hotelName: '',
      roomType: '',
      pricePerNight: '',
      totalPrice: '',
      nights: '',
      customRoomOnly: 'Room only',
      customPayAtHotel: 'Pay at hotel',
      customNonRefundable: 'Non-refundable',
      customNoBreakfast: 'No breakfast',
      customDescription: 'Best value for your budget.',
      customBestFor: 'Couples / leisure',
      facilities: 'Free WiFi, AC, Parking',
      imageUrl: '',
    });
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    setValidUntil(futureDate.toISOString().split('T')[0]);
  };

  // 🟢 GENERATE THE QUOTATION & SAVE TO SUPABASE
  const generateQuotation = async () => {
    if (!selectedInquiry) return;
    if (!draft.hotelName || !draft.pricePerNight) {
      alert('Please fill in the Hotel Name and Price.');
      return;
    }

    setLoading(true);
    try {
      // 🟢 GENERATE 3 ROWS BASED ON THE SINGLE FORM INPUT
      const hotelNames = [
        draft.hotelName,
        `${draft.hotelName} (Alternative)`,
        `${draft.hotelName} (Premium)`
      ];
      const priceVariants = [
        parseInt(draft.pricePerNight),
        parseInt(draft.pricePerNight) + 200,
        parseInt(draft.pricePerNight) + 500
      ];

      // Clear out old quotations for this inquiry so we don't get duplicates
      await supabase.from('quotations').delete().eq('inquiry_id', selectedInquiry.id);

      const inserts = hotelNames.map((name, index) => ({
        inquiry_id: selectedInquiry.id,
        hotel_name: name,
        room_type: draft.roomType,
        total_price: priceVariants[index],
        is_customer_chosen: false,
        facilities: draft.facilities,
        custom_room_only: draft.customRoomOnly,
        custom_pay_at_hotel: draft.customPayAtHotel,
        custom_non_refundable: draft.customNonRefundable,
        custom_no_breakfast: draft.customNoBreakfast,
        custom_description: draft.customDescription,
        image_url: draft.imageUrl,
      }));

      const { error } = await supabase.from('quotations').insert(inserts);
      if (error) throw error;

      const customerLink = `${window.location.origin}/quotation?id=${selectedInquiry.id}`;
      
      try {
        await navigator.clipboard.writeText(customerLink);
        alert(`✅ Quotation generated!\n\n3 options created. The link has been copied to your clipboard:\n\n${customerLink}`);
      } catch (err) {
        alert(`✅ Quotation generated!\n\nCopy this link manually:\n\n${customerLink}`);
      }

      setSelectedInquiry(null);
      fetchInquiries();
    } catch (err: any) {
      alert('❌ Error: ' + err.message);
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

        {/* LIST OF INQUIRIES */}
        <div className="grid grid-cols-1 gap-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] flex justify-between items-center">
              <div>
                <p className="font-bold text-[#0F172A]">{inq.destination}</p>
                <p className="text-sm text-[#475569]">
                  {inq.check_in} → {inq.check_out} | {inq.adults} Adults, {inq.rooms} Rooms
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                  🆕 New Inquiry
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDetailsInquiry(inq)}
                  className="bg-[#F8FAFC] text-[#0F172A] px-4 py-2 rounded-xl font-semibold border border-[#E2E8F0] hover:bg-[#E2E8F0] transition"
                >
                  Details
                </button>
                <button
                  onClick={() => openDraftEditor(inq)}
                  className="bg-[#E11D48] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#BE123C] transition"
                >
                  Generate Quotation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🟢 DRAFT EDITOR MODAL (BLANK FORM) */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl p-6 relative">
            
            <button 
              onClick={() => setSelectedInquiry(null)}
              className="absolute top-4 right-4 text-[#475569] hover:text-[#0F172A] transition"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-[#E2E8F0] pb-4">
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="flex items-center gap-1 text-[#64748B] hover:text-[#0F172A] transition text-sm font-medium"
              >
                <ChevronLeft size={16} /> Back to Dashboard
              </button>
              <h2 className="text-2xl font-bold flex-1 text-center">
                Create Draft Quotation
              </h2>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              
              {/* Valid Until */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Quotation Valid Until</label>
                <input 
                  type="date" 
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                />
              </div>

              {/* HOTEL NAME & PRICE */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">Hotel Name *</label>
                    <input 
                      type="text" 
                      value={draft.hotelName}
                      onChange={(e) => setDraft({ ...draft, hotelName: e.target.value })}
                      className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                      placeholder="e.g. RedDoorz @ Tagaytay"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">Price / night *</label>
                    <input 
                      type="number" 
                      value={draft.pricePerNight}
                      onChange={(e) => setDraft({ ...draft, pricePerNight: e.target.value })}
                      className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                      placeholder="1389"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">Room Type</label>
                    <input 
                      type="text" 
                      value={draft.roomType}
                      onChange={(e) => setDraft({ ...draft, roomType: e.target.value })}
                      className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                      placeholder="Standard Room"
                    />
                  </div>
                  <div className="w-1/3">
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">Image URL</label>
                    <input 
                      type="text" 
                      value={draft.imageUrl}
                      onChange={(e) => setDraft({ ...draft, imageUrl: e.target.value })}
                      className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* DESCRIPTION & BEST FOR */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Why we picked it (Description)</label>
                  <input 
                    type="text" 
                    value={draft.customDescription}
                    onChange={(e) => setDraft({ ...draft, customDescription: e.target.value })}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Best For</label>
                  <input 
                    type="text" 
                    value={draft.customBestFor}
                    onChange={(e) => setDraft({ ...draft, customBestFor: e.target.value })}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

              {/* FACILITIES */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Facilities (Comma separated)</label>
                <textarea 
                  rows={2}
                  value={draft.facilities}
                  onChange={(e) => setDraft({ ...draft, facilities: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48] resize-none"
                  placeholder="Free WiFi, AC, Parking, Pool"
                />
              </div>

              {/* 4 CUSTOM CHECKMARKS */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Line 1</label>
                  <input 
                    type="text" 
                    value={draft.customRoomOnly}
                    onChange={(e) => setDraft({ ...draft, customRoomOnly: e.target.value })}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Line 2</label>
                  <input 
                    type="text" 
                    value={draft.customPayAtHotel}
                    onChange={(e) => setDraft({ ...draft, customPayAtHotel: e.target.value })}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Line 3</label>
                  <input 
                    type="text" 
                    value={draft.customNonRefundable}
                    onChange={(e) => setDraft({ ...draft, customNonRefundable: e.target.value })}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Line 4</label>
                  <input 
                    type="text" 
                    value={draft.customNoBreakfast}
                    onChange={(e) => setDraft({ ...draft, customNoBreakfast: e.target.value })}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                  />
                </div>
              </div>

            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition"
              >
                Cancel
              </button>
              <button
                onClick={generateQuotation}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-[#E11D48] text-white font-bold hover:bg-[#BE123C] transition disabled:opacity-70 flex items-center gap-2"
              >
                {loading ? 'Saving...' : <><Save size={18} /> Generate Quotation</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {detailsInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl relative">
            <button onClick={() => setDetailsInquiry(null)} className="absolute top-4 right-4 text-[#475569] hover:text-[#0F172A] transition"><X size={24} /></button>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Booking Details</h2>
            <p className="text-sm text-[#64748B] mb-4">Review the customer's request.</p>
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-sm grid grid-cols-2 gap-2">
              <div><span className="text-[#64748B]">Destination:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.destination}</span></div>
              <div><span className="text-[#64748B]">Guests:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.adults} Adults</span></div>
              <div><span className="text-[#64748B]">Check-in:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.check_in}</span></div>
              <div><span className="text-[#64748B]">Check-out:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.check_out}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}