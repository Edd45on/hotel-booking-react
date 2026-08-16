import { createClient } from '@supabase/supabase-js';

// ✅ Connect to Supabase directly inside the function
const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // ✅ Insert into Supabase
    const { error } = await supabase
      .from('booking_requests')
      .insert({
        destination: data.destination,
        checkin: data.checkIn,
        checkout: data.checkOut,
        adults: data.adults,
        children: data.children,
        rooms: data.rooms,
        purpose: data.purpose,
        priority: data.priority,
        budget: data.budget,
        special_request: data.specialRequest
      });

    if (error) {
      console.error('Supabase Error:', error);
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}