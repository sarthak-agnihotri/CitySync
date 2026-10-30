import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  Boxes,
  ClipboardList,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HardHat,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Award
} from "lucide-react";
import { GovernmentHeaderStrip } from "../components/layout/GovernmentHeaderStrip";
import { LandingNavbar } from "../components/layout/LandingNavbar";
import { LandingFooter } from "../components/layout/LandingFooter";
import { useAuth } from "../context/AuthContext";
import { ResourcesAPI, DepartmentsAPI, RequestsAPI } from "../api";

export function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Real backend statistics state
  const [liveStats, setLiveStats] = useState({
    resourcesCount: null,
    departmentsCount: null,
    requestsCount: null,
    availableUnits: null
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    async function fetchPortalMetrics() {
      setStatsLoading(true);
      try {
        const [resData, deptData, reqData] = await Promise.allSettled([
          ResourcesAPI.list(),
          DepartmentsAPI.list(),
          RequestsAPI.list()
        ]);

        const resources = resData.status === "fulfilled" && resData.value?.resources ? resData.value.resources : [];
        const departments = deptData.status === "fulfilled" && deptData.value?.departments ? deptData.value.departments : [];
        const requests = reqData.status === "fulfilled" && reqData.value?.requests ? reqData.value.requests : [];

        const totalAvailable = resources.reduce((acc, r) => acc + (r.availableQuantity || 0), 0);

        setLiveStats({
          resourcesCount: resources.length,
          departmentsCount: departments.length,
          requestsCount: requests.length,
          availableUnits: totalAvailable
        });
      } catch (err) {
        console.warn("Could not load public metrics:", err);
      } finally {
        setStatsLoading(false);
      }
    }

    fetchPortalMetrics();
  }, []);

  const faqs = [
    {
      q: "What is the primary mandate of the CitySync platform?",
      a: "CitySync serves as an inter-departmental statutory governance layer that synchronizes road resurfacing, underground water/sewerage works, electric cable ducting, and telecom installations across independent city agencies to prevent the chronic 'dig–repair–dig' cycle on municipal roads."
    },
    {
      q: "How does the cross-department equipment sharing pool operate?",
      a: "Agencies maintain registered heavy machinery (hydraulic excavators, asphalt compactors, suction trucks, mobile generators) in a shared pool. Department heads and officers can submit requisitions for idle equipment from peer agencies, receive automated approvals, and track equipment return to minimize duplicate government procurement."
    },
    {
      q: "What is the 5-Part 'Dig-Later' policy framework?",
      a: "It is an institutional mechanism comprising: (1) Declaring 3–5 year underground utility requirements before road construction; (2) Co-laying shared utility ducts; (3) Enforcing a strict 2-to-3 year No-Dig Moratorium on newly carpeted asphalt; (4) Mandating Trenchless Technology (HDD/micro-trenching) for unavoidable works; and (5) Imposing financial penalties for unauthorized road cutting into a municipal repair fund."
    },
    {
      q: "Who is authorized to access the officer operations portal?",
      a: "Designated municipal officers, department engineers, and city administrative authorities belonging to recognized line agencies (ULBs, BWSSB, DISCOM, PWD, Metro Rail) receive authenticated credentials with Role-Based Access Control (RBAC)."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      {/* 1. Official Government Header Strip */}
      <GovernmentHeaderStrip />

      {/* 2. Main Navigation Bar */}
      <LandingNavbar />

      <main className="flex-1">
        {/* 3. Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[var(--border-subtle)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-page)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 mb-6">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Smart Cities Governance Layer — Statutory Coordination Cell</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
                One Platform. One City.
                <span className="block text-emerald-700 dark:text-emerald-400 font-serif font-bold italic mt-1">
                  No More Digging in the Dark.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-5 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed">
                CitySync breaks departmental silos across municipal corporations, water supply boards,
                electricity DISCOMs, and road transit authorities. Providing joint scheduling, shared
                machinery pools, and strict corridor moratorium enforcement.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="btn btn-primary text-sm py-2.5 px-5 shadow-sm"
                  >
                    <span>Open Officer Portal</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="btn btn-primary text-sm py-2.5 px-5 shadow-sm"
                    >
                      <span>Official Portal Sign In</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-secondary text-sm py-2.5 px-5"
                    >
                      <span>Register Officer Account</span>
                    </Link>
                  </>
                )}

                <a
                  href="#services"
                  className="btn btn-ghost text-sm py-2.5 px-4 text-[var(--text-secondary)]"
                >
                  Explore Services
                </a>
              </div>

              {/* Notice */}
              <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  All active utility trenching permits are regulated under the Urban Civil Works Moratorium Act.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Real Metrics & Live Trust Indicators */}
        <section className="py-10 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
                <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                  {statsLoading ? "—" : liveStats.departmentsCount ?? "0"}
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  Line Departments
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  {statsLoading ? "—" : liveStats.resourcesCount ?? "0"}
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  Equipment Pool Items
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
                <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                  {statsLoading ? "—" : liveStats.availableUnits ?? "0"}
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  Available Machinery Units
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-400">
                  {statsLoading ? "—" : liveStats.requestsCount ?? "0"}
                </div>
                <div className="text-xs font-semibold text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  Requisitions Handled
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Key Services Section */}
        <section id="services" className="py-16 border-b border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Core Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                Inter-Departmental Municipal Services
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Unified workflows to ensure cross-agency resource mobilization and statutory transparency.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <Boxes className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Shared Heavy Equipment Pool
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    Searchable real-time inventory of hydraulic excavators, asphalt compactors,
                    suction trucks, and specialized trenchless machinery across all municipal agencies.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <Link
                    to={isAuthenticated ? "/resources" : "/login"}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>Browse Equipment Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 2 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-4">
                    <ClipboardList className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Requisition & Transfer Approvals
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    Formal multi-tier approval workflow for peer departments to request idle machinery,
                    complete with automated stock deduction and deployment schedules.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <Link
                    to={isAuthenticated ? "/requests" : "/login"}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>Submit Requisition</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 3 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[var(--text-primary)] flex items-center justify-center mb-4">
                    <Building2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Line Agency Directory
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    Official directory of registered city departments, nodal contact emails,
                    jurisdictional offices, and administrative personnel assignments.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <a
                    href="#departments"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>View Registered Agencies</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Card 4 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Conflict Prevention Engine
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    Double-layer spatial and temporal checks preventing duplicate corridor permits
                    and enforcing moratorium periods on freshly paved roads.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">
                    Integrated at Permit Approval Stage
                  </span>
                </div>
              </div>

              {/* Card 5 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <FileText className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Statutory Audit Trail
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    Tamper-resistant audit logging capturing all resource transfers, permit reviews,
                    and departmental assignments for public accountability and RTI compliance.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <Link
                    to={isAuthenticated ? "/audit" : "/login"}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>Inspect Governance Log</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Card 6 */}
              <div className="surface-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-4">
                    <HardHat className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Unified Civil Sequencing
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    Sub-surface utility ducts (water/gas/power) laid first, followed by base compaction,
                    concluding with final asphalt carpeting to eliminate recurring road cuts.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                  <a
                    href="#framework"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>Read Policy Guidelines</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. The 5-Part "Dig-Later" Policy Framework */}
        <section id="framework" className="py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Statutory Governance Rule
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                The 5-Part "Dig-Later" Policy Framework
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Mandatory five-step protocol enforced whenever infrastructure works require
                excavation or utility maintenance on city corridors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex flex-col">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">01</span>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">Declare Future Needs</h4>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                  All agencies submit planned utility pipeline requirements for a 3–5 year horizon prior to new road construction.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex flex-col">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">02</span>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">Build Shared Ducts</h4>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                  Conduits and utility chambers co-laid so future fiber, power, or water lines are pulled through without cutting asphalt.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex flex-col">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">03</span>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">No-Dig Moratorium</h4>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                  Newly surfaced roads receive an enforceable 2-to-3 year moratorium preventing non-emergency open trench cuts.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex flex-col">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">04</span>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">Trenchless Tech Mandate</h4>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                  If work is unavoidable, agencies must utilize Horizontal Directional Drilling (HDD) or micro-trenching rather than surface cuts.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] flex flex-col">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">05</span>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mt-1">Restoration Fund & Penalty</h4>
                <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                  Unauthorized cutting incurs heavy statutory surcharges deposited into a dedicated municipal road restoration fund.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Participating Agencies Directory */}
        <section id="departments" className="py-16 border-b border-[var(--border-subtle)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Implementing Bodies
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                Participating Line Departments & Agencies
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Mandates and jurisdictions governed under the unified municipal coordination cell.
              </p>
            </div>

            <div className="table-container">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Agency / Authority</th>
                    <th>Institutional Mandate</th>
                    <th>Sub-Surface Asset Types</th>
                    <th>Coordination Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      Municipal Corporation (ULB)
                    </td>
                    <td>City roads, storm-water drainage networks, street lighting, waste disposal</td>
                    <td>Storm drains, culverts, street light cabling</td>
                    <td>
                      <span className="status-pill pill-available">Active Coordination</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      Water Supply & Sewerage Board (BWSSB)
                    </td>
                    <td>Potable underground water mains, sanitary sewer trunks, pumping stations</td>
                    <td>Pressurized water pipes, sewer gravity mains</td>
                    <td>
                      <span className="status-pill pill-available">Active Coordination</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      Electricity Supply Undertaking (DISCOM)
                    </td>
                    <td>High-tension overhead & underground power cabling, transformer stations</td>
                    <td>Underground HT/LT feeder ducts, junction boxes</td>
                    <td>
                      <span className="status-pill pill-available">Active Coordination</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      Public Works Department (PWD)
                    </td>
                    <td>Arterial transit corridors, flyovers, state highways, public bridges</td>
                    <td>Corridor right-of-way, storm culverts</td>
                    <td>
                      <span className="status-pill pill-available">Active Coordination</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      Metro Rail Corporation
                    </td>
                    <td>Mass rapid transit viaducts, underground tunneling, station interchanges</td>
                    <td>Deep utility diversions, tunneling buffers</td>
                    <td>
                      <span className="status-pill pill-available">Active Coordination</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-[var(--text-primary)]">
                      City Gas & Telecom Duct Operators
                    </td>
                    <td>Piped natural gas (PNG) mains, optical fiber underground ducting</td>
                    <td>Steel gas mains, high-density polyethylene ducts</td>
                    <td>
                      <span className="status-pill pill-available">Active Coordination</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 8. Frequently Asked Questions (FAQ) */}
        <section id="faq" className="py-16 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Institutional Inquiries
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mt-1">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                Operational guidelines regarding equipment transfers, moratorium exemptions, and joint civil scheduling.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[var(--border-subtle)] rounded-lg overflow-hidden bg-[var(--bg-surface-secondary)] transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full py-4 px-5 text-left flex items-center justify-between text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 9. Final Call to Action */}
        <section className="py-16 bg-gradient-to-r from-emerald-900 to-emerald-800 dark:from-neutral-900 dark:to-neutral-900 text-white border-b border-emerald-950 dark:border-neutral-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Award className="w-10 h-10 text-emerald-300 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Empowering Municipal Cooperation & Seamless Urban Execution
            </h2>
            <p className="mt-3 text-sm text-emerald-100 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              Log in to the statutory coordination dashboard to review active machinery requisitions,
              inspect departmental equipment inventory, and monitor audit compliance.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="btn bg-white text-emerald-900 hover:bg-neutral-100 text-xs py-2.5 px-6 font-bold shadow-md"
                >
                  Enter Officer Portal
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn bg-white text-emerald-900 hover:bg-neutral-100 text-xs py-2.5 px-6 font-bold shadow-md"
                  >
                    Official Portal Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-600 text-xs py-2.5 px-6 font-bold"
                  >
                    Register Official Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 10. Institutional Footer */}
      <LandingFooter />
    </div>
  );
}
