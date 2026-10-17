// ─────────────────────────────────────────────────────────────────────────────
// CitySync — Member 5: Resource Sharing & Notifications
// Main Application Logic
// ─────────────────────────────────────────────────────────────────────────────

// ── State ─────────────────────────────────────────────────────────────────────
let currentUser = null;
let currentPage = "overview";
let pendingRejectId = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const show = (el) => el && el.classList.remove("hidden");
const hide = (el) => el && el.classList.add("hidden");

function showToast(msg, type = "info") {
  const t = $("toast");
  t.textContent = msg;
  t.className = `toast toast-${type}`;
  show(t);
  setTimeout(() => hide(t), 3500);
}

function pill(status) {
  return `<span class="pill pill-${status}">${status.replace(/_/g, " ")}</span>`;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

function progressClass(pct) {
  if (pct > 50) return "high";
  if (pct > 20) return "mid";
  return "low";
}

function emptyState(icon, msg) {
  return `<div class="empty-state"><span class="empty-icon">${icon}</span>${msg}</div>`;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
async function tryLogin(e) {
  e.preventDefault();
  const email = $("login-email").value.trim();
  const password = $("login-password").value;
  const errEl = $("login-error");
  const btn = $("login-btn");

  hide(errEl);
  btn.disabled = true;
  btn.textContent = "Signing in…";

  try {
    const data = await Auth.login(email, password);
    localStorage.setItem("cs_token", data.token);
    localStorage.setItem("cs_user", JSON.stringify(data.user));
    currentUser = data.user;
    bootDashboard();
  } catch (err) {
    errEl.textContent = err.message || "Login failed";
    show(errEl);
  } finally {
    btn.disabled = false;
    btn.textContent = "Sign In";
  }
}

function logout() {
  localStorage.removeItem("cs_token");
  localStorage.removeItem("cs_user");
  currentUser = null;

  // Hide dashboard and reset admin-only controls
  hide($("dashboard"));
  document.querySelectorAll(".admin-only").forEach(el => hide(el));
  hide($("nav-audit"));

  show($("login-screen"));
  $("login-email").value = "";
  $("login-password").value = "";
}
// ── Boot ──────────────────────────────────────────────────────────────────────
function bootDashboard() {
  hide($("login-screen"));
  show($("dashboard"));

  // Set user info in sidebar
  $("user-name-display").textContent = currentUser.name;
  $("user-role-display").textContent = currentUser.role.replace(/_/g, " ");
  $("user-avatar").textContent = currentUser.name.charAt(0).toUpperCase();

  // Show admin-only elements
  if (currentUser.role === "city_admin") {
    document.querySelectorAll(".admin-only").forEach(el => show(el));
    show($("nav-audit"));
  }

  navigateTo("overview");
  pollNotifications();
}

// ── Navigation ────────────────────────────────────────────────────────────────
function navigateTo(page) {
  currentPage = page;

  // Update nav items
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  // Update page title
  const titles = {
    overview: "📊 Overview",
    resources: "📦 Resource Inventory",
    requests: "📋 Resource Requests",
    notifications: "🔔 Notifications",
    audit: "📜 Audit Logs"
  };
  $("page-title").textContent = titles[page] || page;

  // Show/hide pages
  document.querySelectorAll(".page").forEach(p => {
    p.classList.toggle("hidden", p.id !== `page-${page}`);
  });

  // Load data
  if (page === "overview") loadOverview();
  if (page === "resources") loadResources();
  if (page === "requests") loadRequests();
  if (page === "notifications") loadNotifications();
  if (page === "audit") {}
}

// ── Notifications polling ─────────────────────────────────────────────────────
async function pollNotifications() {
  try {
    const data = await Notifications.list(true);
    const count = data.unreadCount || 0;
    const badge = $("notif-badge");
    const dot = $("bell-dot");

    if (count > 0) {
      badge.textContent = count;
      badge.style.display = "inline-block";
      show(dot);
    } else {
      badge.style.display = "none";
      hide(dot);
    }

    $("stat-notif-count").textContent = count;
  } catch (_) {}

  setTimeout(pollNotifications, 30000);
}

// ── PAGE: OVERVIEW ────────────────────────────────────────────────────────────
async function loadOverview() {
  try {
    const [resData, reqData] = await Promise.all([
      Resources.list(),
      Requests.list()
    ]);

    const resources = resData.resources || [];
    const requests = reqData.requests || [];

    $("stat-res-count").textContent = resources.length;
    $("stat-avail-count").textContent = resources.filter(r => r.status === "available").length;
    $("stat-pending-count").textContent = requests.filter(r => r.status === "pending").length;

    // Recent requests (last 5)
    const recent = requests.slice(0, 5);
    const container = $("recent-requests-list");
    if (!recent.length) {
      container.innerHTML = emptyState("📋", "No requests yet.");
      return;
    }
    container.innerHTML = recent.map(r => renderRequestCard(r, true)).join("");
    attachRequestActions();
  } catch (err) {
    showToast("Failed to load overview: " + err.message, "error");
  }
}

// ── PAGE: RESOURCES ───────────────────────────────────────────────────────────
async function loadResources() {
  const container = $("resources-list");
  container.innerHTML = emptyState("⏳", "Loading…");
  try {
    const cat = $("resource-cat-filter").value;
    const params = {};
    if (cat) params.category = cat;

    const data = await Resources.list(params);
    const resources = data.resources || [];
    const search = $("resource-search").value.toLowerCase();
    const filtered = search
      ? resources.filter(r => r.name.toLowerCase().includes(search) || (r.description || "").toLowerCase().includes(search))
      : resources;

    if (!filtered.length) {
      container.innerHTML = emptyState("📦", "No resources found.");
      return;
    }
    container.innerHTML = filtered.map(renderResourceCard).join("");
    attachResourceActions();
  } catch (err) {
    container.innerHTML = emptyState("❌", err.message);
    showToast("Failed to load resources", "error");
  }
}

function renderResourceCard(r) {
  const avail = r.availableQuantity ?? 0;
  const total = r.quantity ?? 1;
  const pct = Math.round((avail / total) * 100);
  const cls = progressClass(pct);
  const dept = r.ownerDepartment?.name || "—";
  const isAdmin = currentUser?.role === "city_admin" || currentUser?.role === "department_head";

  return `
    <div class="resource-card">
      <div class="resource-card-top">
        <span class="resource-name">${r.name}</span>
        <span class="resource-cat">${r.category}</span>
      </div>
      <div class="resource-meta">
        📍 ${r.location || "No location"}<br>
        🏢 ${dept}<br>
        📦 ${avail} / ${total} ${r.unit || "units"} available
      </div>
      <div class="resource-progress">
        <div class="progress-label">
          <span>Availability</span>
          <span>${pct}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${cls}" style="width:${pct}%"></div>
        </div>
      </div>
      <div style="margin-top:10px">${pill(r.status)}</div>
      <div class="resource-actions">
        <button class="btn btn-primary btn-sm" onclick="openRequestForResource('${r._id}')">Request</button>
        ${isAdmin ? `<button class="btn btn-ghost btn-sm" onclick="deactivateResource('${r._id}','${r.name}')">Deactivate</button>` : ""}
      </div>
    </div>`;
}

function attachResourceActions() {}

function openRequestForResource(resourceId) {
  $("req-resource-id").value = resourceId;
  showModal("modal-new-request");
}

async function deactivateResource(id, name) {
  if (!confirm(`Deactivate "${name}"? It will no longer be available.`)) return;
  try {
    await Resources.deactivate(id);
    showToast(`"${name}" deactivated`, "success");
    loadResources();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── PAGE: REQUESTS ────────────────────────────────────────────────────────────
async function loadRequests() {
  const container = $("requests-list");
  container.innerHTML = emptyState("⏳", "Loading…");
  try {
    const status = $("req-status-filter").value;
    const params = {};
    if (status) params.status = status;

    const data = await Requests.list(params);
    const requests = data.requests || [];

    if (!requests.length) {
      container.innerHTML = emptyState("📋", "No requests found.");
      return;
    }
    container.innerHTML = requests.map(r => renderRequestCard(r, false)).join("");
    attachRequestActions();
  } catch (err) {
    container.innerHTML = emptyState("❌", err.message);
    showToast("Failed to load requests", "error");
  }
}

function renderRequestCard(r, compact) {
  const isAdmin = currentUser?.role === "city_admin" || currentUser?.role === "department_head";
  const res = r.resource || {};
  const dept = r.requestingDepartment?.name || "—";
  const requester = r.requestedBy?.name || "—";
  const start = r.startDate ? new Date(r.startDate).toLocaleDateString() : "—";
  const end = r.endDate ? new Date(r.endDate).toLocaleDateString() : "—";

  let actions = "";
  if (r.status === "pending" && isAdmin) {
    actions += `<button class="btn btn-success btn-sm" data-action="approve" data-id="${r._id}">✓ Approve</button>`;
    actions += `<button class="btn btn-danger btn-sm" data-action="reject" data-id="${r._id}">✗ Reject</button>`;
  }
  if (r.status === "approved" && isAdmin) {
    actions += `<button class="btn btn-ghost btn-sm" data-action="return" data-id="${r._id}">↩ Return</button>`;
  }
  if (r.status === "pending") {
    actions += `<button class="btn btn-ghost btn-sm" data-action="cancel" data-id="${r._id}">Cancel</button>`;
  }

  return `
    <div class="req-card" id="req-${r._id}">
      <div class="req-card-info">
        <div class="req-card-title">${res.name || "Resource"} — <em>${r.purpose || ""}</em></div>
        <div class="req-card-meta">
          👤 ${requester} &nbsp;|&nbsp; 🏢 ${dept} &nbsp;|&nbsp;
          📅 ${start} → ${end} &nbsp;|&nbsp;
          Qty: ${r.quantityRequested} ${res.unit || ""} &nbsp;|&nbsp;
          ${pill(r.priority || "medium")} &nbsp;
          ${pill(r.status)}
          ${r.rejectionReason ? `<br>❌ Reason: ${r.rejectionReason}` : ""}
        </div>
      </div>
      <div class="req-card-actions">${actions}</div>
    </div>`;
}

function attachRequestActions() {
  document.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      if (action === "approve") await doApprove(id);
      if (action === "reject") openRejectModal(id);
      if (action === "return") await doReturn(id);
      if (action === "cancel") await doCancel(id);
    });
  });
}

