let currentChartInstance = null;
let currentLang = 'en'; // Centered global language footprint

function navigateTo(targetPageId) {
  const viewport = document.getElementById("mainViewport");
  const template = document.getElementById(`view-${targetPageId}`);

  if (!template) return;

  // 1. Wipe and swap in the raw layout template markup clone
  viewport.innerHTML = "";
  viewport.appendChild(template.content.cloneNode(true));

  // 2. Immediately execute layout translation rendering on new nodes
  applyLanguage(currentLang);

  // 3. Update the active sidebar linkage states
  document.querySelectorAll(".sidebar .nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  const activeLink = document.getElementById(`nav-${targetPageId}`);
  if (activeLink) activeLink.classList.add("active");

  // 4. Update translation bound footer matrix indicators
  updateFooterStatus(targetPageId);

  // --- CHART TELEMETRY MATRIX BOOTSTRAPPER ---
  if (targetPageId === "dashboard") {
    initializeDashboardChart();
  }
}

function initializeDashboardChart() {
  const ctx = document.getElementById("dashboardChart");
  if (!ctx) return;

  // Destroy old instances during view swaps to avoid memory leakage
  if (currentChartInstance) {
    currentChartInstance.destroy();
  }

  // Dynamic color extraction based on your CSS variables configuration
  const rootStyles = getComputedStyle(document.documentElement);
  const inkText = rootStyles.getPropertyValue("--studio-text").trim();
  const inkSecondary = rootStyles
    .getPropertyValue("--btn-text-secondary")
    .trim();
  const inkAction = rootStyles.getPropertyValue("--btn-text-action").trim();

  currentChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00"],
      datasets: [
        {
          label: "Primary Line Output",
          data: [65, 78, 72, 89, 85, 94, 98],
          borderColor: inkSecondary, // Terracotta / Clay Ink Color matching theme
          backgroundColor: "transparent",
          borderWidth: 2.5,
          pointBackgroundColor: inkSecondary,
          pointRadius: 3,
          tension: 0.35,
        },
        {
          label: "Variance Level",
          data: [40, 45, 38, 50, 42, 41, 39],
          borderColor: inkAction, // Copper / Burning Amber Ink Color matching theme
          backgroundColor: "transparent",
          borderWidth: 1.5,
          borderDash: [5, 5],
          pointBackgroundColor: "transparent",
          pointRadius: 0,
          tension: 0.2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: inkText, font: { weight: "600", size: 11 } },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: inkText, opacity: 0.6, font: { size: 10 } },
        },
        y: {
          grid: { color: "rgba(90, 85, 80, 0.08)" },
          ticks: { color: inkText, opacity: 0.6, font: { size: 10 } },
        },
      },
    },
  });
}

// Hook into the theme toggle script to swap chart colors live
function handleThemeSwitch() {
  const htmlNode = document.documentElement;
  const themeIcon = document.getElementById("themeIcon");

  if (htmlNode.getAttribute("data-bs-theme") === "light") {
    htmlNode.setAttribute("data-bs-theme", "dark");
    themeIcon.className = "bi bi-sun";
  } else {
    htmlNode.setAttribute("data-bs-theme", "light");
    themeIcon.className = "bi bi-moon-stars";
  }

  // Force redraw chart parameters if we are currently standing on the dashboard panel view
  const ctx = document.getElementById("dashboardChart");
  if (ctx) {
    setTimeout(initializeDashboardChart, 50);
  }
}

// Handled elegantly via global language mechanics to avoid string conflicts
function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  applyLanguage(currentLang);

  // Sync active views like Charts or Footers dynamically on translation changes
  const ctx = document.getElementById("dashboardChart");
  if (ctx) {
    setTimeout(initializeDashboardChart, 50);
  }
}

function handleDirectionSwitch() {
  // Leverages centralized translation context mechanism safely 
  toggleLanguage();
}

function applyLanguage(lang) {
  const htmlTag = document.documentElement;
  const dirText = document.getElementById("dirText");

  // 1. Update document attributes for layout direction
  if (lang === 'ar') {
    htmlTag.setAttribute('dir', 'rtl');
    htmlTag.setAttribute('lang', 'ar');
    if (dirText) dirText.innerText = "LTR";
  } else {
    htmlTag.setAttribute('dir', 'ltr');
    htmlTag.setAttribute('lang', 'en');
    if (dirText) dirText.innerText = "RTL";
  }

  // 2. Loop through and translate all visible text elements inside target deck
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      element.textContent = translations[lang][key];
    }
  });

  // 3. Native Form Attribute/Tooltip Translations
  const iconButtons = [
    { id: 'btnFormGear', key: 'tip_form_gear' },
    { id: 'btnFormSearch', key: 'tip_form_search' },
    { id: 'btnFormPlus', key: 'tip_form_plus' },
    { id: 'btnFormTrash', key: 'tip_form_trash' }
  ];
  iconButtons.forEach(btn => {
    const el = document.getElementById(btn.id);
    if (el && translations[lang] && translations[lang][btn.key]) {
      el.setAttribute('title', translations[lang][btn.key]);
    }
  });

  // 4. Update toggle button UI text indicators
  const langLabel = document.getElementById('currentLangLabel');
  if (langLabel && translations[lang]['lang_label']) {
    langLabel.textContent = translations[lang]['lang_label'];
  }

  localStorage.setItem('timber_lang', lang);

  // 5. Ensure the footer string matches the new language instantly
  const activeLink = document.querySelector(".sidebar .nav-link.active");
  if (activeLink) {
    const activeDeckId = activeLink.id.replace("nav-", "");
    updateFooterStatus(activeDeckId);
  }
}

function updateFooterStatus(deckKey) {
  const footerStatus = document.getElementById('footerMatrixStatus');
  if (!footerStatus) return;

  // Look up translated text from dictionary keys directly
  const localizedPageName = translations[currentLang][`side_${deckKey}`] || deckKey;
  const prefix = translations[currentLang]['deck_prefix'] || "Active Deck: ";

  footerStatus.textContent = `${prefix}${localizedPageName}`;
}

