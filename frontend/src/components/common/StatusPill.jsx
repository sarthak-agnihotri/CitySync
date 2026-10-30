import React from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Ban,
  ShieldCheck,
  Building2,
  User,
  Info
} from "lucide-react";

export function StatusPill({ status, type = "status" }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase().replace(/\s+/g, "_");
  const formattedText = String(status).replace(/_/g, " ");

  const getIcon = () => {
    switch (normalized) {
      case "available":
      case "approved":
      case "success":
        return <CheckCircle2 className="w-3 h-3" aria-hidden="true" />;
      case "pending":
      case "partially_available":
      case "medium":
        return <Clock className="w-3 h-3" aria-hidden="true" />;
      case "urgent":
      case "high":
        return <AlertTriangle className="w-3 h-3" aria-hidden="true" />;
      case "unavailable":
      case "rejected":
        return <XCircle className="w-3 h-3" aria-hidden="true" />;
      case "returned":
      case "maintenance":
        return <RotateCcw className="w-3 h-3" aria-hidden="true" />;
      case "cancelled":
        return <Ban className="w-3 h-3" aria-hidden="true" />;
      case "city_admin":
        return <ShieldCheck className="w-3 h-3" aria-hidden="true" />;
      case "department_head":
        return <Building2 className="w-3 h-3" aria-hidden="true" />;
      case "officer":
        return <User className="w-3 h-3" aria-hidden="true" />;
      default:
        return <Info className="w-3 h-3" aria-hidden="true" />;
    }
  };

  return (
    <span
      className={`status-pill pill-${normalized}`}
      title={`${type}: ${formattedText}`}
    >
      {getIcon()}
      <span>{formattedText}</span>
    </span>
  );
}
