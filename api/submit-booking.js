export default async function handler(req, res) {
  // 🟢 ADD THIS LINE TO BYPASS VERCEL'S 401 SECURITY
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const data = req.body;

    // Grab env variables directly from Vercel
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ error: 'Missing Supabase credentials' });
    }

    // 🔥 FIXED: Sending data exactly as Supabase expects
    const response = await fetch(`${supabaseUrl}/rest/v1/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal'
      },
        body: JSON.stringify({
        destination: data.destination,
        check_in: data.checkIn,         // ✅ Added underscore to match your table
        check_out: data.checkOut,       // ✅ Added underscore to match your table
        adults: parseInt(data.adults),
        children: parseInt(data.children),
        rooms: parseInt(data.rooms),
        purpose: data.purpose,
        priority: data.priority,
        budget: data.budget,
        special_request: data.specialRequest
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase Error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('API Crash:', error);
    return res.status(500).json({ error: error.message });
  }
}