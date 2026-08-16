"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Handshake, Mail, Phone, MapPin, Instagram, Twitter, ArrowRight, Calendar, Menu, X, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { PaintSplash } from "@/components/PaintSplash";

// react-paystack touches `window` outside of an event handler, which breaks
// Next.js's server-side prerendering of this page. Loading it client-only
// (skipping SSR for just this widget) keeps the rest of the page statically
// prerendered.
const PaystackButton = dynamic(
  () => import("react-paystack").then(mod => mod.PaystackButton),
  { ssr: false }
);

const services = [
  { icon: "🏥", title: "SRHR Services", desc: "Sexual and Reproductive Health and Rights education and services" },
  { icon: "❤️", title: "Healthcare & Nutrition", desc: "Accessible healthcare and nutrition programs for all" },
  { icon: "📋", title: "Policy Influence", desc: "Advocating for policy changes that benefit communities" },
  { icon: "📚", title: "Girl Child Education", desc: "Empowering girls through quality education" },
  { icon: "🎓", title: "Mentorship", desc: "Capacity building and mentorship programs" },
  { icon: "🌍", title: "Community Health", desc: "Community-led health initiatives and awareness" },
];

function formatNaira(value: string | number | null | undefined) {
  const num = Number(value ?? 0);
  if (Number.isNaN(num)) return "₦0";
  return `₦${num.toLocaleString()}`;
}

