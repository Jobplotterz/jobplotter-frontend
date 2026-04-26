import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart, Search, Users, Phone, FileText, Calendar, RefreshCw, TrendingUp,
  Bookmark, Mail, Phone as PhoneIcon, Briefcase,
  Facebook, Twitter, Menu, X, LogOut, Home as HomeIcon
} from "lucide-react";
import { Navbar } from "../components/Navbar";

export function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-900">
      <Navbar />

      <div className="flex flex-col md:flex-row flex-1">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-0 md:top-16 left-0 h-full md:h-[calc(100vh-4rem)] w-60 border-r border-slate-100 flex flex-col bg-slate-50/50 z-50
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
        <div className="p-5 flex items-center justify-end md:hidden">
          <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          <Link to="#" className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
            <PieChart className="w-4 h-4" /> Dashboard
          </Link>

          <div className="pt-5 pb-1.5 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Employee finder
          </div>
          <Link to="#" className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
            <Search className="w-4 h-4" /> Search
          </Link>
          <Link to="#" className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-semibold text-slate-900 bg-slate-100 rounded-lg">
            <Users className="w-4 h-4" /> Employees
          </Link>
          <Link to="#" className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
            <Phone className="w-4 h-4" /> Calls
          </Link>

          <div className="pt-5 pb-1.5 px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Manage listings
          </div>
          <Link to="#" className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
            <FileText className="w-4 h-4" /> Listings
          </Link>
          <Link to="#" className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
            <Calendar className="w-4 h-4" /> Calendar
          </Link>
          <Link to="#" className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
            <RefreshCw className="w-4 h-4" /> Post Updates
          </Link>
          <Link to="#" className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
            <TrendingUp className="w-4 h-4" /> Analytics
          </Link>
        </nav>

        <div className="mt-auto p-3 border-t border-slate-100 space-y-0.5">
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
            <HomeIcon className="w-4 h-4" /> Back to site
          </Link>
          <button type="button" className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Mobile-only sidebar toggle */}
        <div className="md:hidden flex items-center px-5 py-3 border-b border-slate-100">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 -ml-1.5 text-slate-600 hover:text-slate-900" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-5xl mx-auto w-full px-5 sm:px-8 pb-12">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mt-4 mb-6 gap-4">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white shadow-sm shrink-0">
                <img src="https://picsum.photos/seed/praskovya/200/200" alt="Praskovya Dubinina" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-[1.75rem] font-extrabold text-slate-900 mb-1">Praskovya Dubinina</h1>
                <div className="flex items-center gap-1.5 text-slate-600 text-[13px] font-medium">
                  <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-[10px] font-bold">G</div>
                  <span>Eliassen Group Inc. &bull; UI/UX Designer</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:mt-1">
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                <Bookmark className="w-3.5 h-3.5" /> Save for later
              </button>
              <button className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                Contact
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-5 sm:gap-7 border-b border-slate-200 mb-6 overflow-x-auto">
            <button className="flex items-center gap-1.5 pb-3 text-[13px] font-semibold text-slate-900 border-b-2 border-slate-900 whitespace-nowrap">
              <Briefcase className="w-3.5 h-3.5" /> About
            </button>
            <button className="flex items-center gap-1.5 pb-3 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap">
              <FileText className="w-3.5 h-3.5" /> Work
            </button>
            <button className="flex items-center gap-1.5 pb-3 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap">
              <TrendingUp className="w-3.5 h-3.5" /> Experience
            </button>
            <button className="flex items-center gap-1.5 pb-3 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap">
              <PieChart className="w-3.5 h-3.5" /> Education
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-2 space-y-10">

              {/* Short Bio */}
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-3">Short bio</h2>
                <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
                  Once your resume is on Indeed, you can choose to make it "Public" or "Private." There are benefits to both options. When you make your resume public, it is visible to anyone. Visitors to a public resume page can forward, save, or download the resume as a PDF or email you through a secure contact form.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["Business", "Marketing", "Development", "Founder", "Html", "Interface Design", "University", "Entrepreneur"].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-600 text-[11px] font-semibold rounded-full border border-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              {/* Work Experience */}
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-5">Work experience</h2>
                <div className="space-y-6">
                  <div className="flex gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center shrink-0 text-pink-500">
                      <div className="w-5 h-5 rounded-full border-2 border-current border-dashed" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-0.5 mb-0.5">
                        <h3 className="font-bold text-slate-900 text-[15px]">Crisis Intervention Specialist</h3>
                        <span className="text-xs font-semibold text-slate-900 shrink-0">2018 - Present</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mb-2">London &bull; Dribble Inc.</p>
                      <p className="text-slate-500 text-[13px] leading-relaxed">
                        Minimum 3 shifts a week Monday - Friday with the ability to work an 8 to 9 hour time each week between the hours of 7 A.M. - 7 P.M.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      <div className="w-5 h-5 bg-blue-500 rounded-sm flex items-center justify-center text-white text-[10px] font-bold">G</div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-0.5 mb-0.5">
                        <h3 className="font-bold text-slate-900 text-[15px]">Virtual Scheduler</h3>
                        <span className="text-xs font-semibold text-slate-900 shrink-0">2001 - 2018</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mb-2">London &bull; Google Inc.</p>
                      <p className="text-slate-500 text-[13px] leading-relaxed">
                        Lines for Life also offers a great benefits package valued at over $9,500 that includes full coverage for employee health, dental, vision, short
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                      <Facebook className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-0.5 mb-0.5">
                        <h3 className="font-bold text-slate-900 text-[15px]">Patient Care Advocate</h3>
                        <span className="text-xs font-semibold text-slate-900 shrink-0">1998 - 2018</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mb-2">London &bull; Facebook Inc.</p>
                      <p className="text-slate-500 text-[13px] leading-relaxed">
                        Healthcare Interest — become an expert on emerging healthcare programs and excited to speak with providers
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Education */}
              <section>
                <h2 className="text-lg font-bold text-slate-900 mb-5">Education</h2>
                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-700">
                    <div className="w-5 h-5 border-2 border-current rounded-sm" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-0.5 mb-0.5">
                      <h3 className="font-bold text-slate-900 text-[15px]">Harvard University</h3>
                      <span className="text-xs font-semibold text-slate-900 shrink-0">1994 - 1998</span>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mb-2">London &bull; Business Development</p>
                    <p className="text-slate-500 text-[13px] leading-relaxed">
                      Healthcare Interest — become an expert on emerging healthcare programs and excited to speak with providers about the future of healthcare
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column (Sidebar Cards) */}
            <div className="space-y-5">
              {/* Salary & Contact Card */}
              <div className="bg-slate-50 rounded-2xl p-5">
                <h3 className="text-xl font-extrabold text-slate-900 mb-0.5">$35,700 — $37,700</h3>
                <p className="text-xs text-slate-500 font-medium mb-6">Avg. salary</p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">hoangle@yahoo.com</p>
                      <p className="text-[11px] text-slate-500">Contact Email</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <PhoneIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">+64 456 869 393</p>
                      <p className="text-[11px] text-slate-500">Phone</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">Information technology</p>
                      <p className="text-[11px] text-slate-500">Job Functions</p>
                    </div>
                  </div>
                </div>

                <p className="text-[13px] text-slate-500 leading-relaxed">
                  My new car is sexy. Melbourne Red color, interior is nice. I enjoy changing the ambiance.
                </p>
              </div>

              {/* Connections Card */}
              <div className="bg-slate-50 rounded-2xl p-5">
                <h3 className="text-base font-bold text-slate-900 mb-4">Connections</h3>

                <div className="space-y-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <img src="https://picsum.photos/seed/trashae/100/100" alt="Trashae Hubbard" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">Trashae Hubbard</p>
                      <p className="text-[11px] text-slate-500 mb-0.5">Crisis Specialist</p>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                        <Twitter className="w-3 h-3 text-blue-400" /> Twitter Inc.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <img src="https://picsum.photos/seed/xian/100/100" alt="Xian Zhou" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">Xian Zhou</p>
                      <p className="text-[11px] text-slate-500 mb-0.5">Virtual Scheduler</p>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                        <div className="w-3 h-3 bg-blue-800 rounded-sm flex items-center justify-center text-[7px] text-white font-bold">P</div> PayPal Inc.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <img src="https://picsum.photos/seed/alexa/100/100" alt="Alexa Tenorio" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-900">Alexa Tenorio</p>
                      <p className="text-[11px] text-slate-500 mb-0.5">Patient Care Advocate</p>
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                        <div className="w-3 h-3 bg-yellow-400 rounded-sm flex items-center justify-center text-[7px] text-white font-bold">S</div> Sketch Inc.
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-900 hover:bg-slate-50 transition-colors">
                  See all connections
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
      </div>
    </div>
  );
}
