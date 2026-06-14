let currentChartInstance = null;

function navigateTo(targetPageId) {
  const viewport = document.getElementById("mainViewport");
  const template = document.getElementById(`view-${targetPageId}`);
  const footerStatus = document.getElementById("footerMatrixStatus");

  if (!template) return;

  viewport.innerHTML = "";
  viewport.appendChild(template.content.cloneNode(true));

  document.querySelectorAll(".sidebar .nav-link").forEach((link) => {
    link.classList.remove("active");
  });
  const activeLink = document.getElementById(`nav-${targetPageId}`);
  if (activeLink) activeLink.classList.add("active");

  const capitalizedTitle =
    targetPageId.charAt(0).toUpperCase() + targetPageId.slice(1);
  footerStatus.innerText = `Active Deck: ${capitalizedTitle}`;

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

function handleDirectionSwitch() {
  const htmlNode = document.documentElement;
  const dirText = document.getElementById("dirText");

  if (htmlNode.getAttribute("dir") === "ltr") {
    htmlNode.setAttribute("dir", "rtl");
    htmlNode.setAttribute("lang", "ar");
    dirText.innerText = "LTR";
  } else {
    htmlNode.setAttribute("dir", "ltr");
    htmlNode.setAttribute("lang", "en");
    dirText.innerText = "RTL";
  }
}

// Initialize App on default Dashboard layer
document.addEventListener("DOMContentLoaded", () => {
  navigateTo("dashboard");
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

function showToast(type, title, message) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `wood-toast ${type === "success" ? "btn-wood-success" : type === "danger" ? "btn-wood-danger" : "btn-wood-secondary"}`;

  toast.innerHTML = `
        <i class="bi ${toastIcons[type] || toastIcons.secondary} wood-toast-icon"></i>
        <div class="wood-toast-content">
            <div class="wood-toast-title">${title}</div>
            <div class="wood-toast-message">${message}</div>
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
        // Set max-height dynamically to actual content height for smooth animation
        collapse.style.setProperty('--collapse-height', `${body.scrollHeight + 40}px`);
    }
}

// Initialize any accordion items marked "open" on load with correct height
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.wood-accordion-item.open .wood-accordion-collapse').forEach(collapse => {
        const body = collapse.querySelector('.wood-accordion-body');
        collapse.style.setProperty('--collapse-height', `${body.scrollHeight + 40}px`);
    });
});

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