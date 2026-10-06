'use client';

import React, { useState } from 'react';
import { Mail, MapPin, MessageSquare, Clock, Send, Flower2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useToast } from '@/context/ToastContext';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('Order Support');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast({ type: 'error', title: 'Please complete all required fields' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      showToast({
        type: 'success',
        title: 'Inquiry Dispatched',
        message: 'A Skinova concierge specialist will respond within 4 business hours.',
      });
    }, 800);
  };

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-16 sm:space-y-24">
      <Breadcrumbs items={[{ label: 'Client Concierge & Contact' }]} />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE3D9]/60 border border-[#1A1A1A]/5 text-[#1A1A1A]">
          <Flower2 className="w-3.5 h-3.5 text-[#C87D55] stroke-[1.75]" />
          <span className="text-[10px] uppercase tracking-[0.25em] font-medium">
            Personal Consultation
          </span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-[#1A1A1A]">Client Concierge</h1>
        <p className="text-sm sm:text-base text-[#1A1A1A]/70 font-light leading-relaxed">
          Whether you seek a bespoke skincare prescription, have questions regarding an existing order, or wish to explore our wholesale partnerships—we are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Contact Information & Channels */}
        <div className="lg:col-span-5 space-y-8 text-left">
          {/* WhatsApp Direct Action Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#25D366]/10 border border-[#25D366]/30 space-y-4">
            <div className="flex items-center gap-3 text-[#20BD5A]">
              <MessageSquare className="w-6 h-6" />
              <span className="font-serif text-xl font-medium text-[#1A1A1A]">Instant WhatsApp Concierge</span>
            </div>
            <p className="text-xs text-[#1A1A1A]/75 leading-relaxed font-light">
              Chat directly with our skincare advisors in Colombo for immediate order confirmation and skin consultations.
            </p>
            <a
              href="https://wa.me/94771234567"
              target="_blank"
              rel="noreferrer"
              className="inline-block w-full"
            >
              <Button variant="whatsapp" size="md" fullWidth icon={MessageSquare}>
                Chat On WhatsApp (+94 77 123 4567)
              </Button>
            </a>
          </div>

          {/* Details List */}
          <div className="bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EAE3D9]/60 flex items-center justify-center text-[#1A1A1A] shrink-0">
                <MapPin className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="space-y-1 text-xs">
                <h3 className="font-serif text-base font-medium text-[#1A1A1A]">Studio & Cleanroom Sanctuary</h3>
                <p className="text-[#1A1A1A]/70">No. 42 Lotus Road, Cinnamon Gardens</p>
                <p className="text-[#1A1A1A]/70">Colombo 07, Sri Lanka</p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-t border-[#1A1A1A]/10 pt-6">
              <div className="w-10 h-10 rounded-2xl bg-[#EAE3D9]/60 flex items-center justify-center text-[#1A1A1A] shrink-0">
                <Mail className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="space-y-1 text-xs">
                <h3 className="font-serif text-base font-medium text-[#1A1A1A]">Electronic Correspondence</h3>
                <p className="text-[#1A1A1A]/70">Client Concierge: concierge@skinova.lk</p>
                <p className="text-[#1A1A1A]/70">Partnerships: studio@skinova.lk</p>
              </div>
            </div>

            <div className="flex items-start gap-4 border-t border-[#1A1A1A]/10 pt-6">
              <div className="w-10 h-10 rounded-2xl bg-[#EAE3D9]/60 flex items-center justify-center text-[#1A1A1A] shrink-0">
                <Clock className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="space-y-1 text-xs">
                <h3 className="font-serif text-base font-medium text-[#1A1A1A]">Concierge Hours</h3>
                <p className="text-[#1A1A1A]/70">Monday – Saturday: 9:00 AM – 7:00 PM (IST)</p>
                <p className="text-[#1A1A1A]/70">Sunday: Closed for formulation cycles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="lg:col-span-7 bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-10 shadow-xs text-left">
          {isSubmitted ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#8A9A86]/20 text-[#8A9A86] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A]">Inquiry Received</h2>
              <p className="text-xs sm:text-sm text-[#1A1A1A]/70 max-w-md mx-auto leading-relaxed">
                Thank you, {name}. Your note has been routed to our Colombo concierge desk. We will be in touch shortly.
              </p>
              <div className="pt-4">
                <Button variant="outline" size="md" onClick={() => setIsSubmitted(false)}>
                  Send Another Inquiry
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <h2 className="font-serif text-2xl sm:text-3xl text-[#1A1A1A]">Send a Message</h2>
                <p className="text-xs text-[#1A1A1A]/60">Complete the form below and we will respond promptly.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Full Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kavindi Perera"
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone (Optional)"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 XXX XXXX"
                />
                <div>
                  <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70 block mb-1.5">
                    Nature of Inquiry
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A]/15 rounded-xl px-4 py-3.5 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                  >
                    <option value="Order Support">Order Support & Tracking</option>
                    <option value="Product Consultation">Personal Skincare Consultation</option>
                    <option value="Returns & Exchanges">Returns & Exchange Request</option>
                    <option value="Wholesale & Press">Wholesale, Press & Stockists</option>
                    <option value="General Inquiry">General Inquiries</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70 block">
                  Your Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe how our formulation team can assist you..."
                  className="w-full bg-white border border-[#1A1A1A]/15 rounded-xl p-4 text-xs text-[#1A1A1A] placeholder:text-[#1A1A1A]/35 outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isLoading}
                  icon={Send}
                >
                  Transmit Inquiry
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
