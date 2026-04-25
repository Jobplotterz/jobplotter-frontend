import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Search, MapPin, SlidersHorizontal, MoreVertical, Check, Facebook, Twitter, ChevronDown, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const jobs = [
  {
    id: 1,
    company: "Eliassen Group",
    title: "Crisis Intervention Specialist",
    rate: "$50-55 hourly",
    location: "London",
    description: "Minimum 3 shifts a week Monday - Friday with the ability to work an 8 to 9 hour shift time each week between the hours of 7 A.M. - 7 P.M.",
    tags: ["Business", "Management", "Remote"],
    logo: <div className="w-10 h-10 flex items-center justify-center text-red-500 font-bold text-2xl">A</div>,
    logoBg: "bg-red-50/50"
  },
  {
    id: 2,
    company: "Shake Shack",
    title: "Virtual Scheduler - Remote",
    rate: "$40-48 hourly",
    location: "New York",
    description: "Lines for Life also offers a great benefits package valued at over $9,500 that includes full coverage for employee health, dental, vision, short",
    tags: ["Business", "Management", "Remote"],
    logo: <div className="w-10 h-10 flex items-center justify-center text-blue-500 font-bold text-2xl">G</div>,
    logoBg: "bg-blue-50/50"
  },
  {
    id: 3,
    company: "Core Group Resources",
    title: "Patient Care Advocate Full-Time",
    rate: "$55-60 hourly",
    location: "Washington",
    description: "Healthcare Interest — become an expert on emerging healthcare programs and excited to speak with providers about the future of healthcare",
    tags: ["Business", "Management", "Remote"],
    logo: <div className="w-10 h-10 flex items-center justify-center text-blue-600"><Facebook className="w-6 h-6" /></div>,
    logoBg: "bg-blue-50/50"
  },
  {
    id: 4,
    company: "Catchafire Company",
    title: "Workplace Culture Assessment for TataTrusts",
    rate: "$60-65 hourly",
    location: "London",
    description: "The Admissions Coordinator works under moderate supervision in performing a variety of administrative tasks in support of admissions activities that include",
    tags: ["Business", "Management", "Remote"],
    logo: <div className="w-10 h-10 flex items-center justify-center text-sky-500"><Twitter className="w-6 h-6 fill-current" /></div>,
    logoBg: "bg-sky-50/50"
  },
  {
    id: 5,
    company: "Printpack",
    title: "Full Time Patient Care Coordinator",
    rate: "$35-40 hourly",
    location: "Villa Rica",
    description: "This may include the use of the following guidelines and/or reference tools: CPT, ICD9, HCPC, medical terminology manuals; Correct Coding Initiative",
    tags: ["Business", "Management", "Remote"],
    logo: <div className="w-10 h-10 flex items-center justify-center text-slate-900 font-bold text-3xl leading-none">a</div>,
    logoBg: "bg-slate-100/50"
  }
];

const locations = [
  { name: "London", count: 48, checked: true },
  { name: "New York", count: 296, checked: false },
  { name: "Atlanta", count: 84, checked: false },
  { name: "Washington", count: 22, checked: false },
  { name: "Houston", count: 58, checked: false },
  { name: "Boston", count: 14, checked: false },
  { name: "Dallas", count: 19, checked: false },
];

export function Jobs() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/30 font-sans text-slate-900">
      <div className="relative">
        <Navbar />
        <div className="absolute top-0 left-0 right-0 h-64 bg-linear-to-r from-blue-50 via-indigo-50/50 to-pink-50 z-0" />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24 relative z-10 mt-4 sm:mt-8">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-1.5 flex flex-col sm:flex-row items-center mb-8 sm:mb-12">
          <div className="flex-1 flex items-center px-3 py-2 border-b sm:border-b-0 sm:border-r border-slate-100 w-full">
            <input type="text" placeholder="Founder" defaultValue="Founder" className="w-full outline-none py-1.5 text-sm text-slate-900 font-semibold" />
          </div>
          <div className="flex-1 flex items-center px-3 py-2 w-full">
            <MapPin className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <input type="text" placeholder="Any location" className="w-full outline-none py-1.5 text-sm text-slate-600" />
          </div>
          <button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors mt-1.5 sm:mt-0">
            <Search className="w-3.5 h-3.5" /> Find jobs
          </button>
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
            {filtersOpen ? <X className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left: Job Listings */}
          <div className="flex-1 space-y-3 order-2 lg:order-1">
            {jobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Logo */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${job.logoBg}`}>
                    {job.logo}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-0.5">
                      <h3 className="text-[15px] font-bold text-slate-900 leading-snug">{job.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-sm text-slate-900 hidden sm:inline">{job.rate}</span>
                        <button className="text-slate-400 hover:text-slate-600"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mb-1 sm:hidden">{job.rate}</p>
                    <p className="text-xs font-medium text-slate-500 mb-3">{job.location} &bull; {job.company}</p>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-4 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-600 text-[11px] font-semibold rounded-full border border-slate-100">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Filters */}
          <div className={`w-full lg:w-64 shrink-0 order-1 lg:order-2 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="flex items-center gap-2 mb-4 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filter by
            </div>

            <Accordion type="multiple" defaultValue={["location", "salary"]} className="w-full">
              {["Date posted", "Job type", "Certification", "Software required", "Shift"].map((filter) => (
                <div key={filter} className="py-3 border-b border-slate-100 flex items-center justify-between cursor-pointer group">
                  <span className="font-semibold text-sm text-slate-900">{filter}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                </div>
              ))}

              <AccordionItem value="location" className="border-b border-slate-100">
                <AccordionTrigger className="py-3 hover:no-underline font-semibold text-sm text-slate-900">Location</AccordionTrigger>
                <AccordionContent className="pt-1 pb-3 space-y-2.5">
                  {locations.map((loc) => (
                    <label key={loc.name} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center gap-2.5">
                        {loc.checked ? (
                          <div className="w-4.5 h-4.5 rounded bg-blue-500 flex items-center justify-center text-white" style={{ width: '18px', height: '18px' }}>
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="rounded border-2 border-slate-200 group-hover:border-blue-500 transition-colors" style={{ width: '18px', height: '18px' }} />
                        )}
                        <span className={`text-[13px] ${loc.checked ? 'font-semibold text-slate-900' : 'font-medium text-slate-600'}`}>{loc.name}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${loc.checked ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'}`}>
                        {loc.count}
                      </span>
                    </label>
                  ))}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="salary" className="border-b border-slate-100">
                <AccordionTrigger className="py-3 hover:no-underline font-semibold text-sm text-slate-900">Salary estimates</AccordionTrigger>
                <AccordionContent className="pt-3 pb-5">
                  <div className="flex justify-between text-xs font-bold text-slate-900 mb-3">
                    <span>$15.700</span>
                    <span>$38.990</span>
                  </div>
                  <div className="relative h-1.5 bg-slate-100 rounded-full w-full">
                    <div className="absolute left-[20%] right-[30%] h-full bg-blue-500 rounded-full" />
                    <div className="absolute left-[20%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full shadow-sm cursor-pointer" />
                    <div className="absolute right-[30%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-blue-500 rounded-full shadow-sm cursor-pointer" />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <div className="py-3 border-b border-slate-100 flex items-center justify-between cursor-pointer group">
                <span className="font-semibold text-sm text-slate-900">Experience level</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
            </Accordion>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
