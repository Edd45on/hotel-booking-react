import { MessageSquare, Search, FileText, CheckCircle, ShieldCheck } from 'lucide-react';

const steps = [
  { id: 1, title: "Tell us what you need", desc: "Share your destination, travel dates, guests, and budget.", icon: MessageSquare },
  { id: 2, title: "We check available options", desc: "We search our inventory for hotels that match your specific criteria.", icon: Search },
  { id: 3, title: "Receive your quotation", desc: "We send you up to 3 suitable hotel options with clear pricing.", icon: FileText },
  { id: 4, title: "Choose your hotel", desc: "Review the proposals and select the option that works best for you.", icon: CheckCircle },
  { id: 5, title: "We process your booking", desc: "We handle the reservation and you receive your final confirmation.", icon: ShieldCheck }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0F172A] mb-4">How It Works</h2>
          <p className="text-lg text-[#475569]">Simple, personal, and hassle-free.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step) => (
            <div key={step.id} className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0] hover:border-[#E11D48] transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-[#FFF1F2] text-[#E11D48] rounded-xl flex items-center justify-center mb-4">
                <step.icon size={24} />
              </div>
              <h3 className="font-bold text-[#0F172A] text-lg mb-2">{step.title}</h3>
              <p className="text-[#475569] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}