// Global App Initialization
document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem('timber_lang') || 'en';
  currentLang = savedLang;

  // Set global direction profiles first
  applyLanguage(currentLang);

  // Initialize App default view router
  navigateTo("dashboard");

  // Accordion open heights configuration
  document.querySelectorAll('.wood-accordion-item.open .wood-accordion-collapse').forEach(collapse => {
    const body = collapse.querySelector('.wood-accordion-body');
    collapse.style.setProperty('--collapse-height', `${body.scrollHeight + 40}px`);
  });
});

// --- SIDEBAR MOBILE TOGGLE ---
function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("show");
  document.getElementById("sidebarOverlay").classList.toggle("show");
}

// --- MODAL CONTROLS ---
function openWoodModal() {
  document.getElementById("woodModal").style.display = "flex";
}
function closeWoodModal() {
  document.getElementById("woodModal").style.display = "none";
}

// --- POPOVER TOGGLE ---
function toggleWoodPopover() {
  document.getElementById("demoPopover").classList.toggle("show");
}

// --- TOAST SYSTEM ---
const toastIcons = {
  success: "bi-check-circle-fill btn-wood-success",
  danger: "bi-exclamation-triangle-fill btn-wood-danger",
  secondary: "bi-info-circle-fill btn-wood-secondary",
  action: "bi-lightning-charge-fill btn-wood-action",
};

function showToast(type, titleKey, messageKey) {
  const currentLang = document.documentElement.lang || 'en';
  const dict = translations[currentLang] || translations['en'];

  const translatedTitle = dict[titleKey] || titleKey;
  const translatedMessage = dict[messageKey] || messageKey;
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `wood-toast ${type === "success" ? "btn-wood-success" : type === "danger" ? "btn-wood-danger" : "btn-wood-secondary"}`;

  toast.innerHTML = `
        <i class="bi ${toastIcons[type] || toastIcons.secondary} wood-toast-icon"></i>
        <div class="wood-toast-content">
            <div class="wood-toast-title">${translatedTitle}</div>
            <div class="wood-toast-message">${translatedMessage}</div>
        </div>
        <button class="btn-close-raised" onclick="dismissToast(this)"><i class="bi bi-x"></i></button>
    `;

  container.appendChild(toast);

  setTimeout(
    () => dismissToast(toast.querySelector(".btn-close-raised")),
    5000,
  );
}

function dismissToast(closeBtn) {
  const toast = closeBtn.closest(".wood-toast");
  toast.classList.add("toast-leaving");
  setTimeout(() => toast.remove(), 250);
}

// --- ACCORDION TOGGLE ---
function toggleAccordion(headerEl) {
  const item = headerEl.closest('.wood-accordion-item');
  if (item.classList.contains('disabled')) return;

  const collapse = item.querySelector('.wood-accordion-collapse');
  const body = item.querySelector('.wood-accordion-body');
  const isOpen = item.classList.contains('open');

  if (isOpen) {
    item.classList.remove('open');
  } else {
    item.classList.add('open');
    collapse.style.setProperty('--collapse-height', `${body.scrollHeight + 40}px`);
  }
}

// --- SIDEBAR NESTED NAV TOGGLE ---
function toggleNavGroup(event, toggleEl) {
  event.preventDefault();
  const group = toggleEl.closest('.nav-group');
  const submenu = group.querySelector('.nav-submenu');
  const isOpen = group.classList.contains('open');

  if (isOpen) {
    group.classList.remove('open');
  } else {
    group.classList.add('open');
    submenu.style.setProperty('--submenu-height', `${submenu.scrollHeight}px`);
  }
}

// --- ROCKER SEGMENT TOGGLE ---
function toggleRocker(segmentEl) {
  const track = segmentEl.closest('.wood-rocker-track');
  track.querySelectorAll('.rocker-segment').forEach(seg => seg.classList.remove('active'));
  segmentEl.classList.add('active');
}

// --- PRICING PERIOD TOGGLE ---
function togglePricingPeriod(period) {
  document.querySelectorAll('.price-monthly').forEach(el => {
    el.classList.toggle('d-none', period === 'annual');
  });
  document.querySelectorAll('.price-annual').forEach(el => {
    el.classList.toggle('d-none', period === 'monthly');
  });
}

