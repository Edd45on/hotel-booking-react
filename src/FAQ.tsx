import { useState } from 'react';

const faqs = [
  { q: "Do you book hotels outside Metro Manila?", a: "Yes. We assist with hotel bookings across the Philippines, subject to available inventory." },
  { q: "Can I request a specific hotel?", a: "Yes, you can indicate your preferred property in the inquiry form." },
  { q: "Do you provide several options?", a: "Depending on availability, we can provide multiple suitable options based on your destination, dates and budget." },
  { q: "Is the quotation a confirmed booking?", a: "No. The quotation is a proposal based on current availability/rates. The booking becomes confirmed only after the booking process is completed." },
  { q: "How do I pay?", a: "Payment methods depend on the specific hotel and rate you choose. In most cases, you can pay directly at the hotel upon check-in using cash or credit card." },
  { q: "Can I cancel or change my booking?", a: "Cancellation and change policies vary by property and the rate you select. We will provide the specific cancellation policy in your quotation." }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-[#0F172A] text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-[#E2E8F0] rounded-xl overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex justify-between items-center p-5 bg-[#F8FAFC] text-left font-semibold text-[#0F172A] hover:bg-[#F1F5F9] transition">
                {faq.q}
                <span className="text-2xl">{openIndex === i ? '−' : '+'}</span>
              </button>
              <div className={`px-5 transition-all duration-300 ${openIndex === i ? 'py-5 max-h-40' : 'max-h-0 overflow-hidden'}`}>
                <p className="text-[#475569]">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}