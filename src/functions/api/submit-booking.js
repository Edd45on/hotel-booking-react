export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const data = await request.json();
    
    await env.hotel_booking_db.prepare(`
      INSERT INTO booking_requests 
      (destination, checkin, checkout, adults, children, rooms, purpose, priority, budget, special_request)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.destination,
      data.checkIn,
      data.checkOut,
      data.adults,
      data.children,
      data.rooms,
      data.purpose,
      data.priority,
      data.budget,
      data.specialRequest
    ).run();

    return new Response(JSON.stringify({ 
      message: "Booking saved successfully!" 
    }), { 
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ 
      error: "Failed to save booking request" 
    }), { 
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}