// Translation Dictionary Block
const translations = {
  en: {
    side_dashboard: "Dashboard",
    side_forms: "Form Elements",
    side_stats: "System Stats",
    side_components: "Components",
    side_sample_pages: "Sample Pages",
    side_profile: "Profile Page",
    side_pricing: "Pricing Table",
    side_faq: "FAQ Page",
    side_projects: "Projects",
    side_matrix_title: "Surface Matrix",
    side_dropdown_specular: "Specular Profile",
    side_dropdown_reset: "Reset Vectors",
    footer_coordinates: "Material Coordinates Bound",
    footer_active_deck: "Active Deck: Dashboard",
    deck_prefix: "Active Deck: ",
    dash_title: "Chrominance Control Dashboard",
    dash_stat_nodes_lbl: "Active Matrix Nodes",
    dash_stat_nodes_trend: "+12% vs Epoch",
    dash_stat_lumi_lbl: "Luminance Output",
    dash_stat_lumi_trend: "Optimal Balance",
    dash_stat_spec_lbl: "Specular Variance",
    dash_stat_spec_trend: "-3.1% Lower Variance",
    dash_chart_title: "Frequency Waveform Diagnostics",
    dash_chart_lbl: "Live Graph Output",
    dash_panel_canvas_title: "Continuous Milled Canvas",
    dash_panel_canvas_desc: "The background deck and modules are color-locked. The raw linear grain textures run completely uninterrupted without breaking boundaries.",
    dash_panel_typo_title: "Typographic Hierarchy",
    dash_panel_typo_desc: "Interface actions drop flat material boxes for pure laser-etched contrast ink, letting the clean architecture remain unblemished.",
    forms_title: "Form Controls Console",
    forms_param_node_entry: "Parameter Node Entry",
    forms_registry_label: "Registry Node Label",
    forms_chroma_channel: "Chroma Frequency Channel",
    forms_select_placeholder: "Select Channel Matrix...",
    forms_opt_terracotta: "Terracotta Shift (#BF7A43)",
    forms_opt_copper: "Copper Action (#C46510)",
    forms_opt_moss: "Moss Olive (#7A8568)",
    forms_registry_desc: "Registry Node Desc",
    forms_checkboxes_title: "Checkboxes, Radios & Switches",
    forms_chk_diagnostics: "Enable diagnostics overlay",
    forms_chk_recalibrate: "Auto-recalibrate nodes",
    forms_chk_locked: "Locked parameter (disabled)",
    forms_rad_linear: "Linear Grain Mode",
    forms_rad_cross: "Cross Grain Mode",
    forms_sw_telemetry: "Live telemetry sync",
    forms_sw_override: "Override safe mode",
    forms_btn_cancel: "Cancel",
    forms_btn_commit: "Execute Matrix Commit",
    forms_btn_controls_title: "Button Controls",
    forms_lbl_intents: "Intent Variants",
    forms_btn_primary: "Primary",
    forms_btn_secondary: "Secondary",
    forms_btn_action: "Action",
    forms_btn_success: "Success",
    forms_btn_danger: "Danger",
    forms_btn_accent: "Accent",
    forms_lbl_sizes: "Sizes",
    forms_size_sm: "Small",
    forms_size_def: "Default",
    forms_size_lg: "Large",
    forms_lbl_icon_only: "Icon Only",
    forms_lbl_states: "States",
    forms_state_normal: "Normal",
    forms_state_pressed: "Pressed",
    forms_state_disabled: "Disabled",
    forms_lbl_groups: "Grouped Actions",
    forms_grp_list: "List",
    forms_grp_grid: "Grid",
    forms_grp_card: "Card",
    forms_lbl_block: "Block Width",
    forms_btn_upload: "Upload Configuration",
    forms_btn_reset: "Reset to Defaults",
    forms_lbl_loading: "Loading State",
    forms_btn_processing: "Processing...",
    tip_form_gear: "Settings Profile",
    tip_form_search: "Query Registry",
    tip_form_plus: "Insert Array",
    tip_form_trash: "Purge Component",
    lang_label: "English",
    stats_main_title: "System Node Registry & Stats",
    stats_ledger_title: "Live Node Calibration Ledger",
    stats_th_node: "Node Identification",
    stats_th_state: "Matrix State",
    stats_th_lumi: "Luminance",
    stats_th_actions: "Actions",
    stats_lbl_addr: "Addr",
    stats_lbl_stable: "Stable",
    stats_lbl_variance: "Variance",
    stats_status_operational: "Operational",
    stats_status_fault: "Mismatch Fault",
    comp_showcase_title: "Component Showcase",
    comp_section_badges: "Badges",
    comp_badge_secondary: "Secondary",
    comp_badge_action: "Action",
    comp_badge_success: "Success",
    comp_badge_danger: "Danger",
    comp_badge_inset_accent: "Inset Accent",
    comp_section_tooltips: "Tooltips & Popovers",
    comp_btn_hover_tt: "Hover for tooltip",
    comp_tt_content: "Specular variance: 0.04%",
    comp_btn_toggle_pop: "Toggle popover",
    comp_pop_title: "Node Details",
    comp_pop_body: "Core-Module-Alpha is operating at 85% stability with nominal luminance output.",
    comp_section_modals: "Modals & Toasts",
    comp_btn_open_mod: "Open Modal",
    comp_btn_toast_succ: "Success Toast",
    comp_btn_toast_dang: "Danger Toast",
    comp_section_progress: "Progress Bars",
    comp_section_pagination: "Pagination",
    comp_section_accordion: "Accordion",
    comp_acc_header_matrix: "Matrix Node Configuration",
    comp_acc_body_matrix: "Configure the active matrix nodes including frequency channel assignment, luminance thresholds, and specular variance tolerances for the calibration ledger.",
    comp_acc_header_diag: "System Diagnostics",
    comp_acc_body_diag: "Run a full diagnostic sweep across all registered nodes to verify operational status, surface mismatch faults, and recalibrate variance baselines.",
    comp_acc_header_locked: "Locked Settings",
    comp_acc_body_locked: "These settings are locked pending administrator approval.",
    comp_section_flush: "Accordion (Flush)",
    comp_flush_q1: "What is Specular Variance?",
    comp_flush_a1: "A measure of deviation in surface reflectivity across the matrix nodes. Lower values indicate more consistent material calibration.",
    comp_flush_q2: "How often should I recalibrate?",
    comp_flush_a2: "Recalibration is recommended every 72 hours, or immediately following a mismatch fault on any registered node.",
    comp_flush_q3: "Can I export the calibration ledger?",
    comp_flush_a3: "Yes — use the export action from the System Stats deck to download the current ledger as a structured report.",
    comp_section_skeletons: "Skeleton Loaders",
    comp_section_cards: "Cards",
    comp_card_sub1: "Calibration Node",
    comp_card_text1: "Primary processing unit running at nominal specular variance with stable luminance throughput.",
    comp_btn_view_det: "View Details",
    comp_card_sub2: "Fault Alert",
    comp_card_text2: "Mismatch fault detected — 41% variance exceeds the safe calibration threshold.",
    comp_lbl_addr: "Addr",
    comp_btn_resolve: "Resolve",
    comp_card_sub3: "Summary",
    comp_card_title3: "Weekly Output",
    comp_card_text3: "Aggregate luminance across all active nodes increased 12% over the previous epoch.",
    comp_card_meta3: "Updated 2h ago",
    comp_card_sub4: "Registry Entry",
    comp_card_text4: "Secondary support module operating at 92% stability — no action required at this time.",
    comp_empty_title: "No Calibration Records Found",
    comp_empty_desc: "Run a diagnostic sweep to populate the node registry.",
    comp_btn_run_sweep: "Run Diagnostic Sweep",
    prof_title_operator: "Operator Profile",
    prof_role_senior_operator: "Senior Matrix Operator",
    prof_status_online: "Online",
    prof_status_verified: "Verified",
    prof_bio_text: "Responsible for calibration oversight across Core and Bevel node clusters. Member since 2023.",
    prof_btn_edit: "Edit Profile",
    prof_loc_abudhabi: "Abu Dhabi, AE",
    prof_section_contact: "Contact Information",
    prof_lbl_email: "Email",
    prof_lbl_phone: "Phone",
    prof_lbl_access: "Node Access Level",
    prof_val_access_tier: "Tier 3 — Full",
    prof_stat_managed: "Nodes Managed",
    prof_stat_calibrations: "Calibrations",
    prof_stat_faults: "Open Faults",
    prof_section_proficiency: "Proficiency Matrix",
    prof_skill_specular: "Specular Calibration",
    prof_skill_frequency: "Frequency Diagnostics",
    prof_skill_resolution: "Fault Resolution",
    prof_skill_protocols: "System Override Protocols",
    prof_section_activity: "Recent Activity",
    prof_act_title1: "Recalibrated Bevel-Vector-Beta",
    prof_act_meta1: "Variance reduced to 8% — 2 hours ago",
    prof_act_title2: "Flagged Specular-Chroma-Delta",
    prof_act_meta2: "Mismatch fault logged — 5 hours ago",
    prof_act_title3: "Updated Chroma Frequency Channel",
    prof_act_meta3: "Core-Module-Alpha — yesterday",
    prc_title_tiers: "Subscription Tiers",
    prc_intro_title: "Choose your matrix capacity",
    prc_intro_desc: "All tiers include core diagnostics and the calibration ledger. Upgrade for expanded node capacity and override protocols.",
    prc_period_monthly: "Monthly",
    prc_period_annual: "Annual",
    prc_tier1_badge: "Starter",
    prc_tier1_title: "Core Access",
    prc_lbl_per_month: "/ month",
    prc_tier1_desc: "For individual operators managing a small registry of calibration nodes.",
    prc_feat_nodes_10: "Up to 10 active nodes",
    prc_feat_ledger: "Calibration ledger",
    prc_feat_diag_std: "Standard diagnostics",
    prc_feat_override: "Override protocols",
    prc_feat_support_prio: "Priority support",
    prc_btn_get_started: "Get Started",
    prc_tier2_badge: "Professional",
    prc_lbl_popular: "Most Popular",
    prc_tier2_title: "Expanded Matrix",
    prc_tier2_desc: "For teams running active calibration sweeps across multiple node clusters.",
    prc_feat_nodes_100: "Up to 100 active nodes",
    prc_feat_diag_adv: "Advanced diagnostics",
    prc_tier3_badge: "Enterprise",
    prc_tier3_title: "Full Deployment",
    prc_tier3_desc: "For organizations operating unlimited nodes with dedicated support.",
    prc_feat_nodes_unlimited: "Unlimited active nodes",
    prc_btn_contact_sales: "Contact Sales",
    prc_footer_note_prefix: "Need a custom configuration?",
    prc_footer_note_action: "Contact our team",
    prc_footer_note_suffix: "for tailored node allocations and SLA terms.",
    faq_title: "Frequently Asked Questions",
    faq_intro_title: "How can we help?",
    faq_intro_desc: "Browse common questions about matrix calibration, node management, and system diagnostics below.",
    faq_search_placeholder: "Search questions...",
    faq_cat_all: "All",
    faq_cat_calibration: "Calibration",
    faq_cat_nodes: "Nodes",
    faq_cat_account: "Account",
    faq_cat_billing: "Billing",
    faq_q_specular: "What is Specular Variance?",
    faq_a_specular: "A measure of deviation in surface reflectivity across the matrix nodes. Lower values indicate more consistent material calibration. Values above 30% typically trigger a mismatch fault flag on the System Stats deck.",
    faq_q_recalibrate: "How often should I recalibrate?",
    faq_a_recalibrate: "Recalibration is recommended every 72 hours under normal operating conditions, or immediately following a mismatch fault on any registered node.",
    faq_q_automation: "Can calibration be automated?",
    faq_a_automation: "Yes — enable Auto-recalibrate from the Form Elements console to schedule calibration sweeps at fixed intervals without manual intervention.",
    faq_section_nodes: "Nodes & Registry",
    faq_q_add_node: "How do I add a new node to the registry?",
    faq_a_add_node: "Navigate to Form Elements, enter a Registry Node Label and assign a Chroma Frequency Channel, then select Execute Matrix Commit to register the node.",
    faq_q_mismatch: "What does \"Mismatch Fault\" mean?",
    faq_a_mismatch: "A node has reported specular variance exceeding the safe threshold (typically 30%). Review the node's calibration history and run a diagnostic sweep to resolve.",
    faq_q_export: "Can I export the calibration ledger?",
    faq_a_export: "Yes — use the export action from the System Stats deck to download the current ledger as a structured report.",
    faq_section_account: "Account & Access",
    faq_q_tier: "How do I change my access tier?",
    faq_a_tier: "Access tier changes must be requested from a Tier 3 operator. Contact your system administrator to initiate an access review.",
    faq_q_privacy: "Is my profile data shared with other operators?",
    faq_a_privacy: "Only your name, role, and online status are visible to other operators. Contact information and access tier remain private to administrators.",
    faq_footer_title: "Still need help?",
    faq_footer_desc: "Our support team can assist with node configuration, calibration issues, and account access.",
    faq_btn_support: "Contact Support",
    proj_title: "Projects Progress",
    proj_btn_new: "New Project",
    proj_stat_active: "Active Projects",
    proj_status_on_track: "On Track",
    proj_status_at_risk: "At Risk",
    proj_status_in_progress: "In Progress",
    proj_stat_avg_completion: "Avg. Completion",
    proj_lbl_progress: "Progress",
    proj_btn_view: "View",
    proj_table_heading: "All Projects",
    proj_th_project: "Project",
    proj_th_status: "Status",
    proj_th_progress: "Progress",
    proj_th_deadline: "Deadline",
    proj_th_actions: "Actions",

    // Dynamic Context Strings
    proj_cat_core: "Core Systems",
    proj_cat_diagnostics: "Diagnostics",
    proj_cat_interface: "Interface",

    proj_name_migration: "Matrix Node Migration",
    proj_desc_migration: "Migrating legacy node clusters to the new specular calibration framework.",
    proj_tasks_migration: "18/22 tasks",
    proj_due_jul_28: "Due Jul 28",
    proj_date_jul_28_2026: "Jul 28, 2026",

    proj_name_fault: "Fault Detection Overhaul",
    proj_desc_fault: "Rebuilding the mismatch fault pipeline with real-time variance alerts.",
    proj_tasks_fault: "7/20 tasks",
    proj_due_jun_30: "Due Jun 30",
    proj_date_jun_30_2026: "Jun 30, 2026",

    proj_name_mobile: "Mobile Console Rollout",
    proj_desc_mobile: "Expanding the carved-wood interface to mobile sidebar and touch controls.",
    proj_tasks_mobile: "12/21 tasks",
    proj_due_aug_15: "Due Aug 15",
    proj_date_aug_15_2026: "Aug 15, 2026",

    proj_name_ledger: "Calibration Ledger v2",
    proj_date_jun_20_2026: "Jun 20, 2026",

    proj_name_rtl: "RTL Layout Audit",
    proj_date_jul_10_2026: "Jul 10, 2026",

    proj_name_override: "Override Protocol Audit",
    proj_date_jun_25_2026: "Jun 25, 2026",
    modal_commit_title: "Confirm Matrix Commit",
    modal_commit_body: "This action will permanently bind the current chroma frequency channel configuration to the active node registry. Continue?",
    modal_btn_cancel: "Cancel",
    modal_btn_confirm: "Confirm Commit",
    comp_btn_toast_succ: "Success Toast",
    comp_btn_toast_dang: "Danger Toast",
    toast_sync_complete_title: "Sync Complete",
    toast_sync_complete_msg: "All matrix nodes recalibrated successfully.",
    toast_fault_detected_title: "Fault Detected",
    toast_fault_detected_msg: "Specular-Chroma-Delta reported a mismatch fault.",
  },
  ar: {
    side_dashboard: "لوحة التحكم",
    side_forms: "عناصر النماذج",
    side_stats: "إحصائيات النظام",
    side_components: "العناصر البرمجية",
    side_sample_pages: "نماذج الصفحات",
    side_profile: "ملف المستخدم",
    side_pricing: "قائمة الأسعار",
    side_faq: "الأسئلة الشائعة",
    side_projects: "المشاريع",
    side_matrix_title: "مصفوفة الأسطح",
    side_dropdown_specular: "ملف الانعكاس",
    side_dropdown_reset: "إعادة ضبط المتجهات",
    footer_coordinates: "تم ربط إحداثيات المواد",
    footer_active_deck: "المنصة النشطة: لوحة التحكم",
    deck_prefix: "المنصة النشطة: ",
    dash_title: "لوحة التحكم في التلوين المتقدم",
    dash_stat_nodes_lbl: "عقد Matrix النشطة",
    dash_stat_nodes_trend: "+12% مقارنة بالحقبة",
    dash_stat_lumi_lbl: "خرجات الإضاءة الكلية",
    dash_stat_lumi_trend: "توازن مثالي",
    dash_stat_spec_lbl: "تباين الانعكاسات",
    dash_stat_spec_trend: "-3.1% تباين أقل",
    dash_chart_title: "تشخيصات الطيف الترددي موجي",
    dash_chart_lbl: "مخطط حي مباشر",
    dash_panel_canvas_title: "لوحة مصقولة مستمرة",
    dash_panel_canvas_desc: "المنصة الخلفية والوحدات مؤمنة الألوان. تمتد تفاصيل الخشب الخطية الخام بشكل كامل ومستمر دون انقطاع عبر الفواصل المعمارية.",
    dash_panel_typo_title: "الهرمية الخطية والنصية",
    dash_panel_typo_desc: "تعتمد إجراءات واجهة المستخدم على مربعات مسطحة تعطي تبايناً ناصعاً بنقش ليزري، مما يترك نقاء التصميم الهندسي للمنصة خالياً من العيوب.",
    forms_title: "لوحة التحكم بعناصر النماذج",
    forms_param_node_entry: "إدخل معلمات العقدة",
    forms_registry_label: "ملصق عقدة السجل",
    forms_chroma_channel: "قناة تردد الكروما",
    forms_select_placeholder: "اختر مصفوفة القنوات...",
    forms_opt_terracotta: "إزاحة الطين النضيج (#BF7A43)",
    forms_opt_copper: "إجراء النحاس الأكسيدي (#C46510)",
    forms_opt_moss: "الزيتون الطحلبي (#7A8568)",
    forms_registry_desc: "وصف عقدة السجل",
    forms_checkboxes_title: "خانات الاختيار، أزرار الخيار والمفاتيح",
    forms_chk_diagnostics: "تفعيل طبقة التشخيصات",
    forms_chk_recalibrate: "إعادة معايرة العقد تلقائياً",
    forms_chk_locked: "المعلمة مقفلة (معطلة)",
    forms_rad_linear: "وضع الألياف الطولية",
    forms_rad_cross: "وضع الألياف المتعامدة",
    forms_sw_telemetry: "مزامنة القياس عن بعد حية",
    forms_sw_override: "تجاوز الوضع الآمن",
    forms_btn_cancel: "إلغاء الأمر",
    forms_btn_commit: "تنفيذ ربط مصفوفة البيانات",
    forms_btn_controls_title: "أنظمة التحكم بالأزرار",
    forms_lbl_intents: "متغيرات الأنماط",
    forms_btn_primary: "أساسي",
    forms_btn_secondary: "ثانوي",
    forms_btn_action: "إجراء مباشر",
    forms_btn_success: "تأكيد ناجح",
    forms_btn_danger: "تحذير خطر",
    forms_btn_accent: "تمييز لوني",
    forms_lbl_sizes: "الأحجام",
    forms_size_sm: "صغير",
    forms_size_def: "افتراضي",
    forms_size_lg: "كبير",
    forms_lbl_icon_only: "رموز فقط",
    forms_lbl_states: "الحالات البرمجية",
    forms_state_normal: "طبيعي",
    forms_state_pressed: "مضغوط",
    forms_state_disabled: "معطل",
    forms_lbl_groups: "الإجراءات المجمعة",
    forms_grp_list: "قائمة",
    forms_grp_grid: "شبكة",
    forms_grp_card: "بطاقات",
    forms_lbl_block: "العرض الكامل للمنصة",
    forms_btn_upload: "رفع ملف التكوين",
    forms_btn_reset: "إعادة ضبط للمصنع",
    forms_lbl_loading: "حالة التحميل",
    forms_btn_processing: "جاري المعالجة...",
    tip_form_gear: "ملف الإعدادات",
    tip_form_search: "الاستعلام عن السجل",
    tip_form_plus: "إدراج مصفوفة",
    tip_form_trash: "تطهير المكون",
    lang_label: "العربية",
    stats_main_title: "سجل عقد النظام والإحصائيات",
    stats_ledger_title: "دفتر معايرة العقد المباشر",
    stats_th_node: "تعريف العقدة",
    stats_th_state: "حالة المصفوفة",
    stats_th_lumi: "شدة الإضاءة",
    stats_th_actions: "الإجراءات",
    stats_lbl_addr: "العنوان",
    stats_lbl_stable: "مستقر",
    stats_lbl_variance: "تباين",
    stats_status_operational: "يعمل بكفاءة",
    stats_status_fault: "خطأ في التطابق",
    comp_showcase_title: "معرض المكونات",
    comp_section_badges: "الشارات",
    comp_badge_secondary: "ثانوي",
    comp_badge_action: "إجراء",
    comp_badge_success: "ناجح",
    comp_badge_danger: "خطر",
    comp_badge_inset_accent: "مخطط داخلي متميز",
    comp_section_tooltips: "تلميحات الأدوات والنوافذ المنبثقة",
    comp_btn_hover_tt: "مرر هنا للتلميح",
    comp_tt_content: "تباين الانعكاس المرآتي: 0.04%",
    comp_btn_toggle_pop: "تبديل النافذة المنبثقة",
    comp_pop_title: "تفاصيل العقدة",
    comp_pop_body: "تعمل العقدة الأساسية ألفا (Core-Module-Alpha) بمعدل استقرار 85% مع مخرجات إضاءة اسمية.",
    comp_section_modals: "النوافذ الحوارية والإشعارات",
    comp_btn_open_mod: "فتح النافذة الحوارية",
    comp_btn_toast_succ: "إشعار نجاح",
    comp_btn_toast_dang: "إشعار خطر",
    comp_section_progress: "أشرطة التقدم",
    comp_section_pagination: "التصفح الرقمي",
    comp_section_accordion: "قائمة منسدلة مطوية (الأكورديون)",
    comp_acc_header_matrix: "تهيئة عقد المصفوفة",
    comp_acc_body_matrix: "تكوين عقد المصفوفة النشطة بما في ذلك تخصيص قنوات التردد، وعتبات شدة الإضاءة، وتفاوتات تباين الانعكاس المرآتي لدفتر المعايرة.",
    comp_acc_header_diag: "تشخيص النظام",
    comp_acc_body_diag: "إجراء مسح تشخيصي كامل عبر جميع العقد المسجلة للتحقق من الحالة التشغيلية، وأخطاء عدم تطابق الأسطح، وإعادة معايرة خطوط الأساس للتباين.",
    comp_acc_header_locked: "الإعدادات المقفلة",
    comp_acc_body_locked: "هذه الإعدادات مقفلة في انتظار موافقة المسؤول.",
    comp_section_flush: "أكورديون (مستوٍ بدون حواف)",
    comp_flush_q1: "ما هو تباين الانعكاس المرآتي (Specular Variance)؟",
    comp_flush_a1: "هو مقياس للانحراف في انعكاسية الأسطح عبر عقد المصفوفة. تشير القيم الأقل إلى معايرة أكثر اتساقًا للمواد.",
    comp_flush_q2: "كم مرة يجب عليّ إعادة المعايرة؟",
    comp_flush_a2: "يوصى بإعادة المعايرة كل 72 ساعة، أو فورًا بعد حدوث خطأ عدم تطابق في أي عقدة مسجلة.",
    comp_flush_q3: "هل يمكنني تصدير دفتر المعايرة؟",
    comp_flush_a3: "نعم — استخدم إجراء التصدير من لوحة إحصائيات النظام لتنزيل الدفتر الحالي كتقرير منظم.",
    comp_section_skeletons: "هياكل التحميل المؤقتة",
    comp_section_cards: "البطاقات",
    comp_card_sub1: "عقدة المعايرة",
    comp_card_text1: "وحدة المعالجة الرئيسية التي تعمل بتباين مرآتي اسمي وإنتاجية إضاءة مستقرة.",
    comp_btn_view_det: "عرض التفاصيل",
    comp_card_sub2: "تنبيه خطأ",
    comp_card_text2: "تم اكتشاف خطأ في التطابق — التباين بنسبة 41% يتجاوز حد المعايرة الآمن.",
    comp_lbl_addr: "العنوان",
    comp_btn_resolve: "حل المشكلة",
    comp_card_sub3: "ملخص",
    comp_card_title3: "الإنتاج الأسبوعي",
    comp_card_text3: "ارتفع إجمالي شدة الإضاءة عبر جميع العقد النشطة بنسبة 12% مقارنة بالحقبة السابقة.",
    comp_card_meta3: "تحديث منذ ساعتين",
    comp_card_sub4: "قيد السجل",
    comp_card_text4: "وحدة الدعم الثانوية تعمل بمعدل استقرار 92% — لا يتطلب اتخاذ أي إجراء في الوقت الحالي.",
    comp_empty_title: "لم يتم العثور على سجلات معايرة",
    comp_empty_desc: "قم بتشغيل مسح تشخيصي لتعبئة سجل العقد بالنظام.",
    comp_btn_run_sweep: "تشغيل مسح تشخيصي شامل",
    prof_title_operator: "ملف تعريف المشغل",
    prof_role_senior_operator: "مشغل مصفوفة أقدم",
    prof_status_online: "متصل الآن",
    prof_status_verified: "موثق",
    prof_bio_text: "مسؤول عن الإشراف على المعايرة عبر مجموعات العقد الأساسية (Core) والمائلة (Bevel). عضو منذ 2023.",
    prof_btn_edit: "تعديل الملف الشخصي",
    prof_loc_abudhabi: "أبوظبي، الإمارات العربية المتحدة",
    prof_section_contact: "معلومات الاتصال",
    prof_lbl_email: "البريد الإلكتروني",
    prof_lbl_phone: "الهاتف",
    prof_lbl_access: "مستوى الوصول للعقدة",
    prof_val_access_tier: "المستوى 3 — كامل",
    prof_stat_managed: "العقد المدارة",
    prof_stat_calibrations: "عمليات المعايرة",
    prof_stat_faults: "الأعطال المفتوحة",
    prof_section_proficiency: "مصفوفة الكفاءة",
    prof_skill_specular: "المعايرة المرآتية",
    prof_skill_frequency: "تشخيص الترددات",
    prof_skill_resolution: "حل الأعطال",
    prof_skill_protocols: "بروتوكولات تخطي النظام",
    prof_section_activity: "النشاط الأخير",
    prof_act_title1: "إعادة معايرة Bevel-Vector-Beta",
    prof_act_meta1: "تم تقليل التباين إلى 8% — منذ ساعتين",
    prof_act_title2: "تمييز علامة الخطأ في Specular-Chroma-Delta",
    prof_act_meta2: "تم تسجيل خطأ عدم تطابق — منذ 5 ساعات",
    prof_act_title3: "تحديث قناة تردد الكروما (Chroma)",
    prof_act_meta3: "العقدة الأساسية ألفا (Core-Module-Alpha) — بالأمس",
    prc_title_tiers: "فئات الاشتراك",
    prc_intro_title: "اختر سعة المصفوفة الخاصة بك",
    prc_intro_desc: "تتضمن جميع الفئات التشخيصات الأساسية ودفتر المعايرة. قم بالترقية للحصول على سعة عقد ممتدة وبروتوكولات تخطي النظام.",
    prc_period_monthly: "شهرياً",
    prc_period_annual: "سنوياً",
    prc_tier1_badge: "البداية",
    prc_tier1_title: "الوصول الأساسي",
    prc_lbl_per_month: "/ شهرياً",
    prc_tier1_desc: "للمشغلين الأفراد الذين يديرون سجلاً صغيراً من عقد المعايرة.",
    prc_feat_nodes_10: "ما يصل إلى 10 عقد نشطة",
    prc_feat_ledger: "دفتر المعايرة",
    prc_feat_diag_std: "التشخيصات القياسية",
    prc_feat_override: "بروتوكولات تخطي النظام",
    prc_feat_support_prio: "دعم ذو أولوية",
    prc_btn_get_started: "ابدأ الآن",
    prc_tier2_badge: "المحترف",
    prc_lbl_popular: "الأكثر رواجاً",
    prc_tier2_title: "المصفوفة الموسعة",
    prc_tier2_desc: "للفرق التي تقوم بعمليات مسح معايرة نشطة عبر مجموعات عقد متعددة.",
    prc_feat_nodes_100: "ما يصل إلى 100 عقدة نشطة",
    prc_feat_diag_adv: "التشخيصات المتقدمة",
    prc_tier3_badge: "المؤسسات",
    prc_tier3_title: "النشهر الكامل",
    prc_tier3_desc: "للمؤسسات التي تقوم بتشغيل عدد غير محدود من العقد مع دعم مخصص.",
    prc_feat_nodes_unlimited: "عقد نشطة غير محدودة",
    prc_btn_contact_sales: "الاتصال بالمبيعات",
    prc_footer_note_prefix: "هل تحتاج إلى تهيئة مخصصة؟",
    prc_footer_note_action: "اتصل بفريقنا",
    prc_footer_note_suffix: "للحصول على حصص عقد مخصصة وشروط اتفاقية مستوى الخدمة (SLA).",
    faq_title: "الأسئلة الشائعة",
    faq_intro_title: "كيف يمكننا مساعدتك؟",
    faq_intro_desc: "تصفح الأسئلة الشائعة حول معايرة المصفوفة، وإدارة العقد، وتشخيص النظام أدناه.",
    faq_search_placeholder: "البحث عن الأسئلة...",
    faq_cat_all: "الكل",
    faq_cat_calibration: "المعايرة",
    faq_cat_nodes: "العقد",
    faq_cat_account: "الحساب",
    faq_cat_billing: "الفواتير",
    faq_q_specular: "ما هو التباين المرآتي (Specular Variance)؟",
    faq_a_specular: "هو مقياس لانحراف انعكاس الأسطح عبر عقد المصفوفة. تشير القيم المنخفضة إلى معايرة أكثر اتساقاً للمواد. عادةً ما تتسبب القيم التي تتجاوز 30% في إطلاق علامة خطأ عدم التطابق في لوحة إحصائيات النظام.",
    faq_q_recalibrate: "كم مرة يجب أن أقوم بإعادة المعايرة؟",
    faq_a_recalibrate: "يُوصى بإعادة المعايرة كل 72 ساعة في ظروف التشغيل العادية، أو فوراً بعد حدوث خطأ عدم تطابق في أي عقدة مسجلة.",
    faq_q_automation: "هل يمكن أتمتة عملية المعايرة؟",
    faq_a_automation: "نعم — قم بتمكين المعايرة التلقائية (Auto-recalibrate) من وحدة تحكم عناصر النموذج (Form Elements) لجدولة مسوح المعايرة على فترات زمنية ثابتة دون تدخل يدوي.",
    faq_section_nodes: "العقد والسجل",
    faq_q_add_node: "كيف يمكنني إضافة عقدة جديدة إلى السجل؟",
    faq_a_add_node: "انتقل إلى عناصر النموذج (Form Elements)، وأدخل تسمية عقدة السجل (Registry Node Label) وقم بتعيين قناة تردد الكروما (Chroma Frequency Channel)، ثم حدد تنفيذ إرسال المصفوفة (Execute Matrix Commit) لتسجيل العقدة.",
    faq_q_mismatch: "ماذا يعني \"خطأ عدم التطابق\" (Mismatch Fault)؟",
    faq_a_mismatch: "يعني ذلك أن العقدة قد أبلغت عن تباين مرآتي يتجاوز الحد الآمن (30% عادةً). يرجى مراجعة سجل معايرة العقدة وتشغيل مسح تشخيصي لحل المشكلة.",
    faq_q_export: "هل يمكنني تصدير دفتر المعايرة؟",
    faq_a_export: "نعم — استخدم إجراء التصدير من لوحة إحصائيات النظام (System Stats) لتنزيل الدفتر الحالي كتقرير منظم.",
    faq_section_account: "الحساب ومستوى الوصول",
    faq_q_tier: "كيف يمكنني تغيير مستوى الوصول الخاص بي؟",
    faq_a_tier: "يجب تقديم طلب تغيير مستوى الوصول من مشغل بالمستوى 3. اتصل بمسؤول النظام لبدء مراجعة الصلاحيات.",
    faq_q_privacy: "هل يتم مشاركة بيانات ملفي الشخصي مع مشغلين آخرين؟",
    faq_a_privacy: "اسمك ودورك وحالتك على الإنترنت فقط هي التي تظهر للمشغلين الآخرين. تظل معلومات الاتصال ومستوى الوصول سرية ومقصورة على المسؤولين.",
    faq_footer_title: "هل ما زلت بحاجة إلى مساعدة؟",
    faq_footer_desc: "يمكن لفريق الدعم لدينا مساعدتك في تهيئة العقد، ومشاكل المعايرة، والوصول إلى الحساب.",
    faq_btn_support: "الاتصال بالدعم",
    proj_title: "تقدم المشاريع",
    proj_btn_new: "مشروع جديد",
    proj_stat_active: "المشاريع النشطة",
    proj_status_on_track: "في المسار الصحيح",
    proj_status_at_risk: "عرضة للمخاطر",
    proj_status_in_progress: "قيد التنفيذ",
    proj_stat_avg_completion: "متوسط نسبة الإنجاز",
    proj_lbl_progress: "نسبة التقدم",
    proj_btn_view: "عرض",
    proj_table_heading: "جميع المشاريع",
    proj_th_project: "المشروع",
    proj_th_status: "الحالة",
    proj_th_progress: "نسبة التقدم",
    proj_th_deadline: "الموعد النهائي",
    proj_th_actions: "الإجراءات",

    // Dynamic Context Strings
    proj_cat_core: "الأنظمة الأساسية",
    proj_cat_diagnostics: "التشخيص والتحليل",
    proj_cat_interface: "الواجهات",

    proj_name_migration: "ترحيل عقد المصفوفة",
    proj_desc_migration: "ترحيل مجموعات العقد القديمة إلى إطار عمل معايرة الانعكاس المرآتي الجديد.",
    proj_tasks_migration: "18/22 مهمة",
    proj_due_jul_28: "يستحق في 28 يوليو",
    proj_date_jul_28_2026: "28 يوليو 2026",

    proj_name_fault: "تحديث نظام رصد الأعطال",
    proj_desc_fault: "إعادة بناء مسار أخطاء عدم التطابق مع تفعيل تنبيهات التباين في الوقت الفعلي.",
    proj_tasks_fault: "7/20 مهمة",
    proj_due_jun_30: "يستحق في 30 يونيو",
    proj_date_jun_30_2026: "30 يونيو 2026",

    proj_name_mobile: "إطلاق لوحة التحكم للموبايل",
    proj_desc_mobile: "توسيع واجهة الخشب المحفور لتشمل الشريحة الجانبية للموبايل وعناصر التحكم باللمس.",
    proj_tasks_mobile: "12/21 مهمة",
    proj_due_aug_15: "يستحق في 15 أغسطس",
    proj_date_aug_15_2026: "15 أغسطس 2026",

    proj_name_ledger: "دفتر المعايرة الإصدار الثاني",
    proj_date_jun_20_2026: "20 يونيو 2026",

    proj_name_rtl: "تدقيق تخطيط RTL (من اليمين لليسار)",
    proj_date_jul_10_2026: "10 يوليو 2026",

    proj_name_override: "تدقيق بروتوكول التخطي",
    proj_date_jun_25_2026: "25 يونيو 2026",
    modal_commit_title: "تأكيد الحفظ في المصفوفة",
    modal_commit_body: "هذا الإجراء سيقوم بربط تهيئة قناة تردد الكروما (Chroma) الحالية بسجل العقدة النشطة بشكل دائم. هل تريد المتابعة؟",
    modal_btn_cancel: "إلغان",
    modal_btn_confirm: "تأكيد الحفظ",
    comp_btn_toast_succ: "تنبيه النجاح",
    comp_btn_toast_dang: "تنبيه الخطر",
    toast_sync_complete_title: "اكتمل المزامنة",
    toast_sync_complete_msg: "تمت إعادة معايرة جميع عقد المصفوفة بنجاح.",
    toast_fault_detected_title: "تم رصد عطل",
    toast_fault_detected_msg: "أبلغ نظام (Specular-Chroma-Delta) عن خطأ في عدم التطابق.",
  }
};