import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Image as ImageIcon,
  AlertCircle,
  Clock,
  ThumbsUp,
  Star,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import { GrievanceAPI } from "../api/client";
import { useLanguage } from "../context/LanguageContext";
import { useCitizenAuth } from "../context/CitizenAuthContext";
import { useToast } from "../context/ToastContext";

export function TrackStatusPage() {
  const [searchParams] = useSearchParams();
  const [ticketQuery, setTicketQuery] = useState(searchParams.get("ticket") || "");
  const [loading, setLoading] = useState(false);
  const [grievance, setGrievance] = useState(null);
  const [error, setError] = useState("");
  const { t, isHindi } = useLanguage();
  const { user } = useCitizenAuth();
  const { addToast } = useToast();

  // Rating & Reopen local states
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showReopenBox, setShowReopenBox] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [submittingReopen, setSubmittingReopen] = useState(false);
  const [upvoting, setUpvoting] = useState(false);

  const STATUS_STEPS = [
    { key: "submitted", label: t("track.statusSteps.submitted") },
    { key: "assigned_to_dept", label: t("track.statusSteps.assigned_to_dept") },
    { key: "in_progress", label: t("track.statusSteps.in_progress") },
    { key: "resolved", label: t("track.statusSteps.resolved") }
  ];

  const fetchTicket = async (ticket) => {
    if (!ticket.trim()) return;
    setLoading(true);
    setError("");
    setGrievance(null);
    try {
      const res = await GrievanceAPI.track(ticket.trim());
      setGrievance(res.grievance);
    } catch (err) {
      setError(err.message || (isHindi ? "इस टिकट संख्या से कोई शिकायत नहीं मिली" : "No complaint found with this ticket number"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("ticket");
    if (q) {
      fetchTicket(q);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTicket(ticketQuery);
  };

  const handleUpvote = async () => {
    if (!grievance) return;
    setUpvoting(true);
    try {
      const res = await GrievanceAPI.upvote(grievance.ticketId);
      setGrievance((prev) => ({ ...prev, upvotes: res.upvotes }));
      addToast(
        res.alreadyUpvoted
          ? (isHindi ? "आप पहले ही समर्थन दर्ज कर चुके हैं" : "You have already upvoted this grievance")
          : (isHindi ? "समर्थन दर्ज किया गया (+1)" : "Upvote recorded! Priority escalated."),
        res.alreadyUpvoted ? "info" : "success"
      );
    } catch {
      addToast(isHindi ? "समर्थन दर्ज करने में विफल" : "Failed to record upvote", "error");
    } finally {
      setUpvoting(false);
    }
  };

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRating(true);
    try {
      const res = await GrievanceAPI.rate(grievance.ticketId, { rating, feedback });
      setGrievance(res.grievance);
      addToast(isHindi ? "प्रतिक्रिया सफलतापूर्वक दर्ज की गई!" : "Satisfaction rating submitted!", "success");
    } catch (err) {
      addToast(err.message || (isHindi ? "प्रतिक्रिया दर्ज करने में विफल" : "Failed to submit rating"), "error");
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleReopenSubmit = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      addToast(isHindi ? "कृपया पुनः खोलने का कारण लिखें" : "Please provide a reason to reopen", "error");
      return;
    }
    setSubmittingReopen(true);
    try {
      const res = await GrievanceAPI.reopen(grievance.ticketId, { reason: reopenReason });
      setGrievance(res.grievance);
      setShowReopenBox(false);
      addToast(isHindi ? "शिकायत पुनः खोली गई और जांच दल को भेजी गई" : "Grievance reopened and escalated to department", "success");
    } catch (err) {
      addToast(err.message || (isHindi ? "शिकायत पुनः खोलने में विफल" : "Failed to reopen grievance"), "error");
    } finally {
      setSubmittingReopen(false);
    }
  };

  const getStepIndex = (status) => {
    if (status === "resolved") return 3;
    if (status === "in_progress" || status === "reopened") return 2;
    if (status === "assigned_to_dept" || status === "under_review") return 1;
    return 0;
  };

  const getStatusDisplay = (status) => {
    if (status === "resolved") return isHindi ? "समाधान पूर्ण" : "Resolved";
    if (status === "reopened") return isHindi ? "पुनः खोला गया (अति-प्राथमिक)" : "Reopened (Critical)";
    if (status === "in_progress") return isHindi ? "कार्य प्रगति पर" : "In Progress";
    if (status === "assigned_to_dept" || status === "under_review") return isHindi ? "आवंटित" : "Assigned";
    return isHindi ? "पंजीकृत" : "Registered";
  };

  // SLA calculation
  const getSlaStatus = () => {
    if (!grievance) return null;
    if (grievance.status === "resolved") {
      return {
        status: "met",
        text: isHindi ? "एसएलए समय सीमा में पूर्ण" : "Resolved within SLA Standards"
      };
    }
    const createdAtTime = new Date(grievance.createdAt).getTime();
    const slaHours = grievance.slaHours || 48;
    const deadlineTime = createdAtTime + slaHours * 60 * 60 * 1000;
    const nowTime = Date.now();
    const diffHours = Math.round((deadlineTime - nowTime) / (1000 * 60 * 60));

    if (diffHours < 0) {
      return {
        status: "breached",
        text: isHindi
          ? `एसएलए सीमा पार (${Math.abs(diffHours)} घंटे विलंब) • जोनल आयुक्त को प्रेषित`
          : `SLA Breached (${Math.abs(diffHours)}h overdue) • Escalated to Zonal Authority`
      };
    }
    return {
      status: "active",
      text: isHindi
        ? `मानक एसएलए: ${slaHours} घंटे (${diffHours} घंटे शेष)`
        : `Target SLA: ${slaHours}h (${diffHours}h remaining)`
    };
  };

  const slaInfo = getSlaStatus();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
          {t("track.pageTitle")}
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          {t("track.pageSubtitle")}
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-8 flex flex-col sm:flex-row max-w-2xl mx-auto gap-3 p-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-lg shadow-slate-950/5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t("track.searchPlaceholder")}
              value={ticketQuery}
              onChange={(e) => setTicketQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-transparent bg-[var(--bg-surface-secondary)] text-sm text-[var(--text-primary)] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 disabled:opacity-60 text-white font-bold text-sm cursor-pointer shadow-md shadow-emerald-900/15 shrink-0 transition-all"
          >
            {loading ? t("track.searching") : t("track.searchBtn")}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2.5 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {grievance && (
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-xl shadow-slate-950/5 overflow-hidden space-y-0">
          {/* Header Card */}
          <div className="p-6 sm:p-8 border-b border-[var(--border-subtle)] bg-gradient-to-br from-emerald-50/70 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {t("track.ticketLabel")}
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-800 dark:text-emerald-300 mt-1">
                  {grievance.ticketId}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Upvote Button */}
                <button
                  type="button"
                  onClick={handleUpvote}
                  disabled={upvoting}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                  title="I am also facing this problem (+1)"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Me Too ({grievance.upvotes || 0})</span>
                </button>

                <span
                  className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full border ${
                    grievance.status === "resolved"
                      ? "bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800"
                      : grievance.status === "reopened"
                      ? "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                      : grievance.status === "in_progress"
                      ? "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                      : "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  {getStatusDisplay(grievance.status)}
                </span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)] mt-6">
              {grievance.title}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)] mt-2">
              {grievance.description}
            </p>

            {/* SLA Clock Banner */}
            {slaInfo && (
              <div
                className={`mt-4 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  slaInfo.status === "breached"
                    ? "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                    : slaInfo.status === "met"
                    ? "bg-teal-100 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800"
                    : "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                }`}
              >
                <Clock className="w-4 h-4 shrink-0" />
                <span>{slaInfo.text}</span>
              </div>
            )}
          </div>

          {/* Stepper Timeline */}
          <div className="p-6 sm:p-8 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between relative gap-1">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[var(--border-subtle)] z-0" />
              {STATUS_STEPS.map((step, idx) => {
                const currentIdx = getStepIndex(grievance.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step.key} className="flex flex-col items-center relative z-10 bg-[var(--bg-surface)] px-1 sm:px-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm border-2 shadow-sm transition-all duration-300 ${
                        isPassed
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)]"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs text-center mt-2 font-bold leading-tight ${
                        isCurrent
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 text-sm border-b border-[var(--border-subtle)]">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--bg-surface-secondary)]/60 border border-[var(--border-subtle)]">
              <Building2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-muted)]">{t("track.deptAssigned")}:</span>
                <p className="font-bold text-sm text-[var(--text-primary)] mt-1">{grievance.assignedDepartment}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--bg-surface-secondary)]/60 border border-[var(--border-subtle)]">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-muted)]">{t("track.zone")}:</span>
                <p className="font-bold text-sm text-[var(--text-primary)] mt-1">
                  {grievance.zone} {grievance.landmark ? `(${grievance.landmark})` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--bg-surface-secondary)]/60 border border-[var(--border-subtle)]">
              <Calendar className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-muted)]">{t("track.lodgedOn")}:</span>
                <p className="font-bold text-sm text-[var(--text-primary)] mt-1">
                  {new Date(grievance.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--bg-surface-secondary)]/60 border border-[var(--border-subtle)]">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[var(--text-muted)]">{t("report.complainantInfo")}:</span>
                <p className="font-bold text-sm text-[var(--text-primary)] mt-1">{grievance.citizenName}</p>
              </div>
            </div>
          </div>

          {/* Reopen Warning Banner (if reopened) */}
          {grievance.status === "reopened" && (
            <div className="p-5 bg-rose-50 dark:bg-rose-950/30 border-b border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>{isHindi ? "शिकायत पुनः खोली गई" : "Grievance Reopened by Citizen"}</span>
              </div>
              <p className="text-[11px] text-rose-800/90 dark:text-rose-300">
                <strong>{isHindi ? "कारण:" : "Reason:"}</strong> {grievance.reopenReason}
              </p>
            </div>
          )}

          {/* "Before & After" Resolution Photos Comparison */}
          <div className="p-6 sm:p-8 border-b border-[var(--border-subtle)] space-y-5">
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              {isHindi ? "फोटो साक्ष्य एवं मरम्मत सत्यापन" : "Photo Evidence & Repair Verification"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Before Repair */}
              <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/50 space-y-3 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {isHindi ? "1. नागरिक द्वारा दर्ज फोटो (मरम्मत से पहले)" : "1. Reported Hazard (Before Repair)"}
                </span>
                {grievance.images && grievance.images.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {grievance.images.map((img, i) => (
                      <a
                        key={i}
                        href={img.url.startsWith("http") ? img.url : `http://127.0.0.1:5001${img.url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-24 h-24 rounded-lg overflow-hidden border border-[var(--border-subtle)] hover:opacity-90 shadow-xs"
                      >
                        <img
                          src={img.url.startsWith("http") ? img.url : `http://127.0.0.1:5001${img.url}`}
                          alt="Before repair"
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-[var(--text-muted)] py-4 text-center">
                    {isHindi ? "कोई फोटो संलग्न नहीं" : "No photo uploaded"}
                  </div>
                )}
              </div>

              {/* After Repair (Department Evidence) */}
              <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]/50 space-y-3 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {isHindi ? "2. विभागीय मरम्मत साक्ष्य (मरम्मत के बाद)" : "2. Department Field Evidence (After Repair)"}
                </span>
                {grievance.status === "resolved" ? (
                  grievance.resolutionImage ? (
                    <a
                      href={grievance.resolutionImage.startsWith("http") ? grievance.resolutionImage : `http://127.0.0.1:5001${grievance.resolutionImage}`}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden border border-emerald-400/70 shadow-md transition-transform hover:scale-[1.02]"
                    >
                      <img
                        src={grievance.resolutionImage.startsWith("http") ? grievance.resolutionImage : `http://127.0.0.1:5001${grievance.resolutionImage}`}
                        alt="After repair"
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{isHindi ? "अधिकारी द्वारा कार्य स्थल का भौतिक निरीक्षण कर समाधान सत्यापित किया गया।" : "Site inspected and verified by municipal field engineer."}</span>
                    </div>
                  )
                ) : (
                  <div className="text-xs text-[var(--text-muted)] py-4 text-center">
                    {isHindi ? "कार्य पूर्ण होने पर समाधान फोटो अपलोड होगी" : "Completion photo will be attached once repaired"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Field Inspection Remarks */}
          {grievance.resolutionNotes && (
            <div className="p-6 sm:p-8 bg-gradient-to-br from-teal-50/70 to-emerald-50/40 dark:from-teal-950/30 dark:to-emerald-950/20 border-b border-[var(--border-subtle)]">
              <h4 className="text-sm font-extrabold text-teal-900 dark:text-teal-200 uppercase tracking-wider mb-3">
                {t("track.remarks")}
              </h4>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                {grievance.resolutionNotes}
              </p>
              {grievance.resolvedAt && (
                <span className="text-xs font-semibold text-[var(--text-muted)] block mt-3">
                  {isHindi ? "समाधान तिथि" : "Closed on"}: {new Date(grievance.resolvedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {/* Citizen Feedback & Re-open Loop (For Resolved Complaints) */}
          {grievance.status === "resolved" && (
            <div className="p-6 sm:p-8 bg-[var(--bg-surface-secondary)]/40 space-y-6">
              <div>
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-[var(--text-primary)]">
                  {isHindi ? "नागरिक संतुष्टि एवं गुणवत्ता ऑडिट" : "Citizen Redressal Verification & Rating"}
                </h4>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)] mt-2">
                  {isHindi
                    ? "क्या आपकी समस्या का समाधान ठीक से हुआ? अपनी रेटिंग दर्ज करें या समस्या रहने पर पुनः खोलें।"
                    : "Was the repair completed to your satisfaction? Submit your rating or request a reopen if issues persist."}
                </p>
              </div>

              {grievance.satisfactionRating ? (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-sm space-y-3 shadow-sm">
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= grievance.satisfactionRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                      />
                    ))}
                    <span className="text-emerald-900 dark:text-emerald-200 ml-2">
                      {grievance.satisfactionRating} / 5 {isHindi ? "स्टार रेटिंग दर्ज" : "Stars Recorded"}
                    </span>
                  </div>
                  {grievance.satisfactionFeedback && (
                    <p className="text-[var(--text-secondary)] italic">
                      "{grievance.satisfactionFeedback}"
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRateSubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                      {isHindi ? "रेटिंग चुनें:" : "Your Rating:"}
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRating(s)}
                          className="cursor-pointer p-0.5"
                        >
                          <Star
                            className={`w-5 h-5 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder={isHindi ? "वैकल्पिक टिप्पणी लिखें (उदा. कार्य समय पर पूरा हुआ)..." : "Optional remarks (e.g. well paved road, quick service)..."}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={submittingRating}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-emerald-800 hover:to-teal-700 disabled:opacity-60 text-white font-bold text-sm cursor-pointer shadow-md shadow-emerald-900/15 transition-all"
                    >
                      {submittingRating
                        ? (isHindi ? "जमा हो रहा है..." : "Submitting...")
                        : (isHindi ? "संतुष्टि रेटिंग दर्ज करें" : "Submit Rating")}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowReopenBox((prev) => !prev)}
                      className="px-5 py-3 rounded-xl border border-rose-200 dark:border-rose-800 text-sm font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isHindi ? "कार्य असंतोषजनक? पुनः खोलें" : "Work Incomplete? Request Re-open"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Reopen Box */}
              {showReopenBox && (
                <form
                  onSubmit={handleReopenSubmit}
                  className="mt-4 p-5 sm:p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-4 shadow-sm"
                >
                  <div className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    {isHindi ? "शिकायत पुनः खोलने का कारण दर्ज करें" : "Reason for Reopening Complaint"}
                  </div>
                  <textarea
                    rows={2}
                    required
                    placeholder={isHindi ? "बताएं कि समस्या का समाधान क्यों नहीं हुआ (उदा. सड़क का गड्ढा अभी भी गहरा है)..." : "Explain why the issue was not properly resolved..."}
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-rose-300 dark:border-rose-800 bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-rose-600 resize-none transition-all"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={submittingReopen}
                      className="px-5 py-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-sm cursor-pointer shadow-md transition-all"
                    >
                      {submittingReopen
                        ? (isHindi ? "पुनः खुल रहा है..." : "Reopening...")
                        : (isHindi ? "अधिकारियों को पुनः जांच हेतु भेजें" : "Escalate & Re-Open Ticket")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReopenBox(false)}
                      className="px-5 py-3 rounded-xl border border-[var(--border-subtle)] text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] cursor-pointer transition-all"
                    >
                      {isHindi ? "रद्द करें" : "Cancel"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}