async function doApprove(id) {
  try {
    await Requests.approve(id);
    showToast("Request approved! ✅", "success");
    loadRequests();
    if (currentPage === "overview") loadOverview();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openRejectModal(id) {
  pendingRejectId = id;
  $("reject-reason").value = "";
  showModal("modal-reject");
}

async function doReturn(id) {
  try {
    await Requests.return(id);
    showToast("Resource marked as returned ↩", "success");
    loadRequests();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function doCancel(id) {
  if (!confirm("Cancel this request?")) return;
  try {
    await Requests.cancel(id);
    showToast("Request cancelled", "info");
    loadRequests();
    if (currentPage === "overview") loadOverview();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── PAGE: NOTIFICATIONS ───────────────────────────────────────────────────────
async function loadNotifications() {
  const container = $("notifications-list");
  container.innerHTML = emptyState("⏳", "Loading…");
  const unreadOnly = $("unread-toggle").checked;
  try {
    const data = await Notifications.list(unreadOnly);
    const notifs = data.notifications || [];

    if (!notifs.length) {
      container.innerHTML = emptyState("🔔", "No notifications.");
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="notif-card ${!n.isRead ? "unread" : ""}" id="notif-${n._id}">
        <div class="notif-icon">${notifIcon(n.type)}</div>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-msg">${n.message}</div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
        <div class="notif-actions">
          ${!n.isRead ? `<button class="btn btn-ghost btn-sm" onclick="markNotifRead('${n._id}')">Mark read</button>` : ""}
          <button class="btn btn-ghost btn-sm" onclick="deleteNotif('${n._id}')">🗑</button>
        </div>
      </div>`).join("");
  } catch (err) {
    container.innerHTML = emptyState("❌", err.message);
  }
}

function notifIcon(type) {
  const map = {
    request_submitted: "📋",
    request_approved: "✅",
    request_rejected: "❌",
    resource_returned: "↩️",
    resource_conflict: "⚡",
    inventory_low: "⚠️",
    request_cancelled: "🚫",
    audit_alert: "📜",
    general: "🔔"
  };
  return map[type] || "🔔";
}

async function markNotifRead(id) {
  try {
    await Notifications.markRead(id);
    const el = $(`notif-${id}`);
    if (el) el.classList.remove("unread");
    pollNotifications();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteNotif(id) {
  try {
    await Notifications.delete(id);
    const el = $(`notif-${id}`);
    if (el) el.remove();
    pollNotifications();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ── PAGE: AUDIT ───────────────────────────────────────────────────────────────
async function loadAuditLogs() {
  const container = $("audit-list");
  container.innerHTML = emptyState("⏳", "Loading…");
  try {
    const action = $("audit-action-filter").value;
    const params = {};
    if (action) params.action = action;

    const data = await Audit.list(params);
    const logs = data.logs || [];

    if (!logs.length) {
      container.innerHTML = emptyState("📜", "No audit records found.");
      return;
    }

    container.innerHTML = logs.map(l => `
      <div class="audit-card">
        <span class="audit-action">${l.action}</span>
        <span class="audit-desc">${l.description}</span>
        <span class="audit-who">
          👤 ${l.performedBy?.name || "—"}<br>
          <small>${new Date(l.createdAt).toLocaleString()}</small>
        </span>
      </div>`).join("");
  } catch (err) {
    container.innerHTML = emptyState("❌", err.message);
    showToast("Failed to load audit logs", "error");
  }
}

// ── ADD RESOURCE FORM ─────────────────────────────────────────────────────────
async function submitAddResource(e) {
  e.preventDefault();
  const errEl = $("add-res-error");
  hide(errEl);

  const payload = {
    name: $("res-name").value.trim(),
    category: $("res-category").value,
    description: $("res-desc").value.trim(),
    quantity: Number($("res-qty").value),
    unit: $("res-unit").value.trim() || "units",
    ownerDepartment: $("res-dept").value.trim(),
    location: $("res-location").value.trim()
  };

  if (!payload.name || !payload.category || !payload.quantity || !payload.ownerDepartment) {
    errEl.textContent = "Please fill all required fields.";
    show(errEl);
    return;
  }

  try {
    await Resources.create(payload);
    showToast("Resource created! 📦", "success");
    closeModal("modal-add-resource");
    e.target.reset();
    loadResources();
  } catch (err) {
    errEl.textContent = err.message;
    show(errEl);
  }
}

// ── NEW REQUEST FORM ──────────────────────────────────────────────────────────
async function submitNewRequest(e) {
  e.preventDefault();
  const errEl = $("new-req-error");
  hide(errEl);

  const payload = {
    resourceId: $("req-resource-id").value.trim(),
    quantityRequested: Number($("req-qty").value),
    purpose: $("req-purpose").value.trim(),
    startDate: $("req-start").value,
    endDate: $("req-end").value,
    priority: $("req-priority").value,
    notes: $("req-notes").value.trim()
  };

  if (!payload.resourceId || !payload.quantityRequested || !payload.purpose || !payload.startDate || !payload.endDate) {
    errEl.textContent = "Please fill all required fields.";
    show(errEl);
    return;
  }

  try {
    await Requests.submit(payload);
    showToast("Request submitted! ✅", "success");
    closeModal("modal-new-request");
    e.target.reset();
    loadRequests();
    if (currentPage === "overview") loadOverview();
  } catch (err) {
    errEl.textContent = err.message;
    show(errEl);
  }
}

// ── MODALS ────────────────────────────────────────────────────────────────────
function showModal(id) {
  show($(id));
}
function closeModal(id) {
  hide($(id));
}

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

  // Auto-login if token exists
  const saved = localStorage.getItem("cs_user");
  const token = localStorage.getItem("cs_token");
  if (saved && token) {
    currentUser = JSON.parse(saved);
    bootDashboard();
  }

  // Login form
  $("login-form").addEventListener("submit", tryLogin);

  // Logout
  $("logout-btn").addEventListener("click", logout);

  // Sidebar nav
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.page));
  });

  // Refresh
  $("refresh-btn").addEventListener("click", () => navigateTo(currentPage));

  // Bell click → go to notifications
  $("notif-bell").addEventListener("click", () => navigateTo("notifications"));

  // Add resource button
  $("add-resource-btn")?.addEventListener("click", () => showModal("modal-add-resource"));

  // New request button
  $("new-request-btn").addEventListener("click", () => showModal("modal-new-request"));

  // Resource search + filter
  $("resource-search").addEventListener("input", loadResources);
  $("resource-cat-filter").addEventListener("change", loadResources);

  // Request filter
  $("req-status-filter").addEventListener("change", loadRequests);

  // Notification toggle
  $("unread-toggle").addEventListener("change", loadNotifications);

  // Mark all read
  $("mark-all-read-btn").addEventListener("click", async () => {
    try {
      await Notifications.markAllRead();
      showToast("All notifications marked as read", "info");
      loadNotifications();
      pollNotifications();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Audit load
  $("audit-load-btn")?.addEventListener("click", loadAuditLogs);
  $("audit-action-filter")?.addEventListener("change", loadAuditLogs);

  // Add resource form
  $("form-add-resource").addEventListener("submit", submitAddResource);

  // New request form
  $("form-new-request").addEventListener("submit", submitNewRequest);

  // Confirm reject
  $("confirm-reject-btn").addEventListener("click", async () => {
    if (!pendingRejectId) return;
    const reason = $("reject-reason").value.trim();
    try {
      await Requests.reject(pendingRejectId, reason);
      showToast("Request rejected ❌", "info");
      closeModal("modal-reject");
      pendingRejectId = null;
      loadRequests();
      if (currentPage === "overview") loadOverview();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Modal close buttons
  document.querySelectorAll(".modal-close, [data-modal]").forEach(btn => {
    btn.addEventListener("click", () => closeModal(btn.dataset.modal || btn.closest(".modal-overlay")?.id));
  });

  // Close modal on overlay click
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
});