function formatEventDate(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<"contact" | "donation" | "volunteer" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    amount: "",
    skills: "",
  });

  const { data: campaigns = [], isLoading: campaignsLoading } = trpc.content.getCampaigns.useQuery();
  const { data: events = [], isLoading: eventsLoading } = trpc.content.getEvents.useQuery();

  const submitContact = trpc.forms.submitContact.useMutation({
    onSuccess: () => {
      toast.success("Thank you for reaching out! We'll be in touch soon.");
      setFormData({ name: "", email: "", message: "", amount: "", skills: "" });
      setActiveForm(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit. Please try again.");
    },
  });

  const submitDonation = trpc.forms.submitDonation.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your generous donation!");
      setFormData({ name: "", email: "", message: "", amount: "", skills: "" });
      setActiveForm(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit. Please try again.");
    },
  });

  const submitVolunteer = trpc.forms.submitVolunteer.useMutation({
    onSuccess: () => {
      toast.success("Thank you for volunteering! We'll contact you soon.");
      setFormData({ name: "", email: "", message: "", amount: "", skills: "" });
      setActiveForm(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit. Please try again.");
    },
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate({
      name: formData.name,
      email: formData.email,
      message: formData.message,
    });
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
  };

  const paystackConfig = {
    reference: `CHAFHEIN-${Date.now()}`,
    email: formData.email,
    amount: parseInt(formData.amount || '0') * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_d62a19c25a9338eb2d7009f86eb1ebc35abcdbb8',
  };

  const handlePaystackSuccess = (reference: any) => {
    submitDonation.mutate({
      amount: formData.amount,
      donorName: formData.name,
      donorEmail: formData.email,
      message: formData.message,
    });
    toast.success(`Payment successful! Reference: ${reference.reference}`);
    setFormData({ name: '', email: '', message: '', amount: '', skills: '' });
    setActiveForm(null);
  };

  const handlePaystackClose = () => {
    toast.error('Payment window closed');
  };

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVolunteer.mutate({
      name: formData.name,
      email: formData.email,
      skills: formData.skills,
      message: formData.message,
    });
  };

  // Opens the given form and scrolls the contact section into view so the
  // form is actually visible, instead of only flipping React state.
  const openForm = (form: "contact" | "donation" | "volunteer", prefillMessage?: string) => {
    setFormData((prev) => ({ ...prev, message: prefillMessage ?? prev.message }));
    setActiveForm(form);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }

        .group:hover .group-hover\\:translate-x-1 {
          transform: translateX(4px);
          transition: transform 0.3s ease;
        }

        button:active {
          transform: scale(0.97);
          transition: transform 0.1s ease;
        }

        .card-hover {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(124, 58, 237, 0.18);
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-brand-cream-deep animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CHAFHEIN" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-serif font-bold bg-gradient-to-r from-accent to-brand-gold bg-clip-text text-transparent">
              CHAFHEIN
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            <a href="#home" className="text-foreground hover:text-accent transition duration-300">Home</a>
            <a href="#about" className="text-foreground hover:text-accent transition duration-300">About</a>
            <a href="#services" className="text-foreground hover:text-accent transition duration-300">Services</a>
            <a href="#campaigns" className="text-foreground hover:text-accent transition duration-300">Campaigns</a>
            <a href="#events" className="text-foreground hover:text-accent transition duration-300">Events</a>
            <a href="#contact" className="text-foreground hover:text-accent transition duration-300">Contact</a>
          </div>

          <Button onClick={() => openForm("donation")} className="hidden md:inline-flex bg-accent hover:bg-brand-orange-dark text-accent-foreground">
            Donate Now
          </Button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-brand-cream-deep rounded-lg transition duration-300"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-accent" />
            ) : (
              <Menu className="w-6 h-6 text-accent" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-brand-cream-deep animate-fade-in-up">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-foreground hover:text-accent hover:bg-brand-cream-deep px-4 py-2 rounded-lg transition duration-300"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-foreground hover:text-accent hover:bg-brand-cream-deep px-4 py-2 rounded-lg transition duration-300"
              >
                About
              </a>
              <a
                href="#services"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-foreground hover:text-accent hover:bg-brand-cream-deep px-4 py-2 rounded-lg transition duration-300"
              >
                Services
              </a>
              <a
                href="#campaigns"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-foreground hover:text-accent hover:bg-brand-cream-deep px-4 py-2 rounded-lg transition duration-300"
              >
                Campaigns
              </a>
              <a
                href="#events"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-foreground hover:text-accent hover:bg-brand-cream-deep px-4 py-2 rounded-lg transition duration-300"
              >
                Events
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-foreground hover:text-accent hover:bg-brand-cream-deep px-4 py-2 rounded-lg transition duration-300"
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-cream-deep via-white to-brand-cream animate-fade-in-up">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 animate-slide-in-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-foreground leading-tight">
              Let's Build The <span className="brand-mark">Better World</span> Together
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Connected Hands for Family Health and Empowerment Initiative (CHAFHEIN) is a youth-led, non-profit organization dedicated to creating sustainable change through healthcare, education, and community empowerment.
            </p>
            <p className="text-base sm:text-lg text-accent font-semibold">
              Our Mission: To empower communities through accessible healthcare, quality education, and sustainable development initiatives.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button onClick={() => openForm("donation")} className="bg-accent hover:bg-brand-orange-dark text-accent-foreground px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg">
                Donate Now
              </Button>
              <Button onClick={() => openForm("volunteer")} variant="outline" className="border-accent text-accent hover:bg-brand-cream-deep px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg">
                Volunteer
              </Button>
              <Button onClick={() => openForm("contact")} variant="outline" className="border-brand-green-dark text-brand-green-dark hover:bg-brand-cream-deep px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg">
                Partner With Us
              </Button>
            </div>
          </div>
          <div className="relative animate-slide-in-right pb-8 sm:pb-0">
            <PaintSplash color="gold" className="absolute -top-8 -right-6 h-20 w-24 opacity-70 -z-10" />
            <PaintSplash color="purple" className="absolute -bottom-6 -left-6 h-16 w-20 opacity-30 -z-10" />
            <div className="relative bg-gradient-to-br from-brand-ink to-brand-orange-dark rounded-3xl p-12 text-center overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 0, transparent 40%)" }} />
              <div className="relative text-6xl mb-4">🤝</div>
              <p className="relative text-accent-foreground font-serif text-xl font-semibold">Empowering Communities Across Nigeria</p>
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 bg-white rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 border border-border">
              <span className="text-3xl font-serif font-bold text-accent">300+</span>
              <span className="text-sm text-muted-foreground leading-tight">People<br />Reached</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white animate-fade-in-up delay-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-4 sm:space-y-6 animate-slide-in-left">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-brand-gold" />
              <span className="text-sm font-semibold tracking-wide text-accent uppercase">Know About Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">About CHAFHEIN</h2>
            <div className="space-y-4 text-base sm:text-lg text-foreground/80 leading-relaxed">
              <p>
                <strong className="text-accent">Connected Hands for Family Health and Empowerment Initiative (CHAFHEIN)</strong> is a youth-led, non-profit organization committed to creating sustainable change in communities across Nigeria.
              </p>
              <p>
                We believe that every individual deserves access to quality healthcare, education, and opportunities for personal development. Our work focuses on bridging the gap between healthcare access, education, and community empowerment.
              </p>
              <p>
                Through our integrated approach, we address critical issues including sexual and reproductive health rights, healthcare accessibility, nutrition, policy advocacy, girl child education, and community capacity building.
              </p>
            </div>
            <Button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} className="bg-accent hover:bg-brand-orange-dark text-accent-foreground">
              Learn More <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="relative animate-slide-in-right">
            <PaintSplash color="purple" className="absolute -top-8 -left-6 h-16 w-20 opacity-40 -z-10" />
            <div className="relative bg-gradient-to-br from-brand-cream-deep to-white border border-border rounded-3xl p-10 sm:p-14 flex flex-col items-center text-center gap-4">
              <img src="/logo.png" alt="" aria-hidden="true" className="h-24 w-24 object-contain" />
              <p className="font-serif text-xl font-semibold text-foreground">Youth-Led. Community-Driven.</p>
              <p className="text-muted-foreground">Working across Abuja and beyond to bridge healthcare, education, and empowerment gaps.</p>
            </div>
            <div className="absolute -bottom-5 right-4 bg-white rounded-full shadow-xl p-3 border border-border">
              <ShieldCheck className="w-8 h-8 text-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-cream-deep to-white animate-fade-in-up delay-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold tracking-wide text-accent uppercase mb-2">What We Do</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Our Services</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, i) => (
              <Card key={i} className="card-hover border-border hover:border-accent animate-scale-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <CardHeader>
                  <div className="h-14 w-14 rounded-full bg-brand-cream-deep flex items-center justify-center text-3xl mb-2">
                    {service.icon}
                  </div>
                  <CardTitle className="text-accent">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.desc}</p>
                  <button
                    onClick={() => openForm("contact")}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:text-brand-orange-dark group"
                  >
                    See how you can help
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-10">
            <Button onClick={() => openForm("contact")} variant="outline" className="border-accent text-accent hover:bg-brand-cream-deep">
              Get In Touch About Our Work <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white animate-fade-in-up delay-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold tracking-wide text-accent uppercase mb-2">Campaigns</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Together For Change: Join Our Mission</h2>
          </div>

          {campaignsLoading ? (
            <p className="text-center text-muted-foreground">Loading campaigns…</p>
          ) : campaigns.length === 0 ? (
            <Card className="max-w-2xl mx-auto text-center border-border">
              <CardContent className="pt-6 flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-brand-cream-deep flex items-center justify-center">
                  <Heart className="w-8 h-8 text-accent" />
                </div>
                <p className="text-foreground font-semibold">New campaigns are launching soon</p>
                <p className="text-muted-foreground">
                  We're preparing our next round of fundraising campaigns. In the meantime, your donation still goes straight toward our ongoing healthcare, education, and empowerment work.
                </p>
                <Button onClick={() => openForm("donation")} className="bg-accent hover:bg-brand-orange-dark text-accent-foreground">
                  Donate Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {campaigns.map((campaign, i) => {
                const target = Number(campaign.targetAmount ?? 0);
                const raised = Number(campaign.raisedAmount ?? 0);
                const progress = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : null;
                return (
                  <Card key={campaign.id} className="card-hover border-border hover:border-accent animate-scale-in overflow-hidden pt-0" style={{ animationDelay: `${i * 0.1}s` }}>
                    {campaign.imageUrl ? (
                      <img src={campaign.imageUrl} alt="" className="h-44 w-full object-cover" />
                    ) : (
                      <div className="h-44 w-full bg-gradient-to-br from-brand-ink to-brand-orange-dark flex items-center justify-center">
                        <Heart className="w-12 h-12 text-accent-foreground/90" />
                      </div>
                    )}
                    <CardHeader>
                      <span className="inline-block w-fit text-xs font-semibold uppercase tracking-wide text-accent bg-brand-cream-deep px-2 py-1 rounded-full">
                        {campaign.status}
                      </span>
                      <CardTitle>{campaign.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {campaign.description && (
                        <p className="text-muted-foreground line-clamp-3">{campaign.description}</p>
                      )}
                      {progress !== null && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{formatNaira(raised)} raised</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-brand-cream-deep overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-accent to-brand-gold" style={{ width: `${progress}%` }} />
                          </div>
                          <p className="text-xs text-muted-foreground">Goal: {formatNaira(target)}</p>
                        </div>
                      )}
                      <Button onClick={() => openForm("donation", `Supporting campaign: ${campaign.title}`)} className="w-full bg-accent hover:bg-brand-orange-dark text-accent-foreground">
                        Donate Now <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-cream-deep to-white animate-fade-in-up delay-400">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold tracking-wide text-accent uppercase mb-2">Get Involved</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Join Our Mission To Make A Difference</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { title: "Become a Volunteer", desc: "Join our team and make a direct impact in communities", icon: Users, form: "volunteer" as const },
              { title: "Donate to Support", desc: "Your donation helps us reach more people and create lasting change", icon: Heart, form: "donation" as const },
              { title: "Become a Partner", desc: "Partner with us to amplify our impact and reach", icon: Handshake, form: "contact" as const },
            ].map((item, i) => (
              <Card key={i} className="card-hover border-border hover:border-accent animate-scale-in overflow-hidden pt-0" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="h-32 w-full bg-gradient-to-br from-brand-ink to-brand-orange-dark flex items-center justify-center">
                  <item.icon className="w-12 h-12 text-accent-foreground" />
                </div>
                <CardHeader>
                  <CardTitle className="text-accent">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{item.desc}</p>
                  <Button onClick={() => openForm(item.form)} className="w-full bg-accent hover:bg-brand-orange-dark text-accent-foreground">
                    Learn More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white animate-fade-in-up delay-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold tracking-wide text-accent uppercase mb-2">What's Next</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Upcoming Events</h2>
          </div>
          {eventsLoading ? (
            <p className="text-center text-muted-foreground">Loading events…</p>
          ) : events.length === 0 ? (
            <Card className="max-w-2xl mx-auto text-center border-border">
              <CardContent className="pt-6 flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-brand-cream-deep flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-accent" />
                </div>
                <p className="text-foreground font-semibold">No events scheduled right now</p>
                <p className="text-muted-foreground">
                  Check back soon for upcoming events, or follow us on social media for the latest updates.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {events.map((event) => (
                <Card key={event.id} className="card-hover border-border hover:border-brand-gold animate-scale-in overflow-hidden pt-0">
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt="" className="aspect-video w-full object-cover" />
                  ) : (
                    <div className="relative aspect-video w-full bg-gradient-to-br from-brand-ink to-brand-orange-dark flex items-center justify-center">
                      <Calendar className="w-10 h-10 text-accent-foreground/90" />
                    </div>
                  )}
                  <CardHeader>
                    <span className="inline-block w-fit text-xs font-semibold uppercase tracking-wide text-accent bg-brand-cream-deep px-2 py-1 rounded-full">
                      {formatEventDate(event.eventDate)}
                    </span>
                    <CardTitle>{event.title}</CardTitle>
                    {event.location && (
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {event.location}
                      </CardDescription>
                    )}
                  </CardHeader>
                  {event.description && (
                    <CardContent>
                      <p className="text-muted-foreground">{event.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-ink to-brand-orange-dark overflow-hidden animate-fade-in-up delay-600">
        <PaintSplash color="gold" className="absolute -top-6 left-10 h-20 w-24 opacity-30 -z-0" />
        <PaintSplash color="purpleDark" className="absolute -bottom-8 right-16 h-24 w-28 opacity-30 -z-0" />
        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-accent-foreground">Ready to Make a Difference?</h2>
          <p className="text-accent-foreground/90 text-lg">
            Every hand counts. Join us as a volunteer or make a donation to help us reach more families across Nigeria.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => openForm("volunteer")} className="bg-white text-accent hover:bg-brand-cream-deep px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg">
              Join as a Volunteer
            </Button>
            <Button onClick={() => openForm("donation")} variant="outline" className="border-white text-accent-foreground hover:bg-white/10 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg">
              Donate
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white animate-fade-in-up delay-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6 sm:space-y-8 animate-slide-in-left">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground">Get In Touch</h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-4">
                <div className="h-11 w-11 rounded-full bg-brand-cream-deep flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Address</h3>
                  <p className="text-muted-foreground">Asokoro, Abuja, Nigeria</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-11 w-11 rounded-full bg-brand-cream-deep flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <a href="mailto:info@chafhein.ng" className="text-accent hover:text-brand-orange-dark">info@chafhein.ng</a>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-11 w-11 rounded-full bg-brand-cream-deep flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Phone</h3>
                  <a href="tel:+2348166265367" className="text-accent hover:text-brand-orange-dark">+234 816 626 5367</a>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <a href="https://instagram.com" className="h-11 w-11 rounded-full bg-brand-cream-deep flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://twitter.com" className="h-11 w-11 rounded-full bg-brand-cream-deep flex items-center justify-center text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="animate-slide-in-right">
            {activeForm === "contact" && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-2xl sm:text-3xl">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-3 sm:space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <textarea
                      placeholder="Your Message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent h-32"
                      required
                    />
                    <Button type="submit" className="w-full bg-accent hover:bg-brand-orange-dark text-accent-foreground" disabled={submitContact.isPending}>
                      {submitContact.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {activeForm === "donation" && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Make a Donation</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDonationSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Donation Amount (NGN)"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <textarea
                      placeholder="Message (optional)"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent h-20"
                    />
                    <PaystackButton
                      text="Donate Now"
                      className="w-full bg-accent hover:bg-brand-orange-dark text-accent-foreground px-4 py-2 rounded-lg font-semibold transition duration-300"
                      {...paystackConfig}
                      onSuccess={handlePaystackSuccess}
                      onClose={handlePaystackClose}
                    />
                  </form>
                </CardContent>
              </Card>
            )}

            {activeForm === "volunteer" && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>Become a Volunteer</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Your Skills"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent"
                    />
                    <textarea
                      placeholder="Why do you want to volunteer?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-accent h-20"
                    />
                    <Button type="submit" className="w-full bg-accent hover:bg-brand-orange-dark text-accent-foreground" disabled={submitVolunteer.isPending}>
                      {submitVolunteer.isPending ? "Submitting..." : "Apply Now"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {!activeForm && (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground text-lg">Select a form to get started</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-ink text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="CHAFHEIN" className="h-9 w-9 object-contain" />
              <span className="text-xl font-serif font-bold">CHAFHEIN</span>
            </div>
            <p className="text-white/70 text-sm">
              Connected Hands for Family Health and Empowerment Initiative: a youth-led non-profit creating lasting change through healthcare, education, and community empowerment.
            </p>
          </div>
          <div>
            <h3 className="font-serif font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li><a href="#home" className="hover:text-brand-gold transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-brand-gold transition-colors">About</a></li>
              <li><a href="#services" className="hover:text-brand-gold transition-colors">Services</a></li>
              <li><a href="#campaigns" className="hover:text-brand-gold transition-colors">Campaigns</a></li>
              <li><a href="#events" className="hover:text-brand-gold transition-colors">Events</a></li>
              <li><a href="#contact" className="hover:text-brand-gold transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li>Asokoro, Abuja, Nigeria</li>
              <li><a href="mailto:info@chafhein.ng" className="hover:text-brand-gold transition-colors">info@chafhein.ng</a></li>
              <li><a href="tel:+2348166265367" className="hover:text-brand-gold transition-colors">+234 816 626 5367</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a href="https://instagram.com" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-ink transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-gold hover:text-brand-ink transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 mt-12 pt-6 text-center">
          <p className="text-white/60 text-sm">&copy; 2026 Connected Hands for Family Health and Empowerment Initiative (CHAFHEIN). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
