import { Link } from "react-router-dom";
import { Search, MapPin, Layout, MessageSquare, CreditCard, ShoppingBag, Briefcase, Globe, BarChart } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";

export function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 md:pt-20 pb-20 sm:pb-28 text-center">
        {/* Floating Icons - hidden on mobile for clean look */}
        <div className="hidden lg:block">
          <div className="absolute top-10 left-20 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-blue-500 animate-bounce" style={{ animationDuration: '3s' }}><Layout className="w-5 h-5" /></div>
          <div className="absolute top-1/2 left-10 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-green-500 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}><MessageSquare className="w-5 h-5" /></div>
          <div className="absolute bottom-24 left-28 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-blue-800 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}><CreditCard className="w-5 h-5" /></div>
          <div className="absolute top-10 right-28 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-red-500 animate-bounce" style={{ animationDuration: '3.2s', animationDelay: '0.2s' }}><Globe className="w-5 h-5" /></div>
          <div className="absolute top-1/2 right-10 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-red-600 animate-bounce" style={{ animationDuration: '4.1s', animationDelay: '1.2s' }}><Briefcase className="w-5 h-5" /></div>
          <div className="absolute bottom-24 right-36 w-11 h-11 bg-white shadow-lg rounded-xl flex items-center justify-center text-green-600 animate-bounce" style={{ animationDuration: '3.8s', animationDelay: '0.8s' }}><ShoppingBag className="w-5 h-5" /></div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-medium text-xs mb-6">
          1000+ Job listed here
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight text-slate-900 mb-5 max-w-3xl mx-auto leading-[1.1]">
          Job search for people<br className="hidden sm:block" /> passionate about startup
        </h1>

        <p className="text-base sm:text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
          Jobplotter is the intelligent way to navigate the modern job market. Plot your path to the perfect role with data-driven matches and ATS-ready resumes.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-[0_4px_24px_rgb(0,0,0,0.06)] p-1.5 flex flex-col sm:flex-row items-center border border-slate-100">
          <div className="flex-1 flex items-center px-3 py-2.5 w-full border-b sm:border-b-0 sm:border-r border-slate-200">
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input type="text" placeholder="Job title or keyword" className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400" />
          </div>
          <div className="flex-1 flex items-center px-3 py-2.5 w-full">
            <MapPin className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input type="text" placeholder="Enter locations" className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400" />
          </div>
          <button className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors mt-1.5 sm:mt-0">
            Search
          </button>
        </div>

        <p className="mt-6 text-[13px] text-slate-500">
          Partnership with <span className="font-semibold text-slate-700">Glassdoor</span> and <span className="font-semibold text-slate-700">LinkedIn</span>
        </p>
      </section>

      {/* Popular Jobs Section */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3">Explore popular jobs</h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-lg mx-auto">Discover roles that align with your skills, experience, and career trajectory — curated for serious job seekers.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {/* Job Card 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">Mailchimp</h3>
                    <p className="text-xs text-slate-500">2 days ago</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-[10px] font-bold rounded-full">Design</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-6 leading-snug">Senior Product<br />Designer - Singapore</h4>
              <div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '64%' }} />
                </div>
                <p className="text-xs text-slate-500"><span className="font-bold text-slate-900">32 Applied</span> of 50 Capacity</p>
              </div>
            </div>

            {/* Job Card 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">Tokopedia</h3>
                    <p className="text-xs text-slate-500">3 days ago</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded-full">Web Dev</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-6 leading-snug">Junior Software<br />Engineer - Indonesia</h4>
              <div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '37%' }} />
                </div>
                <p className="text-xs text-slate-500"><span className="font-bold text-slate-900">12 Applied</span> of 32 Capacity</p>
              </div>
            </div>

            {/* Job Card 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900">Facebook</h3>
                    <p className="text-xs text-slate-500">3 days ago</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full">Business</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-6 leading-snug">Senior Account<br />Manager - Singapore</h4>
              <div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '80%' }} />
                </div>
                <p className="text-xs text-slate-500"><span className="font-bold text-slate-900">8 Applied</span> of 10 Capacity</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link to="/jobs" className="inline-block px-7 py-3.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors uppercase tracking-wide text-xs">
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-2xl text-center hover:bg-slate-100 transition-colors">
              <div className="w-14 h-14 bg-indigo-500 rounded-full mx-auto mb-5 flex items-center justify-center text-white">
                <BarChart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-[15px] mb-2">Feature Headline</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed">
                Description of the feature goes here. The description of the feature goes here
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-5 sm:px-8 border-t border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-5">
            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-md mb-4 inline-block tracking-wide">FAQ</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">Frequently Asked<br className="hidden sm:block" /> Questions</h2>
            <p className="text-sm text-slate-500 leading-relaxed">Find answers to the most common questions about Jobplotter, pricing, features, and more.</p>
          </div>
          <div className="lg:col-span-7">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b border-slate-200 py-1">
                <AccordionTrigger className="text-[15px] font-semibold text-slate-900 hover:no-underline">Can I try Jobplotter for free?</AccordionTrigger>
                <AccordionContent className="text-slate-500 text-sm leading-relaxed pt-1 pb-2">
                  Yes! We offer a 14-day free trial—no credit card required.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b border-slate-200 py-1">
                <AccordionTrigger className="text-[15px] font-semibold text-slate-900 hover:no-underline">Can I cancel my subscription anytime?</AccordionTrigger>
                <AccordionContent className="text-slate-500 text-sm leading-relaxed pt-1 pb-2">
                  Yes, you can cancel your subscription at any time from your account settings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b border-slate-200 py-1">
                <AccordionTrigger className="text-[15px] font-semibold text-slate-900 hover:no-underline">Do you offer custom pricing for agencies or enterprises?</AccordionTrigger>
                <AccordionContent className="text-slate-500 text-sm leading-relaxed pt-1 pb-2">
                  Absolutely. Please contact our sales team to discuss a custom plan tailored to your needs.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border-b border-slate-200 py-1">
                <AccordionTrigger className="text-[15px] font-semibold text-slate-900 hover:no-underline">What payment methods do you accept?</AccordionTrigger>
                <AccordionContent className="text-slate-500 text-sm leading-relaxed pt-1 pb-2">
                  We accept all major credit cards, PayPal, and wire transfers for annual enterprise plans.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 px-5 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-indigo-50 rounded-3xl py-14 sm:py-16 px-6 sm:px-8 text-center">
          <span className="px-3.5 py-1.5 bg-white text-indigo-600 text-[11px] font-bold rounded-full mb-6 inline-block shadow-sm tracking-wide uppercase">Get Started Today</span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-900 mb-4 max-w-2xl mx-auto leading-tight">
            Plot your path to the perfect job with Jobplotter
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mb-8 max-w-lg mx-auto leading-relaxed">
            Start your free 14-day trial and discover how data-driven decisions can fuel your business growth. No credit card required!
          </p>
          <button className="px-7 py-3.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Start Free Trial
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
