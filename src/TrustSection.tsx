import { User, Wallet, ListChecks, CreditCard } from 'lucide-react';

const points = [
  { title: "Talk to a real person", desc: "Get help choosing the right hotel for your trip.", icon: User },
  { title: "Options matched to your budget", desc: "We look for suitable choices based on your needs.", icon: Wallet },
  { title: "No complicated booking process", desc: "Tell us what you need. We handle the hotel search and booking process.", icon: ListChecks },
  { title: "Pay at the hotel", desc: "Where available, choose properties with pay-at-hotel options.", icon: CreditCard }
];

export default function TrustSection() {
  return (
    <section className="py-20 bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-[#0F172A] text-center mb-12">Why book with us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {points.map((p, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-[#E2E8F0] text-center hover:border-[#E11D48] transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-[#E11D48] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                <p.icon size={24} />
              </div>
              <h3 className="font-bold text-[#0F172A] text-lg mb-2">{p.title}</h3>
              <p className="text-[#475569] text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}