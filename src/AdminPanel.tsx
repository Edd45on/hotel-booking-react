import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase';
import { X, Save, ChevronLeft, Copy, ExternalLink, Trash2 } from 'lucide-react';

export default function AdminPanel() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [detailsInquiry, setDetailsInquiry] = useState<any>(null);
  
  const [hotelDatabase, setHotelDatabase] = useState<any[]>([]);

  const [drafts, setDrafts] = useState([
    {
      hotelId: null,
      hotelName: '',
      roomType: '',
      pricePerNight: '',
      originalPrice: '',
      address: '',
      customRoomOnly: 'Room only',
      customPayAtHotel: 'Pay at hotel',
      customNonRefundable: 'Non-refundable',
      customNoBreakfast: 'No breakfast',
      customBestFor: ,
      facilities: 'Chairs, TV, AC, Bed, Towel, Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV,  Free WiFi',
      imageUrls: [] as string[],
      showSuggestions: false,
    },
    {
      hotelId: null,
      hotelName: '',
      roomType: '',
      pricePerNight: '',
      originalPrice: '',
      address: '',
      customRoomOnly: 'Room only',
      customPayAtHotel: 'Pay at hotel',
      customNonRefundable: 'Non-refundable',
      customNoBreakfast: 'No breakfast',
      customBestFor: ,
      facilities: 'Chairs, TV, AC, Bed, Towel,Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV, Free WiFi',
      imageUrls: [] as string[],
      showSuggestions: false,
    },
    {
      hotelId: null,
      hotelName: '',
      roomType: '',
      pricePerNight: '',
      originalPrice: '',
      address: '',
      customRoomOnly: 'Room only',
      customPayAtHotel: 'Pay at hotel',
      customNonRefundable: 'Non-refundable',
      customNoBreakfast: 'No breakfast',
      customBestFor: ,
      facilities: 'Chairs, TV, AC, Bed, Towel,Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV, Free WiFi',
      imageUrls: [] as string[],
      showSuggestions: false,
    },
  ]);
  const [validUntil, setValidUntil] = useState('');
  
    // 🟢 ADD PROPERTY MODAL STATE
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [newProperty, setNewProperty] = useState({
    name: '',
    room_type: '',
    price_per_night: '',
    address: '',
    facilities: 'Chairs, TV, AC, Bed, Towel, Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV, Free WiFi',
    images: '',
  });

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
          hotel_name,
          room_type,
          new_price,
          is_customer_chosen,
          is_admin_confirmed
        )
      `)
      .order('created_at', { ascending: false });
    if (data) setInquiries(data);
  };

  const fetchHotels = async () => {
    const { data } = await supabase.from('hotels').select('*');
    if (data) setHotelDatabase(data);
  };

  const openDraftEditor = async (inq: any) => {
    fetchHotels();
    setSelectedInquiry(inq);
    
    const { data: existingQuote } = await supabase
      .from('quotations')
      .select('*')
      .eq('inquiry_id', inq.id)
      .maybeSingle();

    if (existingQuote) {
      setDrafts([
        {
          hotelId: existingQuote.hotel_id || null,
          hotelName: existingQuote.hotel_name || '',
          roomType: existingQuote.room_type || '',
          pricePerNight: existingQuote.new_price?.toString() || '',
          originalPrice: existingQuote.total_price?.toString() || '',
          address: existingQuote.address || '',
          customRoomOnly: existingQuote.custom_room_only || 'Room only',
          customPayAtHotel: existingQuote.custom_pay_at_hotel || 'Pay at hotel',
          customNonRefundable: existingQuote.custom_non_refundable || 'Non-refundable',
          customNoBreakfast: existingQuote.custom_no_breakfast || 'No breakfast',
          customBestFor: existingQuote.custom_best_for || ,
          facilities: existingQuote.facilities || 'Chairs, TV, AC, Bed, Towel, Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV, Free WiFi',
          imageUrls: existingQuote.image_url ? existingQuote.image_url.split(',').map((url: string) => url.trim()) : [],
          showSuggestions: false,
        },
        { hotelId: null, hotelName: '', roomType: '', pricePerNight: '', originalPrice: '', address: '', customRoomOnly: 'Room only', customPayAtHotel: 'Pay at hotel', customNonRefundable: 'Non-refundable', customNoBreakfast: 'No breakfast', customBestFor: , facilities: 'Chairs, TV, AC, Bed, Towel, Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV, Free WiFi', imageUrls: [], showSuggestions: false },
        { hotelId: null, hotelName: '', roomType: '', pricePerNight: '', originalPrice: '', address: '', customRoomOnly: 'Room only', customPayAtHotel: 'Pay at hotel', customNonRefundable: 'Non-refundable', customNoBreakfast: 'No breakfast', customBestFor: , facilities: 'Chairs, TV, AC, Bed, Towel, Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV, Free WiFi', imageUrls: [], showSuggestions: false },
      ]);
    } else {
      setDrafts([
        { hotelId: null, hotelName: '', roomType: '', pricePerNight: '', originalPrice: '', address: '', customRoomOnly: 'Room only', customPayAtHotel: 'Pay at hotel', customNonRefundable: 'Non-refundable', customNoBreakfast: 'No breakfast', customBestFor: , facilities: 'Chairs, TV, AC, Bed, Towel, Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV, Free WiFi', imageUrls: [], showSuggestions: false },
        { hotelId: null, hotelName: '', roomType: '', pricePerNight: '', originalPrice: '', address: '', customRoomOnly: 'Room only', customPayAtHotel: 'Pay at hotel', customNonRefundable: 'Non-refundable', customNoBreakfast: 'No breakfast', customBestFor: , facilities: 'Chairs, TV, AC, Bed, Towel, Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV, Free WiFi', imageUrls: [], showSuggestions: false },
        { hotelId: null, hotelName: '', roomType: '', pricePerNight: '', originalPrice: '', address: '', customRoomOnly: 'Room only', customPayAtHotel: 'Pay at hotel', customNonRefundable: 'Non-refundable', customNoBreakfast: 'No breakfast', customBestFor: , facilities: 'Chairs, TV, AC, Bed, Towel, Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV, Free WiFi', imageUrls: [], showSuggestions: false },
      ]);
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    setValidUntil(futureDate.toISOString().split('T')[0]);
  };

  const updateDraft = (index: number, field: string, value: any) => {
    const newDrafts = [...drafts];
    newDrafts[index] = { ...newDrafts[index], [field]: value };
    if (field === 'hotelName') {
      newDrafts[index].showSuggestions = true;
    }
    setDrafts(newDrafts);
  };

  const selectHotel = (index: number, hotel: any) => {
    const newDrafts = [...drafts];
    newDrafts[index] = {
      ...newDrafts[index],
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomType: hotel.room_type || '',
      pricePerNight: hotel.price_per_night || '',
      originalPrice: hotel.original_price || '',
      address: hotel.address || '',
      imageUrls: hotel.images ? hotel.images.split(',').map((url: string) => url.trim()) : [],
      facilities: hotel.facilities || '',
      customBestFor: hotel.best_for || ,
      showSuggestions: false,
    };
    setDrafts(newDrafts);
  };

  const addHotelForm = () => {
    if (drafts.length >= 3) return;
    setDrafts([...drafts, { hotelId: null, hotelName: '', roomType: '', pricePerNight: '', originalPrice: '', address: '', customRoomOnly: 'Room only', customPayAtHotel: 'Pay at hotel', customNonRefundable: 'Non-refundable', customNoBreakfast: 'No breakfast', customBestFor: , facilities: 'Chairs, TV, AC, Bed, Towel, Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV, Free WiFi', imageUrls: [], showSuggestions: false }]);
  };

  const removeHotelForm = (index: number) => {
    if (drafts.length <= 1) return;
    const newDrafts = drafts.filter((_, i) => i !== index);
    setDrafts(newDrafts);
  };

  const generateQuotation = async () => {
    if (!selectedInquiry) return;
    
    if (!drafts[0].hotelName || !drafts[0].pricePerNight) {
      alert('Please fill in the Hotel Name and Price for Option 1.');
      return;
    }

    setLoading(true);
    try {
      const { data: existingQuotation } = await supabase
        .from('quotations')
        .select('total_price, hotel_name')
        .eq('inquiry_id', selectedInquiry.id)
        .maybeSingle();

      await supabase.from('quotations').delete().eq('inquiry_id', selectedInquiry.id);

      const today = new Date();
      const checkIn = new Date(selectedInquiry.check_in);
      const daysDiff = Math.ceil((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      let hours = 12;
      if (daysDiff <= 3) hours = 2;
      else if (daysDiff <= 7) hours = 4;
      else if (daysDiff <= 30) hours = 12;
      else if (daysDiff > 30) hours = 24;
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + hours);
      const validUntilISO = expirationDate.toISOString();

      const finalDrafts = await Promise.all(drafts.map(async (draft) => {
        let finalHotelId = draft.hotelId || null;

        if (!finalHotelId && draft.hotelName) {
          const { data: existingHotel } = await supabase
            .from('hotels')
            .select('id')
            .eq('name', draft.hotelName)
            .maybeSingle();

          if (existingHotel) {
            finalHotelId = existingHotel.id;
          } else {
            const { data: newHotel, error: createError } = await supabase
              .from('hotels')
              .insert({
                name: draft.hotelName,
                room_type: draft.roomType,
                price_per_night: parseFloat(draft.pricePerNight) || 0,
                facilities: draft.facilities,
                images: draft.imageUrls.join(','),
                best_for: draft.customBestFor,
                address: draft.address,
              })
              .select('id')
              .single();

            if (createError) throw createError;
            if (newHotel) finalHotelId = newHotel.id;
          }
        }

        return {
          ...draft,
          hotelId: finalHotelId
        };
      }));

      const inserts = finalDrafts.map((draft) => ({
        inquiry_id: selectedInquiry.id,
        hotel_id: draft.hotelId || null,
        hotel_name: draft.hotelName,
        room_type: draft.roomType,
        total_price: existingQuotation ? parseFloat(existingQuotation.total_price) : 0,
        new_price: parseFloat(draft.pricePerNight) || 0,
        address: draft.address,
        is_customer_chosen: false,
        is_admin_confirmed: false,
        facilities: draft.facilities,
        custom_room_only: draft.customRoomOnly,
        custom_pay_at_hotel: draft.customPayAtHotel,
        custom_non_refundable: draft.customNonRefundable,
        custom_no_breakfast: draft.customNoBreakfast,
        custom_best_for: draft.customBestFor,
        image_url: draft.imageUrls.join(','),
        valid_until: validUntilISO,
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* 🟢 SINGLE HEADER BLOCK */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">🛠️ Admin Dashboard</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddPropertyOpen(true)}
              className="bg-[#0F172A] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#1E293B] transition"
            >
              + Add Property
            </button>
            <button onClick={() => window.location.href = '/'} className="text-[#E11D48] hover:underline">
              ← Back to Site
            </button>
          </div>
        </div>

        {/* INQUIRY LIST (Keep your existing loop exactly as it is) */}
        <div className="grid grid-cols-1 gap-4">
          {inquiries.map((inq) => {
            // ... rest of your code ...
            const chosenQuotation = inq.quotations?.find((q: any) => q.is_customer_chosen === true);
            const hasQuotation = inq.quotations?.length > 0;

            return (
              <div key={inq.id} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E2E8F0] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="font-bold text-[#0F172A]">{inq.destination}</p>
                  <p className="text-sm text-[#475569]">
                    {inq.check_in} → {inq.check_out} | {inq.adults} Adults, {inq.rooms} Rooms
                  </p>
                  
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {chosenQuotation ? (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                          ✅ Booked
                        </span>
                        <span className="text-xs text-green-700 font-medium ml-1">
                          {chosenQuotation.hotel_name}
                        </span>
                      </div>
                    ) : hasQuotation ? (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                        📄 Quotation Sent
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
                        🆕 New Inquiry
                      </span>
                    )}

                    {hasQuotation && (
                      <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-2 py-1 text-[10px] font-mono text-[#0F172A]">
                        <span className="max-w-[120px] truncate">
                          {`/quotation?id=${inq.id}`}
                        </span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/quotation?id=${inq.id}`);
                            alert('📋 Link copied!');
                          }}
                          className="text-[#64748B] hover:text-[#E11D48] p-1"
                        >
                          <Copy size={12} />
                        </button>
                        <a href={`/quotation?id=${inq.id}`} target="_blank" className="text-[#64748B] hover:text-[#E11D48] p-1">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setDetailsInquiry(inq)}
                    className="bg-[#F8FAFC] text-[#0F172A] px-4 py-2 rounded-xl font-semibold border border-[#E2E8F0] hover:bg-[#E2E8F0] transition flex-1 md:flex-none"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => openDraftEditor(inq)}
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

      {/* DRAFT EDITOR MODAL WITH CHECKBOX FACILITIES */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setSelectedInquiry(null)} className="absolute top-4 right-4 text-[#475569] hover:text-[#0F172A] transition"><X size={24} /></button>
            <div className="flex items-center gap-3 mb-6 border-b border-[#E2E8F0] pb-4">
              <button onClick={() => setSelectedInquiry(null)} className="flex items-center gap-1 text-[#64748B] hover:text-[#0F172A] transition text-sm font-medium"><ChevronLeft size={16} /> Back to Dashboard</button>
              <h2 className="text-2xl font-bold flex-1 text-center">Create Draft Quotation</h2>
            </div>

            <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
              {drafts.map((draft, index) => {
                const filteredHotels = hotelDatabase ? hotelDatabase.filter(hotel => 
                  hotel.name.toLowerCase().startsWith(draft.hotelName.toLowerCase())
                ) : [];

                return (
                  <div key={index} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 space-y-4 relative">
                    <div className="flex justify-between items-center mb-2"><span className="text-sm font-bold uppercase tracking-wider text-[#64748B]">Option {index + 1}</span></div>
                    
                    <div className="flex gap-4 relative">
                      <div className="flex-1 relative">
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">Hotel Name *</label>
                        <input 
                          type="text" 
                          value={draft.hotelName}
                          onChange={(e) => updateDraft(index, 'hotelName', e.target.value)}
                          onFocus={() => {
                            const newDrafts = [...drafts];
                            newDrafts[index].showSuggestions = true;
                            setDrafts(newDrafts);
                          }}
                          className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                          placeholder="e.g. RedDoorz @ Tagaytay"
                        />
                        
                        {/* AUTO-SUGGEST DROPDOWN */}
                        {draft.showSuggestions && draft.hotelName.length > 0 && filteredHotels.length > 0 && (
                          <div className="absolute top-full left-0 w-full bg-white border border-[#E2E8F0] rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto mt-1">
                            {filteredHotels.slice(0, 8).map((hotel) => (
                              <button 
                                key={hotel.id}
                                onClick={() => selectHotel(index, hotel)}
                                className="w-full text-left px-4 py-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition border-b border-[#E2E8F0] last:border-0"
                              >
                                <p className="font-semibold">{hotel.name}</p>
                                <p className="text-xs text-[#64748B]">₱{hotel.price_per_night}/night · {hotel.room_type}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="w-1/3">
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">Price / night *</label>
                        <input 
                          type="number" 
                          step="0.01"
                          value={draft.pricePerNight}
                          onChange={(e) => updateDraft(index, 'pricePerNight', e.target.value)}
                          className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                          placeholder="1389.99"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">Room Type</label>
                        <input 
                          type="text" 
                          value={draft.roomType}
                          onChange={(e) => updateDraft(index, 'roomType', e.target.value)}
                          className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                          placeholder="Standard Room"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">Address</label>
                        <input 
                          type="text" 
                          value={draft.address}
                          onChange={(e) => updateDraft(index, 'address', e.target.value)}
                          className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                          placeholder="Hotel Street, City"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#64748B] mb-1">Image URLs</label>
                        <div 
                          className="w-full p-4 border-2 border-dashed border-[#E2E8F0] rounded-lg bg-[#F8FAFC] hover:bg-white hover:border-[#E11D48] transition cursor-pointer text-center text-xs text-[#64748B]"
                          onClick={() => document.getElementById(`file-input-${index}`)?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault();
                            const files = Array.from(e.dataTransfer.files);
                            if (!files.length) return;
                            
                            for (const file of files) {
                              const formData = new FormData();
                              formData.append('file', file);

                              try {
                                const res = await fetch('/api/upload-image', {
                                  method: 'POST',
                                  body: formData,
                                });
                                const data = await res.json();
                                if (data.url) {
                                  const newDrafts = [...drafts];
                                  newDrafts[index].imageUrls.push(data.url);
                                  setDrafts(newDrafts);
                                }
                              } catch (err) {
                                alert('Upload failed. Please try again.');
                              }
                            }
                          }}
                        >
                          <p>Drag & drop images here, or click to select</p>
                          <p className="text-[10px] text-[#94a3b8] mt-1">PNG, JPG, WEBP supported</p>
                          
                          <input 
                            type="file" 
                            id={`file-input-${index}`} 
                            className="hidden" 
                            multiple
                            accept="image/png,image/jpeg,image/webp"
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []);
                              if (!files.length) return;

                              for (const file of files) {
                                const formData = new FormData();
                                formData.append('file', file);

                                try {
                                  const res = await fetch('/api/upload-image', {
                                    method: 'POST',
                                    body: formData,
                                  });
                                  const data = await res.json();
                                  if (data.url) {
                                    const newDrafts = [...drafts];
                                    newDrafts[index].imageUrls.push(data.url);
                                    setDrafts(newDrafts);
                                  }
                                } catch (err) {
                                  alert('Upload failed. Please try again.');
                                }
                              }
                            }}
                          />
                        </div>

                        {draft.imageUrls.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {draft.imageUrls.map((url, i) => (
                              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E2E8F0] bg-slate-100 group">
                                <img 
                                  src={url} 
                                  alt={`Uploaded ${i+1}`} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <button
                                  onClick={() => {
                                    const newDrafts = [...drafts];
                                    newDrafts[index].imageUrls.splice(i, 1);
                                    setDrafts(newDrafts);
                                  }}
                                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg hover:bg-red-600 transition"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 🟢 ADVANCED FACILITIES CHECKBOXES */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mt-2">
                      <label className="block text-xs font-bold text-[#64748B] mb-2">Facilities</label>
                      
                      {/* Room Facilities */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-[#0F172A] mb-2">Room Facilities</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['Chairs', 'Wardrobe', 'TV', 'AC', 'Iron', 'Bed', 'Mirror'].map((item) => (
                            <label key={item} className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer">
                              <input 
                                type="checkbox"
                                className="w-4 h-4 rounded border-[#E2E8F0] text-[#E11D48] focus:ring-[#E11D48]"
                                checked={draft.facilities.split(',').map(f => f.trim()).includes(item)}
                                onChange={(e) => {
                                  const currentList = draft.facilities.split(',').map(f => f.trim()).filter(f => f !== '');
                                  let newList;
                                  if (e.target.checked) {
                                    newList = [...currentList, item];
                                  } else {
                                    newList = currentList.filter(f => f !== item);
                                  }
                                  updateDraft(index, 'facilities', newList.join(','));
                                }}
                              />
                              {item}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Bathroom Facilities */}
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-[#0F172A] mb-2">Bathroom Facilities</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['Towel', 'Hot Shower', 'Hair Dryer'].map((item) => (
                            <label key={item} className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer">
                              <input 
                                type="checkbox"
                                className="w-4 h-4 rounded border-[#E2E8F0] text-[#E11D48] focus:ring-[#E11D48]"
                                checked={draft.facilities.split(',').map(f => f.trim()).includes(item)}
                                onChange={(e) => {
                                  const currentList = draft.facilities.split(',').map(f => f.trim()).filter(f => f !== '');
                                  let newList;
                                  if (e.target.checked) {
                                    newList = [...currentList, item];
                                  } else {
                                    newList = currentList.filter(f => f !== item);
                                  }
                                  updateDraft(index, 'facilities', newList.join(','));
                                }}
                              />
                              {item}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Others */}
                      <div>
                        <p className="text-xs font-semibold text-[#0F172A] mb-2">Others</p>
                        <div className="grid grid-cols-2 gap-2">
                          {['Phone', 'Free WiFi'].map((item) => (
                            <label key={item} className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer">
                              <input 
                                type="checkbox"
                                className="w-4 h-4 rounded border-[#E2E8F0] text-[#E11D48] focus:ring-[#E11D48]"
                                checked={draft.facilities.split(',').map(f => f.trim()).includes(item)}
                                onChange={(e) => {
                                  const currentList = draft.facilities.split(',').map(f => f.trim()).filter(f => f !== '');
                                  let newList;
                                  if (e.target.checked) {
                                    newList = [...currentList, item];
                                  } else {
                                    newList = currentList.filter(f => f !== item);
                                  }
                                  updateDraft(index, 'facilities', newList.join(','));
                                }}
                              />
                              {item}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div><label className="block text-xs font-semibold text-[#64748B] mb-1">Best For</label><input type="text" value={draft.customBestFor} onChange={(e) => updateDraft(index, 'customBestFor', e.target.value)} className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-xs font-semibold text-[#64748B] mb-1">Line 1</label><input type="text" value={draft.customRoomOnly} onChange={(e) => updateDraft(index, 'customRoomOnly', e.target.value)} className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]" /></div>
                      <div><label className="block text-xs font-semibold text-[#64748B] mb-1">Line 2</label><input type="text" value={draft.customPayAtHotel} onChange={(e) => updateDraft(index, 'customPayAtHotel', e.target.value)} className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]" /></div>
                      <div><label className="block text-xs font-semibold text-[#64748B] mb-1">Line 3</label><input type="text" value={draft.customNonRefundable} onChange={(e) => updateDraft(index, 'customNonRefundable', e.target.value)} className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]" /></div>
                      <div><label className="block text-xs font-semibold text-[#64748B] mb-1">Line 4</label><input type="text" value={draft.customNoBreakfast} onChange={(e) => updateDraft(index, 'customNoBreakfast', e.target.value)} className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]" /></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-4 mb-6 border-t border-[#E2E8F0] pt-4">
              <div className="flex gap-2">
                <button
                  onClick={addHotelForm}
                  disabled={drafts.length >= 3}
                  className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] px-3 py-2 rounded-lg hover:bg-white transition disabled:opacity-50"
                >
                  + Add Option
                </button>
                {drafts.length > 1 && (
                  <button
                    onClick={() => removeHotelForm(drafts.length - 1)}
                    className="text-xs bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition"
                  >
                    - Remove Last
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#E2E8F0]">
              <button onClick={() => setSelectedInquiry(null)} className="px-4 py-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition">Cancel</button>
              <button onClick={generateQuotation} disabled={loading} className="px-4 py-2 rounded-xl bg-[#E11D48] text-white font-bold hover:bg-[#BE123C] transition disabled:opacity-70 flex items-center gap-2">{loading ? 'Saving...' : <><Save size={18} /> Generate Quotation</>}</button>
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
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4">
              <p className="text-blue-700 font-bold text-sm mb-2">👤 Customer Details</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-[#64748B]">First Name:</span> <span className="font-semibold text-[#0F172A] block">{detailsInquiry.first_name || 'Not provided'}</span></div>
                <div><span className="text-[#64748B]">Last Name:</span> <span className="font-semibold text-[#0F172A] block">{detailsInquiry.last_name || 'Not provided'}</span></div>
                <div className="col-span-2"><span className="text-[#64748B]">Email:</span> <span className="font-semibold text-[#0F172A] block">{detailsInquiry.email || 'Not provided'}</span></div>
                <div className="col-span-2"><span className="text-[#64748B]">Phone:</span> <span className="font-semibold text-[#0F172A] block">{detailsInquiry.phone || 'Not provided'}</span></div>
              </div>
            </div>
            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-sm grid grid-cols-2 gap-2">
              <div><span className="text-[#64748B]">Destination:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.destination}</span></div>
              <div><span className="text-[#64748B]">Guests:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.adults} Adults · {detailsInquiry.rooms} Room(s)</span></div>
              <div><span className="text-[#64748B]">Check-in:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.check_in}</span></div>
              <div><span className="text-[#64748B]">Check-out:</span> <span className="font-semibold text-[#0F172A]">{detailsInquiry.check_out}</span></div>
            </div>
            {(() => {
              const chosen = detailsInquiry.quotations?.find((q: any) => q.is_customer_chosen === true);
              if (!chosen) return null;
              return (
                <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-xl">
                  <p className="text-green-700 font-bold text-sm mb-1">✅ Chosen Hotel</p>
                  <p className="font-bold text-[#0F172A] text-lg">
                    {chosen.hotel_name}
                  </p>
                  <div className="flex gap-4 mt-2 text-sm text-[#475569]">
                    <div>
                      <span className="text-[#64748B]">Room:</span>
                      <span className="font-medium text-[#0F172A] ml-1">{chosen.room_type || 'Standard Room'}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B]">Price:</span>
                      <span className="font-medium text-[#E11D48] ml-1">₱{chosen.new_price}/night</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-3">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `Customer: ${detailsInquiry.first_name || 'N/A'} ${detailsInquiry.last_name || 'N/A'}\n` +
                          `Email: ${detailsInquiry.email || 'N/A'}\n` +
                          `Phone: ${detailsInquiry.phone || 'N/A'}\n` +
                          `Destination: ${detailsInquiry.destination}\n` +
                          `Rooms: ${detailsInquiry.rooms}\n` +
                          `Hotel: ${chosen.hotel_name}\n` +
                          `Room Type: ${chosen.room_type || 'Standard Room'}\n` +
                          `Price: ₱${chosen.new_price}/night`
                        );
                        alert('📋 Full booking details copied to clipboard!');
                      }}
                      className="w-full bg-white border border-green-200 text-green-700 py-2 rounded-xl font-semibold hover:bg-green-50 transition"
                    >
                      Copy to Clipboard for RedSeller
                    </button>

                    <button 
                      onClick={async () => {
                        const { error } = await supabase
                          .from('quotations')
                          .update({ is_admin_confirmed: true })
                          .eq('id', chosen.id);

                        if (error) {
                          alert('❌ Error confirming booking: ' + error.message);
                        } else {
                          alert('✅ Booking marked as confirmed! The client will now see the Green confirmation state.');
                          setDetailsInquiry(null);
                          fetchInquiries();
                        }
                      }}
                      className="w-full bg-[#E11D48] text-white py-2 rounded-xl font-bold hover:bg-[#BE123C] transition"
                    >
                      Confirm Booking & Notify Client
                    </button>

                    {/* 🟢 NEW BUTTON: Finalize Booking */}
                    <button 
                      onClick={async () => {
                        const { error } = await supabase
                          .from('quotations')
                          .update({ is_redseller_booked: true })
                          .eq('id', chosen.id);

                        if (error) {
                          alert('❌ Error finalizing booking: ' + error.message);
                        } else {
                          alert('✅ Booking finalized! RedSeller email sent. The client will now see the final green "Thank you" state.');
                          setDetailsInquiry(null);
                          fetchInquiries();
                        }
                      }}
                      className="w-full bg-[#0F172A] text-white py-2 rounded-xl font-bold hover:bg-[#1E293B] transition"
                    >
                      Finalize Booking (RedSeller App Done)
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
	  
	        {/* 🟢 ADD PROPERTY MODAL */}
      {isAddPropertyOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsAddPropertyOpen(false)}
              className="absolute top-4 right-4 text-[#475569] hover:text-[#0F172A] transition"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold text-[#0F172A] mb-1">Add New Property</h2>
            <p className="text-sm text-[#64748B] mb-4">Add a new hotel to the database for future quotations.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Hotel Name *</label>
                <input 
                  type="text" 
                  value={newProperty.name}
                  onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                  placeholder="e.g. RedDoorz @ Tagaytay"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Room Type</label>
                  <input 
                    type="text" 
                    value={newProperty.room_type}
                    onChange={(e) => setNewProperty({ ...newProperty, room_type: e.target.value })}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                    placeholder="Standard Room"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] mb-1">Price / night *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={newProperty.price_per_night}
                    onChange={(e) => setNewProperty({ ...newProperty, price_per_night: e.target.value })}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                    placeholder="1389.99"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Address</label>
                <input 
                  type="text" 
                  value={newProperty.address}
                  onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white text-sm focus:outline-none focus:border-[#E11D48]"
                  placeholder="Hotel Street, City"
                />
              </div>

              {/* Facilities Checkboxes */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4">
                <label className="block text-xs font-bold text-[#64748B] mb-2">Facilities</label>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#475569]">
                  {['Chairs', 'Wardrobe', 'TV', 'AC', 'Iron', 'Bed', 'Mirror', 'Towel', 'Hot Shower', 'Hair Dryer', 'Phone', 'Free WiFi'].map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        className="w-4 h-4 rounded border-[#E2E8F0] text-[#E11D48] focus:ring-[#E11D48]"
                        checked={newProperty.facilities.split(',').map(f => f.trim()).includes(item)}
                        onChange={(e) => {
                          const currentList = newProperty.facilities.split(',').map(f => f.trim()).filter(f => f !== '');
                          let newList;
                          if (e.target.checked) {
                            newList = [...currentList, item];
                          } else {
                            newList = currentList.filter(f => f !== item);
                          }
                          setNewProperty({ ...newProperty, facilities: newList.join(',') });
                        }}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Image Upload</label>
                <div 
                  className="w-full p-4 border-2 border-dashed border-[#E2E8F0] rounded-lg bg-[#F8FAFC] hover:bg-white hover:border-[#E11D48] transition cursor-pointer text-center text-xs text-[#64748B]"
                  onClick={() => document.getElementById('add-property-file-input')?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const files = Array.from(e.dataTransfer.files);
                    if (!files.length) return;
                    
                    let newImages = newProperty.images ? newProperty.images.split(',').map(f => f.trim()) : [];
                    for (const file of files) {
                      const formData = new FormData();
                      formData.append('file', file);

                      try {
                        const res = await fetch('/api/upload-image', {
                          method: 'POST',
                          body: formData,
                        });
                        const data = await res.json();
                        if (data.url) {
                          newImages.push(data.url);
                        }
                      } catch (err) {
                        alert('Upload failed. Please try again.');
                      }
                    }
                    setNewProperty({ ...newProperty, images: newImages.join(',') });
                  }}
                >
                  <p>Drag & drop images here, or click to select</p>
                  <p className="text-[10px] text-[#94a3b8] mt-1">PNG, JPG, WEBP supported</p>
                  
                  <input 
                    type="file" 
                    id="add-property-file-input" 
                    className="hidden" 
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;

                      let newImages = newProperty.images ? newProperty.images.split(',').map(f => f.trim()) : [];
                      for (const file of files) {
                        const formData = new FormData();
                        formData.append('file', file);

                        try {
                          const res = await fetch('/api/upload-image', {
                            method: 'POST',
                            body: formData,
                          });
                          const data = await res.json();
                          if (data.url) {
                            newImages.push(data.url);
                          }
                        } catch (err) {
                          alert('Upload failed. Please try again.');
                        }
                      }
                      setNewProperty({ ...newProperty, images: newImages.join(',') });
                    }}
                  />
                </div>

                {/* 🟢 IMAGE PREVIEW */}
                {newProperty.images && newProperty.images.trim() !== '' && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newProperty.images.split(',').map((url, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#E2E8F0] bg-slate-100 group">
                        <img 
                          src={url.trim()} 
                          alt={`Uploaded ${i+1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => setIsAddPropertyOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (!newProperty.name || !newProperty.price_per_night) {
                      alert('Please fill in the Hotel Name and Price.');
                      return;
                    }
                    const { error } = await supabase.from('hotels').insert({
                      name: newProperty.name,
                      room_type: newProperty.room_type || 'Standard Room',
                      price_per_night: parseFloat(newProperty.price_per_night) || 0,
                      address: newProperty.address || '',
                      facilities: newProperty.facilities,
                      images: newProperty.images || '',
                    });
                    if (error) {
                      alert('❌ Error adding property: ' + error.message);
                    } else {
                      alert('✅ Property added successfully! It will now appear in the Auto-Suggest dropdown.');
                      setIsAddPropertyOpen(false);
                      setNewProperty({ name: '', room_type: '', price_per_night: '', address: '', facilities: 'Chairs, TV, AC, Bed, Towel, Swimming Pool, No Smoking, Car Parking, No Free Toiletries, Free Toiletries, Front Desk, Lift, Meeting room, Playground, Kitchen, 24/7 Security, CCTV,  Free WiFi', images: '' });
                      fetchHotels();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-xl bg-[#E11D48] text-white font-bold hover:bg-[#BE123C] transition"
                >
                  Add Property
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}