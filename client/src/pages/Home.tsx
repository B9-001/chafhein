import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Users, Handshake, Mail, Phone, MapPin, Instagram, Twitter, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  const [activeForm, setActiveForm] = useState<"contact" | "donation" | "volunteer" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    amount: "",
    skills: "",
  });

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
    submitDonation.mutate({
      amount: formData.amount,
      donorName: formData.name,
      donorEmail: formData.email,
      message: formData.message,
    });
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
            box-shadow: 0 0 0 0 rgba(97, 153, 39, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(97, 153, 39, 0);
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
          box-shadow: 0 20px 40px rgba(97, 153, 39, 0.15);
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-green-100 animate-fade-in-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
            CHAFHEI
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#home" className="text-gray-700 hover:text-green-700 transition duration-300">Home</a>
            <a href="#about" className="text-gray-700 hover:text-green-700 transition duration-300">About</a>
            <a href="#services" className="text-gray-700 hover:text-green-700 transition duration-300">Services</a>
            <a href="#contact" className="text-gray-700 hover:text-green-700 transition duration-300">Contact</a>
          </div>
          {user && user.role === 'admin' && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-50">
                Admin Dashboard
              </Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-green-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-200"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-6xl sm:text-7xl font-bold text-gray-900 mb-6 animate-fade-in-up leading-tight">
            Let's Build The Better World Together
          </h1>
          <p className="text-xl text-gray-600 mb-4 animate-fade-in-up delay-100">
            Connected Hands for Family Health and Empowerment Initiative (CHAFHEI)
          </p>
          <p className="text-lg text-gray-700 mb-10 leading-relaxed animate-fade-in-up delay-200 max-w-2xl mx-auto">
            We are dedicated to ensuring that every child has the opportunity to thrive and reach their full potential. That's why we work tirelessly to provide access to critical health services for mothers, newborns, and children in underserved communities around the country.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
            <Button
              size="lg"
              className="bg-green-700 hover:bg-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              onClick={() => setActiveForm("donation")}
            >
              <Heart className="mr-2 h-5 w-5 group-hover:animate-pulse" /> Donate Funds
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => setActiveForm("volunteer")}
            >
              <Users className="mr-2 h-5 w-5" /> Become a Volunteer
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 shadow-md hover:shadow-lg transition-all duration-300"
              onClick={() => setActiveForm("contact")}
            >
              <Handshake className="mr-2 h-5 w-5" /> Become a Partner
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-4 animate-fade-in-up">Our Services</h2>
          <p className="text-center text-gray-600 mb-16 text-lg animate-fade-in-up delay-100">
            Comprehensive programs designed to empower communities and improve lives
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "SRHR Services",
                description: "Providing access to sexual and reproductive health rights information and products, especially for girls and young people.",
                icon: Heart,
                delay: 0,
              },
              {
                title: "Healthcare & Nutrition",
                description: "Providing access to healthcare services and nutrition in underserved communities.",
                icon: Users,
                delay: 1,
              },
              {
                title: "Policy Influence",
                description: "Designing human-centric approaches to influence policies that protect health and wellbeing.",
                icon: Handshake,
                delay: 2,
              },
              {
                title: "Girl Child Education",
                description: "Raising awareness and empowering the girl child by promoting gender equality.",
                icon: Users,
                delay: 3,
              },
              {
                title: "Mentorship & Capacity Building",
                description: "Offering mentorships and capacity building programmes for individuals and organizations.",
                icon: Heart,
                delay: 4,
              },
              {
                title: "Community Health",
                description: "Bridging the gap between underserved communities and ideal healthcare services.",
                icon: Handshake,
                delay: 5,
              },
            ].map((service, idx) => {
              const Icon = service.icon;
              return (
                <Card
                  key={idx}
                  className={`border border-green-200 card-hover animate-fade-in-up delay-${service.delay * 100}`}
                  style={{ animationDelay: `${service.delay * 0.1}s` }}
                >
                  <CardHeader>
                    <Icon className="h-10 w-10 text-green-700 mb-3" />
                    <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-8 animate-fade-in-up">About Us</h2>
          <div className="bg-white p-10 rounded-2xl border border-green-200 card-hover animate-fade-in-up delay-100">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed font-semibold text-green-700">
              Connected Hands for Family Health and Empowerment Initiative (CHAFHEI)
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              We are a youth-led, non-profit organization dedicated to improving reproductive, maternal, newborn, adolescent, and child health and nutrition, as well as promoting girl child education in Nigeria and Africa at large through the power of collective efforts.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We have founded four projects reaching over 300 people in Nigeria, and we continue to expand our impact across underserved communities. Our mission is to ensure that every child has the opportunity to thrive and reach their full potential.
            </p>
          </div>
        </div>
      </section>

      {/* Get Involved Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-4 animate-fade-in-up">Let Make A Difference Today</h2>
          <p className="text-center text-gray-600 mb-16 text-lg animate-fade-in-up delay-100">
            Join us in creating meaningful change in communities
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Become A Volunteer",
                description: "Join our team and make a direct impact in your community. Share your skills and passion with us.",
                icon: Users,
                action: () => setActiveForm("volunteer"),
                delay: 0,
              },
              {
                title: "Donate To Support",
                description: "Your donation directly supports our programs and services in underserved communities.",
                icon: Heart,
                action: () => setActiveForm("donation"),
                delay: 1,
              },
              {
                title: "Become A Partner",
                description: "Partner with us to amplify our impact and reach more communities in need.",
                icon: Handshake,
                action: () => setActiveForm("contact"),
                delay: 2,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card
                  key={idx}
                  className={`border-2 border-green-300 card-hover animate-fade-in-up delay-${item.delay * 100}`}
                  style={{ animationDelay: `${item.delay * 0.1}s` }}
                >
                  <CardHeader className="text-center">
                    <Icon className="h-14 w-14 text-green-700 mx-auto mb-3" />
                    <CardTitle className="text-2xl text-gray-900">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {item.description}
                    </p>
                    <Button
                      className="bg-green-700 hover:bg-green-800 w-full text-white transition-all duration-300 transform hover:scale-105"
                      onClick={item.action}
                    >
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Campaigns Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-4 animate-fade-in-up">Our Recent Campaigns</h2>
          <p className="text-center text-gray-600 mb-16 text-lg animate-fade-in-up delay-100">
            We've founded four projects for over 300 people in Nigeria
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Healthcare Access Initiative",
                description: "Bringing essential healthcare services to remote communities",
                delay: 0,
              },
              {
                title: "Girl Child Education Program",
                description: "Empowering young girls through education and mentorship",
                delay: 1,
              },
              {
                title: "Maternal Health Campaign",
                description: "Supporting mothers and newborns with critical health services",
                delay: 2,
              },
              {
                title: "Community Empowerment Project",
                description: "Building capacity and leadership in underserved areas",
                delay: 3,
              },
            ].map((campaign, idx) => (
              <Card
                key={idx}
                className={`border border-green-200 card-hover animate-fade-in-up delay-${campaign.delay * 100}`}
                style={{ animationDelay: `${campaign.delay * 0.1}s` }}
              >
                <CardHeader>
                  <CardTitle className="text-gray-900">{campaign.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{campaign.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-gray-900 mb-16 animate-fade-in-up">Get In Touch</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="animate-slide-in-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4 group cursor-pointer">
                  <MapPin className="h-6 w-6 text-green-700 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600">Asokoro, Abuja, Nigeria</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group cursor-pointer">
                  <Mail className="h-6 w-6 text-green-700 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <a href="mailto:info@chafhein.ng" className="text-green-700 hover:text-green-800 transition duration-300">
                      info@chafhein.ng
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4 group cursor-pointer">
                  <Phone className="h-6 w-6 text-green-700 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <a href="tel:+2348166265367" className="text-green-700 hover:text-green-800 transition duration-300">
                      +234 816 626 5367
                    </a>
                  </div>
                </div>
                <div className="pt-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Follow Us</h4>
                  <div className="flex gap-4">
                    <a
                      href="https://www.instagram.com/Chafhein"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-green-700 transition duration-300 transform hover:scale-110"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                    <a
                      href="https://twitter.com/Chafhein"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-green-700 transition duration-300 transform hover:scale-110"
                    >
                      <Twitter className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="animate-slide-in-right">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Send Us a Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition duration-300 bg-green-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition duration-300 bg-green-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent transition duration-300 bg-green-50"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-700 hover:bg-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  disabled={submitContact.isPending}
                >
                  {submitContact.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Forms */}
      {activeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in-up">
          <Card className="w-full max-w-md shadow-2xl animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-green-200">
              <CardTitle className="text-gray-900">
                {activeForm === "donation" && "Make a Donation"}
                {activeForm === "volunteer" && "Become a Volunteer"}
                {activeForm === "contact" && "Partner With Us"}
              </CardTitle>
              <button
                onClick={() => setActiveForm(null)}
                className="text-gray-500 hover:text-gray-700 transition duration-300 text-2xl"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              {activeForm === "donation" && (
                <form onSubmit={handleDonationSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Donation Amount</label>
                    <input
                      type="text"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="e.g., 5000 NGN"
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-700 hover:bg-green-800 text-white transition-all duration-300 transform hover:scale-105"
                    disabled={submitDonation.isPending}
                  >
                    {submitDonation.isPending ? "Processing..." : "Donate Now"}
                  </Button>
                </form>
              )}

              {activeForm === "volunteer" && (
                <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skills (Optional)</label>
                    <input
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                      placeholder="e.g., Healthcare, Education, Administration"
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-700 hover:bg-green-800 text-white transition-all duration-300 transform hover:scale-105"
                    disabled={submitVolunteer.isPending}
                  >
                    {submitVolunteer.isPending ? "Submitting..." : "Sign Up"}
                  </Button>
                </form>
              )}

              {activeForm === "contact" && (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Partnership Proposal</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent bg-green-50"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-700 hover:bg-green-800 text-white transition-all duration-300 transform hover:scale-105"
                    disabled={submitContact.isPending}
                  >
                    {submitContact.isPending ? "Sending..." : "Send Proposal"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-lg mb-4 text-green-400">CHAFHEI</h4>
              <p className="text-gray-400 text-sm leading-relaxed">Connected Hands for Family Health and Empowerment Initiative</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-green-400">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#home" className="hover:text-green-400 transition duration-300">Home</a></li>
                <li><a href="#about" className="hover:text-green-400 transition duration-300">About</a></li>
                <li><a href="#services" className="hover:text-green-400 transition duration-300">Services</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-green-400">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="mailto:info@chafhein.ng" className="hover:text-green-400 transition duration-300">info@chafhein.ng</a></li>
                <li><a href="tel:+2348166265367" className="hover:text-green-400 transition duration-300">+234 816 626 5367</a></li>
                <li>Asokoro, Abuja, Nigeria</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-green-400">Follow Us</h4>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/Chafhein" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition duration-300 transform hover:scale-110">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://twitter.com/Chafhein" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition duration-300 transform hover:scale-110">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Connected Hands for Family Health and Empowerment Initiative. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
