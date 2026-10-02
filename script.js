/**
 * ============================================================================
 * HAMYONPRO MOBILE EDITION - APPLICATION SCRIPT
 * White / Light Theme with Family Budget, Circular Statistics & Comma Number Formatting
 * ============================================================================
 */

// Category Meta Data (Icons, Colors, Names)
const EXPENSE_CATEGORIES = [
    { name: "Oziq-ovqat", icon: "fa-utensils", color: "#f59e0b", defaultBudget: 2500000 },
    { name: "Transport", icon: "fa-car", color: "#3b82f6", defaultBudget: 700000 },
    { name: "Kommunal", icon: "fa-lightbulb", color: "#14b8a6", defaultBudget: 800000 },
    { name: "Uy-ro'zg'or", icon: "fa-couch", color: "#8b5cf6", defaultBudget: 1200000 },
    { name: "Sog'liq", icon: "fa-notes-medical", color: "#ef4444", defaultBudget: 500000 },
    { name: "Ta'lim & Bolalar", icon: "fa-graduation-cap", color: "#06b6d4", defaultBudget: 800000 },
    { name: "Ko'ngilochar", icon: "fa-gamepad", color: "#ec4899", defaultBudget: 600000 },
    { name: "Boshqa xarajat", icon: "fa-layer-group", color: "#64748b", defaultBudget: 400000 }
];

const INCOME_CATEGORIES = [
    { name: "Pensiya", icon: "fa-person-cane", color: "#10b981" },
    { name: "Oylik maosh", icon: "fa-briefcase", color: "#059669" },
    { name: "Sovg'a & Yordam", icon: "fa-gift", color: "#f43f5e" },
    { name: "Qo'shimcha daromad", icon: "fa-laptop-code", color: "#06b6d4" },
    { name: "Frilans & Loyihalar", icon: "fa-code", color: "#6366f1" },
    { name: "Savdo & Biznes", icon: "fa-store", color: "#f59e0b" },
    { name: "Boshqa tushum", icon: "fa-coins", color: "#84cc16" }
];

// Uzbek Month Names (Zero-date-error month handling)
const UZBEK_MONTHS = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
];

// LocalStorage Keys
const STORAGE_KEYS = {
    TRANSACTIONS: 'hamyon_transactions',
    BUDGETS: 'hamyon_budgets',
    FAMILY_BASE_BUDGET: 'hamyon_family_base_budget',
    PROFILE_USER: 'hamyon_profile_user'
};

// Application State
let state = {
    transactions: [],
    budgets: {},
    familyBaseBudget: 8000000, // Default 8,000,000 so'm
    profile: {
        name: 'Foydalanuvchi',
        role: "Oila Rahbari & Boshqaruvchi",
        avatar: 'fa-user'
    },
    chartInstance: null,
    currentTab: 'tabHome',
    homeFilter: 'all',
    statsPeriod: 'currentMonth', // 'currentMonth', 'prevMonth', 'all'
    chartType: 'doughnut', // 'doughnut' (aylana ko'rinish) or 'bar'
    // Oyma-oy ko'rish holati (Robust Month Navigation)
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth(), // 0 to 11
    pickerYear: new Date().getFullYear()
};

// DOM Elements Registry
const elements = {
    // Header
    headerTitle: document.getElementById('headerTitle'),
    headerBackBtn: document.getElementById('headerBackBtn'),
    menuToggleBtn: document.getElementById('menuToggleBtn'),
    profileBtn: document.getElementById('profileBtn'),
    currentMonthYearText: document.getElementById('currentMonthYearText'),

    // Month Navigator (Oyma-oy ko'rish)
    activeMonthDisplay: document.getElementById('activeMonthDisplay'),
    monthSubStatus: document.getElementById('monthSubStatus'),
    prevMonthBtn: document.getElementById('prevMonthBtn'),
    nextMonthBtn: document.getElementById('nextMonthBtn'),
    monthPickerTrigger: document.getElementById('monthPickerTrigger'),
    notCurrentMonthBanner: document.getElementById('notCurrentMonthBanner'),
    returnTodayBtn: document.getElementById('returnTodayBtn'),

    // Month Picker Modal
    monthPickerModalOverlay: document.getElementById('monthPickerModalOverlay'),
    closeMonthPickerBtn: document.getElementById('closeMonthPickerBtn'),
    prevPickerYearBtn: document.getElementById('prevPickerYearBtn'),
    nextPickerYearBtn: document.getElementById('nextPickerYearBtn'),
    pickerYearDisplay: document.getElementById('pickerYearDisplay'),
    monthsGrid12: document.getElementById('monthsGrid12'),
    pickerReturnCurrentBtn: document.getElementById('pickerReturnCurrentBtn'),

    // Top Up Budget (Byudjetga Pul Kiritish)
    topUpBudgetBtn: document.getElementById('topUpBudgetBtn'),
    topUpBudgetModalOverlay: document.getElementById('topUpBudgetModalOverlay'),
    closeTopUpBudgetBtn: document.getElementById('closeTopUpBudgetBtn'),
    cancelTopUpBtn: document.getElementById('cancelTopUpBtn'),
    topUpBudgetForm: document.getElementById('topUpBudgetForm'),
    topUpAmount: document.getElementById('topUpAmount'),
    topUpDate: document.getElementById('topUpDate'),
    topUpDescription: document.getElementById('topUpDescription'),
    topUpSelectedSource: document.getElementById('topUpSelectedSource'),

    // Monthly Summary Card (Oylik Hisobot & Natija)
    copyMonthlySummaryBtn: document.getElementById('copyMonthlySummaryBtn'),
    monthlySummaryText: document.getElementById('monthlySummaryText'),
    summaryStatusBadge: document.getElementById('summaryStatusBadge'),
    summaryTotalIncome: document.getElementById('summaryTotalIncome'),
    summaryTotalExpense: document.getElementById('summaryTotalExpense'),
    summaryRemaining: document.getElementById('summaryRemaining'),

    // Home Screen Balances & Vital Financial Dashboard
    totalBalance: document.getElementById('totalBalance'),
    balanceStatus: document.getElementById('balanceStatus'),
    heroTotalIncome: document.getElementById('heroTotalIncome'),
    heroTotalExpense: document.getElementById('heroTotalExpense'),
    heroRemainingSavings: document.getElementById('heroRemainingSavings'),
    heroBudgetPercent: document.getElementById('heroBudgetPercent'),
    heroBudgetRemaining: document.getElementById('heroBudgetRemaining'),
    heroProgressBar: document.getElementById('heroProgressBar'),
    homeBaseBudget: document.getElementById('homeBaseBudget'),
    homeExtraIncome: document.getElementById('homeExtraIncome'),
    homeIncomeCount: document.getElementById('homeIncomeCount'),
    homeTotalExpense: document.getElementById('homeTotalExpense'),
    homeExpenseCount: document.getElementById('homeExpenseCount'),
    familyBudgetUsedPct: document.getElementById('familyBudgetUsedPct'),
    familyBudgetRemainingTxt: document.getElementById('familyBudgetRemainingTxt'),
    familyBudgetProgressBar: document.getElementById('familyBudgetProgressBar'),
    homeTransactionsList: document.getElementById('homeTransactionsList'),
    editFamilyBudgetBtn: document.getElementById('editFamilyBudgetBtn'),

    // Add Screen
    addPageBalanceDisplay: document.getElementById('addPageBalanceDisplay'),
    availableBalanceDisplay: document.getElementById('availableBalanceDisplay'),
    transactionForm: document.getElementById('transactionForm'),
    txAmount: document.getElementById('txAmount'),
    txCategory: document.getElementById('txCategory'),
    txDate: document.getElementById('txDate'),
    txDescription: document.getElementById('txDescription'),
    labelExpense: document.getElementById('labelExpense'),
    labelIncome: document.getElementById('labelIncome'),
    txTypeRadios: document.getElementsByName('txType'),

    // Statistics Screen
    expenseChartCanvas: document.getElementById('expenseChart'),
    emptyChart: document.getElementById('emptyChart'),
    chartCenterContent: document.getElementById('chartCenterContent'),
    statsCenterExpenseValue: document.getElementById('statsCenterExpenseValue'),
    chartExpenseTotal: document.getElementById('chartExpenseTotal'),
    chartTypeBarBtn: document.getElementById('chartTypeBarBtn'),
    chartTypeDoughnutBtn: document.getElementById('chartTypeDoughnutBtn'),
    statTopCategory: document.getElementById('statTopCategory'),
    statTopCategoryAmount: document.getElementById('statTopCategoryAmount'),
    statSavingsRate: document.getElementById('statSavingsRate'),
    statSavingsAmount: document.getElementById('statSavingsAmount'),
    statDailyAverage: document.getElementById('statDailyAverage'),
    statIncomeExpenseRatio: document.getElementById('statIncomeExpenseRatio'),
    categoryBreakdownList: document.getElementById('categoryBreakdownList'),
    statsCategoryCount: document.getElementById('statsCategoryCount'),

    // Budget Screen
    budgetOverallBaseDisplay: document.getElementById('budgetOverallBaseDisplay'),
    budgetOverallDetails: document.getElementById('budgetOverallDetails'),
    budgetOverallBadge: document.getElementById('budgetOverallBadge'),
    budgetList: document.getElementById('budgetList'),
    openBudgetModalBtn: document.getElementById('openBudgetModalBtn'),
    budgetModalOverlay: document.getElementById('budgetModalOverlay'),
    closeBudgetModalBtn: document.getElementById('closeBudgetModalBtn'),
    cancelBudgetBtn: document.getElementById('cancelBudgetBtn'),
    budgetSettingsForm: document.getElementById('budgetSettingsForm'),
    budgetInputsContainer: document.getElementById('budgetInputsContainer'),

    // Family Budget Modal
    familyBudgetModalOverlay: document.getElementById('familyBudgetModalOverlay'),
    familyBaseBudgetInput: document.getElementById('familyBaseBudgetInput'),
    closeFamilyBudgetModalBtn: document.getElementById('closeFamilyBudgetModalBtn'),
    cancelFamilyBudgetBtn: document.getElementById('cancelFamilyBudgetBtn'),
    familyBudgetForm: document.getElementById('familyBudgetForm'),

    // History Screen
    searchFilter: document.getElementById('searchFilter'),
    typeFilter: document.getElementById('typeFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    transactionsList: document.getElementById('transactionsList'),
    txFilteredCount: document.getElementById('txFilteredCount'),
    emptyState: document.getElementById('emptyState'),

    // Edit Modal
    editModalOverlay: document.getElementById('editModalOverlay'),
    closeEditModalBtn: document.getElementById('closeEditModalBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    editTransactionForm: document.getElementById('editTransactionForm'),
    editTxId: document.getElementById('editTxId'),
    editTxAmount: document.getElementById('editTxAmount'),
    editTxCategory: document.getElementById('editTxCategory'),
    editTxDate: document.getElementById('editTxDate'),
    editTxDescription: document.getElementById('editTxDescription'),
    editLabelExpense: document.getElementById('editLabelExpense'),
    editLabelIncome: document.getElementById('editLabelIncome'),
    editTxTypeRadios: document.getElementsByName('editTxType'),

    // Drawers & Modals
    sideMenuOverlay: document.getElementById('sideMenuOverlay'),
    closeSideMenuBtn: document.getElementById('closeSideMenuBtn'),
    profileModalOverlay: document.getElementById('profileModalOverlay'),
    closeProfileModalBtn: document.getElementById('closeProfileModalBtn'),
    closeProfileBtn2: document.getElementById('closeProfileBtn2'),
    profileName: document.getElementById('profileName'),
    profileRole: document.getElementById('profileRole'),
    profileAvatarIcon: document.getElementById('profileAvatarIcon'),
    profileTxCount: document.getElementById('profileTxCount'),
    profileBalance: document.getElementById('profileBalance'),
    profileViewMode: document.getElementById('profileViewMode'),
    profileEditForm: document.getElementById('profileEditForm'),
    startEditProfileBtn: document.getElementById('startEditProfileBtn'),
    cancelEditProfileBtn: document.getElementById('cancelEditProfileBtn'),
    saveProfileBtn: document.getElementById('saveProfileBtn'),
    editProfileNameInput: document.getElementById('editProfileNameInput'),
    editProfileRoleInput: document.getElementById('editProfileRoleInput'),
    avatarChoices: document.getElementById('avatarChoices'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer'),

    // Custom Delete Confirmation Modal
    confirmDeleteModalOverlay: document.getElementById('confirmDeleteModalOverlay'),
    confirmDeleteTitle: document.getElementById('confirmDeleteTitle'),
    confirmDeleteDesc: document.getElementById('confirmDeleteDesc'),
    confirmDeletePreview: document.getElementById('confirmDeletePreview'),
    confirmPreviewIcon: document.getElementById('confirmPreviewIcon'),
    confirmPreviewTitle: document.getElementById('confirmPreviewTitle'),
    confirmPreviewMeta: document.getElementById('confirmPreviewMeta'),
    confirmPreviewAmount: document.getElementById('confirmPreviewAmount'),
    cancelConfirmDeleteBtn: document.getElementById('cancelConfirmDeleteBtn'),
    executeConfirmDeleteBtn: document.getElementById('executeConfirmDeleteBtn'),
    closeConfirmDeleteModalBtn: document.getElementById('closeConfirmDeleteModalBtn')
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initDateDefaults();
    loadFromStorage();
    renderProfileView();

    if (state.transactions.length === 0) {
        seedInitialDemoData();
    }

    setupEventListeners();
    setupNumberInputFormatting();
    populateCategoryDropdown(elements.txCategory, 'expense');
    populateFilterCategories();
    renderAll();
});

/**
 * Sets current month display and default date input to today
 */
function initDateDefaults() {
    const today = new Date();
    state.selectedYear = today.getFullYear();
    state.selectedMonth = today.getMonth();
    state.pickerYear = today.getFullYear();

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    if (elements.txDate) {
        elements.txDate.value = `${yyyy}-${mm}-${dd}`;
    }
    if (elements.topUpDate) {
        elements.topUpDate.value = `${yyyy}-${mm}-${dd}`;
    }

    updateMonthNavigationDisplay();
}

/**
 * Loads data from localStorage or sets default values
 */
function loadFromStorage() {
    try {
        const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        state.transactions = storedTx ? JSON.parse(storedTx) : [];

        const storedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
        if (storedBudgets) {
            state.budgets = JSON.parse(storedBudgets);
        } else {
            state.budgets = {};
            EXPENSE_CATEGORIES.forEach(cat => {
                state.budgets[cat.name] = cat.defaultBudget;
            });
            saveBudgetsToStorage();
        }

        const storedFamilyBase = localStorage.getItem(STORAGE_KEYS.FAMILY_BASE_BUDGET);
        if (storedFamilyBase) {
            state.familyBaseBudget = parseFloat(storedFamilyBase) || 8000000;
        } else {
            state.familyBaseBudget = 8000000;
            localStorage.setItem(STORAGE_KEYS.FAMILY_BASE_BUDGET, state.familyBaseBudget);
        }

        const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE_USER);
        if (storedProfile) {
            try {
                const parsed = JSON.parse(storedProfile);
                state.profile = {
                    name: parsed.name !== undefined ? parsed.name : 'Foydalanuvchi',
                    role: parsed.role !== undefined ? parsed.role : "Oila Rahbari & Boshqaruvchi",
                    avatar: parsed.avatar || 'fa-user'
                };
            } catch (err) {
                console.error("Profile parse error:", err);
            }
        }
    } catch (e) {
        console.error("Storage loading error:", e);
        state.transactions = [];
        state.budgets = {};
        state.familyBaseBudget = 8000000;
        state.profile = {
            name: 'Foydalanuvchi',
            role: "Oila Rahbari & Boshqaruvchi",
            avatar: 'fa-user'
        };
    }
}

function saveTransactionsToStorage() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
}

function saveBudgetsToStorage() {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(state.budgets));
}

function saveFamilyBudgetToStorage() {
    localStorage.setItem(STORAGE_KEYS.FAMILY_BASE_BUDGET, state.familyBaseBudget);
}

function saveProfileToStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.PROFILE_USER, JSON.stringify(state.profile));
    } catch (e) {
        console.error("Profile save error:", e);
    }
}

function renderProfileView() {
    if (elements.profileName) {
        elements.profileName.textContent = state.profile.name || 'Foydalanuvchi';
    }
    if (elements.profileRole) {
        elements.profileRole.textContent = state.profile.role || "Oila Rahbari & Boshqaruvchi";
    }
    if (elements.profileAvatarIcon) {
        const iconName = state.profile.avatar || 'fa-user';
        const prefix = iconName === 'fa-face-smile' ? 'fa-regular' : 'fa-solid';
        elements.profileAvatarIcon.className = `${prefix} ${iconName}`;
    }
}

// ============================================================================
// NUMBER FORMATTING WITH COMMAS (e.g. 3,000,000)
// ============================================================================
/**
 * Formats a number with comma separators (e.g., 3,000,000 so'm)
 */
function formatCurrency(num) {
    if (isNaN(num)) return '0 so\'m';
    const rounded = Math.round(num);
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " so'm";
}

/**
 * Formats raw digits with commas for inputs (e.g. 3000000 -> 3,000,000)
 */
function formatNumberString(strOrNum) {
    if (strOrNum === null || strOrNum === undefined) return '';
    const clean = strOrNum.toString().replace(/[^\d]/g, '');
    if (!clean) return '';
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Parses a comma-separated string into a pure number
 */
function parseFormattedNumber(val) {
    if (!val) return 0;
    const clean = val.toString().replace(/,/g, '').trim();
    return parseFloat(clean) || 0;
}

/**
 * Live formatting on typing into number inputs
 */
function setupNumberInputFormatting() {
    const inputs = [
        elements.txAmount,
        elements.editTxAmount,
        elements.familyBaseBudgetInput,
        elements.topUpAmount
    ];

    inputs.forEach(input => {
        if (!input) return;
        input.addEventListener('input', (e) => {
            const raw = e.target.value;
            const formatted = formatNumberString(raw);
            e.target.value = formatted;
        });
    });
}

// ============================================================================
// MOBILE TAB NAVIGATION SYSTEM
// ============================================================================
function switchTab(tabId) {
    state.currentTab = tabId;

    document.querySelectorAll('.tab-page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(tabId);
    if (targetPage) {
        targetPage.classList.add('active');
        const container = document.getElementById('tabPagesContainer');
        if (container) container.scrollTop = 0;
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (tabId === 'tabHome') {
        elements.headerBackBtn.style.display = 'none';
        elements.menuToggleBtn.style.display = 'flex';
        elements.headerTitle.innerHTML = 'Hamyon<span>Pro</span>';
    } else {
        elements.headerBackBtn.style.display = 'flex';
        elements.menuToggleBtn.style.display = 'none';

        if (tabId === 'tabAdd') {
            elements.headerTitle.innerHTML = 'Operatsiya <span>Kiritish</span>';
        } else if (tabId === 'tabStats') {
            elements.headerTitle.innerHTML = 'Statistika <span>& Tahlil</span>';
            setTimeout(() => {
                renderStatisticsSection();
            }, 60);
        } else if (tabId === 'tabBudget') {
            elements.headerTitle.innerHTML = 'Oila <span>Byudjeti</span>';
        } else if (tabId === 'tabHistory') {
            elements.headerTitle.innerHTML = 'Operatsiyalar <span>Tarixi</span>';
        }
    }
}

// Chart type toggle (circular doughnut vs bar chart)
function setChartType(type) {
    state.chartType = type;
    if (elements.chartTypeBarBtn && elements.chartTypeDoughnutBtn) {
        if (type === 'doughnut') {
            elements.chartTypeDoughnutBtn.classList.add('active');
            elements.chartTypeBarBtn.classList.remove('active');
            if (elements.chartCenterContent) elements.chartCenterContent.style.display = 'flex';
        } else {
            elements.chartTypeDoughnutBtn.classList.remove('active');
            elements.chartTypeBarBtn.classList.add('active');
            if (elements.chartCenterContent) elements.chartCenterContent.style.display = 'none';
        }
    }
    renderStatisticsSection();
}

// ============================================================================
// EVENT LISTENERS SETUP
// ============================================================================
function setupEventListeners() {
    // Back button returns to Home
    elements.headerBackBtn.addEventListener('click', () => {
        switchTab('tabHome');
    });

    // Side Menu Drawer
    elements.menuToggleBtn.addEventListener('click', () => {
        elements.sideMenuOverlay.classList.add('active');
    });
    elements.closeSideMenuBtn.addEventListener('click', closeSideMenu);
    elements.sideMenuOverlay.addEventListener('click', (e) => {
        if (e.target === elements.sideMenuOverlay) closeSideMenu();
    });

    // Profile Modal & Editing
    elements.profileBtn.addEventListener('click', openProfileModal);
    elements.closeProfileModalBtn.addEventListener('click', closeProfileModal);
    elements.closeProfileBtn2.addEventListener('click', closeProfileModal);
    elements.profileModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.profileModalOverlay) closeProfileModal();
    });

    if (elements.startEditProfileBtn) {
        elements.startEditProfileBtn.addEventListener('click', switchToProfileEditMode);
    }
    if (elements.cancelEditProfileBtn) {
        elements.cancelEditProfileBtn.addEventListener('click', switchToProfileViewMode);
    }
    if (elements.profileEditForm) {
        elements.profileEditForm.addEventListener('submit', handleSaveProfile);
    }

    if (elements.avatarChoices) {
        const avatarBtns = elements.avatarChoices.querySelectorAll('.avatar-opt-btn');
        avatarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                avatarBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // Family Budget Modal Triggers
    if (elements.editFamilyBudgetBtn) {
        elements.editFamilyBudgetBtn.addEventListener('click', openFamilyBudgetModal);
    }
    elements.closeFamilyBudgetModalBtn.addEventListener('click', closeFamilyBudgetModal);
    elements.cancelFamilyBudgetBtn.addEventListener('click', closeFamilyBudgetModal);
    elements.familyBudgetModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.familyBudgetModalOverlay) closeFamilyBudgetModal();
    });
    elements.familyBudgetForm.addEventListener('submit', handleSaveFamilyBudget);

    // Family Budget Preset Chips
    document.querySelectorAll('.budget-preset-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const val = chip.getAttribute('data-val');
            elements.familyBaseBudgetInput.value = formatNumberString(val);
        });
    });

    // Statistics Period Selector (Shu oy | O'tgan oy | Barchasi)
    document.querySelectorAll('.stats-period-segment .period-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.stats-period-segment .period-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.statsPeriod = btn.getAttribute('data-period') || 'currentMonth';
            renderStatisticsSection();
        });
    });

    // Home segmented filter pills (Barchasi | Chiqim | Kirim)
    document.querySelectorAll('.home-type-segment .segment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.home-type-segment .segment-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.homeFilter = btn.getAttribute('data-home-filter') || 'all';
            renderHomeRecentTransactions();
        });
    });

    // Radio toggle for Main Form
    Array.from(elements.txTypeRadios).forEach(radio => {
        radio.addEventListener('change', (e) => {
            const type = e.target.value;
            if (type === 'expense') {
                elements.labelExpense.classList.add('active-expense');
                elements.labelIncome.classList.remove('active-income');
            } else {
                elements.labelExpense.classList.remove('active-expense');
                elements.labelIncome.classList.add('active-income');
            }
            populateCategoryDropdown(elements.txCategory, type);
        });
    });

    // Radio toggle for Edit Form
    Array.from(elements.editTxTypeRadios).forEach(radio => {
        radio.addEventListener('change', (e) => {
            const type = e.target.value;
            if (type === 'expense') {
                elements.editLabelExpense.classList.add('active-expense');
                elements.editLabelIncome.classList.remove('active-income');
            } else {
                elements.editLabelExpense.classList.remove('active-expense');
                elements.editLabelIncome.classList.add('active-income');
            }
            populateCategoryDropdown(elements.editTxCategory, type);
        });
    });

    // Add Transaction Submission
    elements.transactionForm.addEventListener('submit', handleAddTransaction);

    // Edit Transaction Submission
    elements.editTransactionForm.addEventListener('submit', handleSaveEditedTransaction);

    // Filter controls in History Tab
    elements.searchFilter.addEventListener('input', renderTransactionsList);
    elements.typeFilter.addEventListener('change', renderTransactionsList);
    elements.categoryFilter.addEventListener('change', renderTransactionsList);

    // Budget Modal open/close
    elements.openBudgetModalBtn.addEventListener('click', openBudgetModal);
    elements.closeBudgetModalBtn.addEventListener('click', closeBudgetModal);
    elements.cancelBudgetBtn.addEventListener('click', closeBudgetModal);
    elements.budgetSettingsForm.addEventListener('submit', handleSaveBudgets);

    // Edit Modal close
    elements.closeEditModalBtn.addEventListener('click', closeEditModal);
    elements.cancelEditBtn.addEventListener('click', closeEditModal);

    elements.editModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.editModalOverlay) closeEditModal();
    });
    elements.budgetModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.budgetModalOverlay) closeBudgetModal();
    });



    // Custom Confirmation Modal Buttons
    if (elements.cancelConfirmDeleteBtn) {
        elements.cancelConfirmDeleteBtn.addEventListener('click', closeConfirmDeleteModal);
    }
    if (elements.closeConfirmDeleteModalBtn) {
        elements.closeConfirmDeleteModalBtn.addEventListener('click', closeConfirmDeleteModal);
    }
    if (elements.executeConfirmDeleteBtn) {
        elements.executeConfirmDeleteBtn.addEventListener('click', () => {
            if (typeof pendingConfirmAction === 'function') {
                const action = pendingConfirmAction;
                pendingConfirmAction = null;
                action();
            }
            closeConfirmDeleteModal();
        });
    }
    if (elements.confirmDeleteModalOverlay) {
        elements.confirmDeleteModalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.confirmDeleteModalOverlay) {
                closeConfirmDeleteModal();
            }
        });
    }

    // Delegated click listener for transaction action buttons
    if (elements.transactionsList) {
        elements.transactionsList.addEventListener('click', (e) => {
            const delBtn = e.target.closest('.btn-delete');
            if (delBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = delBtn.getAttribute('data-id') || delBtn.dataset.id;
                if (id) deleteTransaction(id);
                return;
            }
            const editBtn = e.target.closest('.btn-edit');
            if (editBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = editBtn.getAttribute('data-id') || editBtn.dataset.id;
                if (id) openEditModal(id);
                return;
            }
        });
    }

    // Quick amount chips for main form (formatted with commas)
    document.querySelectorAll('#quickAmountsContainer .quick-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const addVal = parseFloat(chip.getAttribute('data-val')) || 0;
            const current = parseFormattedNumber(elements.txAmount.value);
            const total = current + addVal;
            elements.txAmount.value = formatNumberString(total);
            elements.txAmount.focus();
        });
    });

    // Quick amount chips for edit form
    document.querySelectorAll('#editQuickAmountsContainer .edit-quick-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const addVal = parseFloat(chip.getAttribute('data-val')) || 0;
            const current = parseFormattedNumber(elements.editTxAmount.value);
            const total = current + addVal;
            elements.editTxAmount.value = formatNumberString(total);
            elements.editTxAmount.focus();
        });
    });

    // Month Navigator (Oyma-oy ko'rish) Controls
    if (elements.prevMonthBtn) {
        elements.prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
    }
    if (elements.nextMonthBtn) {
        elements.nextMonthBtn.addEventListener('click', () => navigateMonth(1));
    }
    if (elements.monthPickerTrigger) {
        elements.monthPickerTrigger.addEventListener('click', openMonthPickerModal);
    }
    if (elements.returnTodayBtn) {
        elements.returnTodayBtn.addEventListener('click', resetToCurrentMonth);
    }

    // Month Picker Modal Controls
    if (elements.closeMonthPickerBtn) {
        elements.closeMonthPickerBtn.addEventListener('click', closeMonthPickerModal);
    }
    if (elements.prevPickerYearBtn) {
        elements.prevPickerYearBtn.addEventListener('click', () => changePickerYear(-1));
    }
    if (elements.nextPickerYearBtn) {
        elements.nextPickerYearBtn.addEventListener('click', () => changePickerYear(1));
    }
    if (elements.pickerReturnCurrentBtn) {
        elements.pickerReturnCurrentBtn.addEventListener('click', () => {
            resetToCurrentMonth();
            closeMonthPickerModal();
        });
    }
    if (elements.monthPickerModalOverlay) {
        elements.monthPickerModalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.monthPickerModalOverlay) closeMonthPickerModal();
        });
    }

    // Top Up Budget (Byudjetga Pul Kiritish) Modal Controls
    if (elements.topUpBudgetBtn) {
        elements.topUpBudgetBtn.addEventListener('click', openTopUpBudgetModal);
    }
    if (elements.closeTopUpBudgetBtn) {
        elements.closeTopUpBudgetBtn.addEventListener('click', closeTopUpBudgetModal);
    }
    if (elements.cancelTopUpBtn) {
        elements.cancelTopUpBtn.addEventListener('click', closeTopUpBudgetModal);
    }
    if (elements.topUpBudgetModalOverlay) {
        elements.topUpBudgetModalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.topUpBudgetModalOverlay) closeTopUpBudgetModal();
        });
    }
    if (elements.topUpBudgetForm) {
        elements.topUpBudgetForm.addEventListener('submit', handleTopUpBudgetSubmit);
    }

    // Top up quick amount chips
    document.querySelectorAll('#topUpQuickChips .quick-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const addVal = parseFloat(chip.getAttribute('data-val')) || 0;
            const current = parseFormattedNumber(elements.topUpAmount.value);
            const total = current + addVal;
            elements.topUpAmount.value = formatNumberString(total);
            elements.topUpAmount.focus();
        });
    });

    // Top up source selection chips
    document.querySelectorAll('#topUpSourceGrid .source-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('#topUpSourceGrid .source-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const source = chip.getAttribute('data-source') || 'Pensiya';
            if (elements.topUpSelectedSource) {
                elements.topUpSelectedSource.value = source;
            }
        });
    });

    // Parent Quick Expense Templates on Tab Add
    document.querySelectorAll('#parentTemplatesGroup .template-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const cat = chip.getAttribute('data-cat');
            const desc = chip.getAttribute('data-desc');

            // Select Chiqim (Expense) type
            Array.from(elements.txTypeRadios).forEach(r => {
                r.checked = (r.value === 'expense');
            });
            if (elements.labelExpense) elements.labelExpense.classList.add('active-expense');
            if (elements.labelIncome) elements.labelIncome.classList.remove('active-income');

            populateCategoryDropdown(elements.txCategory, 'expense');
            if (elements.txCategory) elements.txCategory.value = cat;
            if (elements.txDescription) elements.txDescription.value = desc;
            if (elements.txAmount) {
                elements.txAmount.focus();
            }
            showToast(`"${desc}" xarajat shabloni tanlandi! Summani kiriting.`, "info", 2000);
        });
    });

    // Copy Monthly Summary Button
    if (elements.copyMonthlySummaryBtn) {
        elements.copyMonthlySummaryBtn.addEventListener('click', copyMonthlySummaryToClipboard);
    }
}

function closeSideMenu() {
    elements.sideMenuOverlay.classList.remove('active');
}

function openProfileModal() {
    const { totalIncome, totalExpense } = calculateFamilyTotals();
    renderProfileView();
    elements.profileTxCount.textContent = `${state.transactions.length} ta`;
    elements.profileBalance.textContent = formatCurrency(totalIncome - totalExpense);
    switchToProfileViewMode();
    elements.profileModalOverlay.classList.add('active');
}

function closeProfileModal() {
    elements.profileModalOverlay.classList.remove('active');
    switchToProfileViewMode();
}

function switchToProfileViewMode() {
    if (elements.profileViewMode) elements.profileViewMode.style.display = 'flex';
    if (elements.profileEditForm) elements.profileEditForm.style.display = 'none';
}

function switchToProfileEditMode() {
    if (!elements.profileEditForm) return;
    elements.editProfileNameInput.value = state.profile.name || 'Foydalanuvchi';
    elements.editProfileRoleInput.value = state.profile.role || "Oila Rahbari & Boshqaruvchi";
    
    if (elements.avatarChoices) {
        const btns = elements.avatarChoices.querySelectorAll('.avatar-opt-btn');
        btns.forEach(btn => {
            if (btn.getAttribute('data-icon') === (state.profile.avatar || 'fa-user')) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    if (elements.profileViewMode) elements.profileViewMode.style.display = 'none';
    elements.profileEditForm.style.display = 'block';
    elements.editProfileNameInput.focus();
}

function handleSaveProfile(e) {
    e.preventDefault();
    const newName = elements.editProfileNameInput.value.trim() || 'Foydalanuvchi';
    const newRole = elements.editProfileRoleInput.value.trim() || "Oila Rahbari & Boshqaruvchi";
    
    let selectedAvatar = 'fa-user';
    const activeBtn = elements.avatarChoices ? elements.avatarChoices.querySelector('.avatar-opt-btn.active') : null;
    if (activeBtn && activeBtn.getAttribute('data-icon')) {
        selectedAvatar = activeBtn.getAttribute('data-icon');
    }

    state.profile = {
        name: newName,
        role: newRole,
        avatar: selectedAvatar
    };

    saveProfileToStorage();
    renderProfileView();
    switchToProfileViewMode();
    showToast("Profil ma'lumotlari muvaffaqiyatli saqlandi!", "success");
}

// ============================================================================
// FAMILY BASE BUDGET MODAL (OILA BYUDJETI SOZLASH)
// ============================================================================
function openFamilyBudgetModal() {
    elements.familyBaseBudgetInput.value = formatNumberString(state.familyBaseBudget);
    elements.familyBudgetModalOverlay.classList.add('active');
}

function closeFamilyBudgetModal() {
    elements.familyBudgetModalOverlay.classList.remove('active');
}

function handleSaveFamilyBudget(e) {
    e.preventDefault();
    const val = parseFormattedNumber(elements.familyBaseBudgetInput.value);
    if (val <= 0) {
        showToast("Iltimos, noldan katta byudjet kiriting!", "warning");
        return;
    }

    state.familyBaseBudget = val;
    saveFamilyBudgetToStorage();
    closeFamilyBudgetModal();
    renderAll();
    showToast(`Oylik oila byudjeti ${formatCurrency(val)} qilib belgilandi!`, "success");
}

// ============================================================================
// CATEGORY HELPERS & DROPDOWNS
// ============================================================================
function populateCategoryDropdown(selectElement, type) {
    selectElement.innerHTML = '';
    const categories = (type === 'income') ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        selectElement.appendChild(option);
    });
}

function populateFilterCategories() {
    elements.categoryFilter.innerHTML = '<option value="all">Barcha kategoriyalar</option>';
    const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

    const unique = [];
    allCategories.forEach(c => {
        if (!unique.includes(c.name)) unique.push(c.name);
    });

    unique.forEach(catName => {
        const option = document.createElement('option');
        option.value = catName;
        option.textContent = catName;
        elements.categoryFilter.appendChild(option);
    });
}

function getCategoryMeta(categoryName, type) {
    const list = (type === 'income') ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const found = list.find(c => c.name === categoryName);
    if (found) return found;

    const cross = (type === 'income')
        ? EXPENSE_CATEGORIES.find(c => c.name === categoryName)
        : INCOME_CATEGORIES.find(c => c.name === categoryName);
    if (cross) return cross;

    return { name: categoryName, icon: "fa-tags", color: "#8b5cf6" };
}

// ============================================================================
// TRANSACTION OPERATIONS (ADD, EDIT, DELETE)
// ============================================================================
function handleAddTransaction(e) {
    e.preventDefault();

    const amount = parseFormattedNumber(elements.txAmount.value);
    const category = elements.txCategory.value;
    const date = elements.txDate.value;
    const description = elements.txDescription.value.trim();

    let selectedType = 'expense';
    for (let r of elements.txTypeRadios) {
        if (r.checked) {
            selectedType = r.value;
            break;
        }
    }

    if (isNaN(amount) || amount <= 0) {
        showToast("Iltimos, to'g'ri summa kiriting!", "warning");
        return;
    }

    const newTx = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: selectedType,
        amount: amount,
        category: category,
        date: date,
        description: description,
        createdAt: new Date().toISOString()
    };

    state.transactions.unshift(newTx);
    saveTransactionsToStorage();

    elements.txAmount.value = '';
    elements.txDescription.value = '';

    renderAll();
    showToast("Operatsiya muvaffaqiyatli saqlandi!", "success");

    if (selectedType === 'expense') {
        checkBudgetAlert(category);
    }

    setTimeout(() => {
        switchTab('tabHome');
    }, 400);
}

function openEditModal(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    elements.editTxId.value = tx.id;
    elements.editTxAmount.value = formatNumberString(tx.amount);
    elements.editTxDate.value = tx.date;
    elements.editTxDescription.value = tx.description;

    Array.from(elements.editTxTypeRadios).forEach(r => {
        r.checked = (r.value === tx.type);
    });

    if (tx.type === 'expense') {
        elements.editLabelExpense.classList.add('active-expense');
        elements.editLabelIncome.classList.remove('active-income');
    } else {
        elements.editLabelExpense.classList.remove('active-expense');
        elements.editLabelIncome.classList.add('active-income');
    }

    populateCategoryDropdown(elements.editTxCategory, tx.type);
    elements.editTxCategory.value = tx.category;

    elements.editModalOverlay.classList.add('active');
}

function closeEditModal() {
    elements.editModalOverlay.classList.remove('active');
}

function handleSaveEditedTransaction(e) {
    e.preventDefault();

    const id = elements.editTxId.value;
    const amount = parseFormattedNumber(elements.editTxAmount.value);
    const category = elements.editTxCategory.value;
    const date = elements.editTxDate.value;
    const description = elements.editTxDescription.value.trim();

    let selectedType = 'expense';
    for (let r of elements.editTxTypeRadios) {
        if (r.checked) {
            selectedType = r.value;
            break;
        }
    }

    const index = state.transactions.findIndex(t => t.id === id);
    if (index === -1) return;

    state.transactions[index] = {
        ...state.transactions[index],
        type: selectedType,
        amount: amount,
        category: category,
        date: date,
        description: description,
        updatedAt: new Date().toISOString()
    };

    saveTransactionsToStorage();
    closeEditModal();
    renderAll();
    showToast("O'zgarishlar saqlandi!", "success");

    if (selectedType === 'expense') {
        checkBudgetAlert(category);
    }
}

let pendingConfirmAction = null;

function openConfirmDeleteModal({ title, desc, previewData, onConfirm, confirmButtonText }) {
    if (elements.confirmDeleteTitle) elements.confirmDeleteTitle.textContent = title;
    if (elements.confirmDeleteDesc) elements.confirmDeleteDesc.textContent = desc;

    if (elements.executeConfirmDeleteBtn) {
        const textSpan = elements.executeConfirmDeleteBtn.querySelector('span');
        if (textSpan) {
            textSpan.textContent = confirmButtonText || "Ha, O'chirish";
        }
    }

    if (previewData && elements.confirmDeletePreview) {
        elements.confirmDeletePreview.style.display = 'flex';
        elements.confirmPreviewIcon.style.background = `${previewData.color}1a`;
        elements.confirmPreviewIcon.style.color = previewData.color;
        elements.confirmPreviewIcon.innerHTML = `<i class="fa-solid ${previewData.icon}"></i>`;
        elements.confirmPreviewTitle.textContent = previewData.title;
        elements.confirmPreviewMeta.textContent = previewData.meta;
        elements.confirmPreviewAmount.textContent = previewData.amountText;
        elements.confirmPreviewAmount.className = `confirm-preview-amount ${previewData.amountClass}`;
    } else if (elements.confirmDeletePreview) {
        elements.confirmDeletePreview.style.display = 'none';
    }

    pendingConfirmAction = onConfirm;
    if (elements.confirmDeleteModalOverlay) {
        elements.confirmDeleteModalOverlay.classList.add('active');
    }
}

function closeConfirmDeleteModal() {
    if (elements.confirmDeleteModalOverlay) {
        elements.confirmDeleteModalOverlay.classList.remove('active');
    }
    pendingConfirmAction = null;
}



function deleteTransaction(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    const meta = getCategoryMeta(tx.category, tx.type);
    const isExpense = tx.type === 'expense';
    const sign = isExpense ? '-' : '+';
    const amountClass = isExpense ? 'text-danger' : 'text-success';

    openConfirmDeleteModal({
        title: "Operatsiyani O'chirish",
        desc: "Ushbu operatsiyani tarixdan o'chirib tashlamoqchimisiz?",
        previewData: {
            icon: meta.icon,
            color: meta.color,
            title: tx.description,
            meta: `${tx.category} • ${formatDate(tx.date)}`,
            amountText: `${sign}${formatCurrency(tx.amount)}`,
            amountClass: amountClass
        },
        onConfirm: () => {
            state.transactions = state.transactions.filter(t => t.id !== id);
            saveTransactionsToStorage();
            renderAll();
            showToast("Operatsiya muvaffaqiyatli o'chirildi.", "info");
        }
    });
}

// ============================================================================
// BUDGET LIMITS & NOTIFICATIONS
// ============================================================================
function checkBudgetAlert(categoryName) {
    const limit = state.budgets[categoryName];
    if (!limit || limit <= 0) return;

    const spent = calculateSpentForCategory(categoryName);
    const percentage = (spent / limit) * 100;

    if (percentage >= 100) {
        showToast(
            `Diqqat: "${categoryName}" byudjet limiti to'ldi yoki oshib ketdi! (${Math.round(percentage)}%)`,
            "danger",
            6000
        );
    } else if (percentage >= 80) {
        showToast(
            `Ogohlantirish: "${categoryName}" byudjeti 80% dan oshdi! (${Math.round(percentage)}%)`,
            "warning",
            5000
        );
    }
}

function calculateSpentForCategory(categoryName, period = 'currentMonth') {
    let txs = getFilteredTransactionsByPeriod(period);
    return txs
        .filter(t => t.type === 'expense' && t.category === categoryName)
        .reduce((sum, t) => sum + t.amount, 0);
}

function getSelectedYearMonth() {
    const yyyy = state.selectedYear;
    const mm = String(state.selectedMonth + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
}

function getPrevYearMonth() {
    let m = state.selectedMonth - 1;
    let y = state.selectedYear;
    if (m < 0) {
        m = 11;
        y--;
    }
    const mm = String(m + 1).padStart(2, '0');
    return `${y}-${mm}`;
}

function isCurrentMonthSelected() {
    const now = new Date();
    return state.selectedYear === now.getFullYear() && state.selectedMonth === now.getMonth();
}

function getFilteredTransactionsByPeriod(period = 'currentMonth') {
    if (period === 'all') {
        return state.transactions;
    } else if (period === 'prevMonth') {
        const ym = getPrevYearMonth();
        return state.transactions.filter(t => t.date && t.date.startsWith(ym));
    } else {
        const ym = getSelectedYearMonth();
        return state.transactions.filter(t => t.date && t.date.startsWith(ym));
    }
}

// ============================================================================
// MONTH-BY-MONTH NAVIGATION & SELECTION (OYMA-OY KO'RISH)
// ============================================================================
function updateMonthNavigationDisplay() {
    const monthText = `${UZBEK_MONTHS[state.selectedMonth]} ${state.selectedYear}`;
    if (elements.activeMonthDisplay) {
        elements.activeMonthDisplay.textContent = monthText;
    }
    if (elements.currentMonthYearText) {
        elements.currentMonthYearText.textContent = monthText;
    }

    const isCurrent = isCurrentMonthSelected();
    if (elements.monthSubStatus) {
        elements.monthSubStatus.textContent = isCurrent ? "Joriy oy ko'rinishi" : "Arxiv oy ko'rinishi";
    }
    if (elements.notCurrentMonthBanner) {
        elements.notCurrentMonthBanner.style.display = isCurrent ? 'none' : 'flex';
    }
}

function navigateMonth(delta) {
    let m = state.selectedMonth + delta;
    let y = state.selectedYear;
    if (m < 0) {
        m = 11;
        y--;
    } else if (m > 11) {
        m = 0;
        y++;
    }
    state.selectedMonth = m;
    state.selectedYear = y;
    state.pickerYear = y;
    renderAll();
}

function resetToCurrentMonth() {
    const now = new Date();
    state.selectedYear = now.getFullYear();
    state.selectedMonth = now.getMonth();
    state.pickerYear = state.selectedYear;
    renderAll();
    showToast("Joriy oyga qaytildi!", "info", 2000);
}

function openMonthPickerModal() {
    state.pickerYear = state.selectedYear;
    renderMonthPickerGrid();
    if (elements.monthPickerModalOverlay) {
        elements.monthPickerModalOverlay.classList.add('active');
    }
}

function closeMonthPickerModal() {
    if (elements.monthPickerModalOverlay) {
        elements.monthPickerModalOverlay.classList.remove('active');
    }
}

function changePickerYear(delta) {
    state.pickerYear += delta;
    renderMonthPickerGrid();
}

function renderMonthPickerGrid() {
    if (elements.pickerYearDisplay) {
        elements.pickerYearDisplay.textContent = state.pickerYear;
    }
    if (!elements.monthsGrid12) return;
    elements.monthsGrid12.innerHTML = '';

    const now = new Date();
    const realCurrentYear = now.getFullYear();
    const realCurrentMonth = now.getMonth();

    for (let m = 0; m < 12; m++) {
        const ym = `${state.pickerYear}-${String(m + 1).padStart(2, '0')}`;
        const count = state.transactions.filter(t => t.date && t.date.startsWith(ym)).length;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'month-grid-item';

        if (state.pickerYear === state.selectedYear && m === state.selectedMonth) {
            btn.classList.add('active');
        }
        if (state.pickerYear === realCurrentYear && m === realCurrentMonth) {
            btn.classList.add('is-current-month');
        }

        btn.innerHTML = `
            <span class="month-name">${UZBEK_MONTHS[m]}</span>
            <span class="month-tx-badge">${count > 0 ? count + ' ta' : '–'}</span>
        `;

        btn.addEventListener('click', () => {
            selectMonthFromPicker(state.pickerYear, m);
        });

        elements.monthsGrid12.appendChild(btn);
    }
}

function selectMonthFromPicker(year, month) {
    state.selectedYear = year;
    state.selectedMonth = month;
    closeMonthPickerModal();
    renderAll();
    showToast(`${UZBEK_MONTHS[month]} ${year} oyi tanlandi`, "info", 2000);
}

// ============================================================================
// TOP UP BUDGET MODAL (BYUDJETGA PUL KIRITISH)
// ============================================================================
function openTopUpBudgetModal() {
    if (elements.topUpAmount) elements.topUpAmount.value = '';
    if (elements.topUpDescription) elements.topUpDescription.value = '';

    // Set today's date
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    if (elements.topUpDate) {
        elements.topUpDate.value = `${yyyy}-${mm}-${dd}`;
    }

    // Default source to Pensiya
    if (elements.topUpSelectedSource) {
        elements.topUpSelectedSource.value = 'Pensiya';
    }
    document.querySelectorAll('#topUpSourceGrid .source-chip').forEach(c => {
        if (c.getAttribute('data-source') === 'Pensiya') {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });

    if (elements.topUpBudgetModalOverlay) {
        elements.topUpBudgetModalOverlay.classList.add('active');
    }
    setTimeout(() => {
        if (elements.topUpAmount) elements.topUpAmount.focus();
    }, 200);
}

function closeTopUpBudgetModal() {
    if (elements.topUpBudgetModalOverlay) {
        elements.topUpBudgetModalOverlay.classList.remove('active');
    }
}

function handleTopUpBudgetSubmit(e) {
    e.preventDefault();

    const amount = parseFormattedNumber(elements.topUpAmount.value);
    const source = (elements.topUpSelectedSource && elements.topUpSelectedSource.value) || 'Pensiya';
    const date = elements.topUpDate.value || new Date().toISOString().slice(0, 10);
    const descInput = elements.topUpDescription.value.trim();
    const description = descInput || `${source} tushumi`;

    if (isNaN(amount) || amount <= 0) {
        showToast("Iltimos, byudjetga kiritish uchun summani yozing!", "warning");
        return;
    }

    const newTx = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        type: 'income',
        amount: amount,
        category: source,
        date: date,
        description: description,
        createdAt: new Date().toISOString()
    };

    state.transactions.unshift(newTx);
    saveTransactionsToStorage();
    closeTopUpBudgetModal();
    renderAll();
    showToast(`Oila byudjetiga ${formatCurrency(amount)} muvaffaqiyatli kiritildi!`, "success", 4000);
}

// ============================================================================
// MONTHLY SUMMARY CARD & TELEGRAM COPY (OYLIK HISOBOT)
// ============================================================================
function renderMonthlySummaryCard() {
    if (!elements.monthlySummaryText) return;

    const {
        totalIncome,
        totalExpense,
        remainingFree,
        netBalance,
        baseBudget,
        extraIncome,
        expenseCount,
        incomeCount
    } = calculateFamilyTotals('currentMonth');

    if (elements.summaryTotalIncome) elements.summaryTotalIncome.textContent = `+${formatCurrency(totalIncome)}`;
    if (elements.summaryTotalExpense) elements.summaryTotalExpense.textContent = `-${formatCurrency(totalExpense)}`;
    if (elements.summaryRemaining) elements.summaryRemaining.textContent = formatCurrency(remainingFree);

    const monthLabel = `${UZBEK_MONTHS[state.selectedMonth]} ${state.selectedYear}`;

    if (expenseCount === 0 && incomeCount === 0) {
        if (elements.summaryStatusBadge) {
            elements.summaryStatusBadge.className = 'summary-status-badge status-neutral';
            elements.summaryStatusBadge.innerHTML = `<i class="fa-solid fa-circle-info"></i> Rejalashtirish davri`;
        }
        elements.monthlySummaryText.textContent = `${monthLabel} oyi uchun byudjet ${formatCurrency(baseBudget)} etib belgilangan. Hali xarajatlar kiritilmagan.`;
    } else if (netBalance < 0) {
        const deficit = Math.abs(netBalance);
        if (elements.summaryStatusBadge) {
            elements.summaryStatusBadge.className = 'summary-status-badge status-danger';
            elements.summaryStatusBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Kamomad (${formatCurrency(deficit)})`;
        }
        elements.monthlySummaryText.textContent = `Diqqat: ${monthLabel} oyida xarajatlar mavjud byudjetdan ${formatCurrency(deficit)} ga oshib ketdi. Keyingi xarajatlarni qisqartirish tavsiya etiladi.`;
    } else if (netBalance > 0) {
        if (elements.summaryStatusBadge) {
            elements.summaryStatusBadge.className = 'summary-status-badge status-safe';
            elements.summaryStatusBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Barqaror & Tejamkor`;
        }
        elements.monthlySummaryText.textContent = `Ajoyib! ${monthLabel} oyida ${formatCurrency(remainingFree)} erkin jamg'arma saqlab qolindi. Oila byudjeti me'yorida boshqarilmoqda.`;
    } else {
        if (elements.summaryStatusBadge) {
            elements.summaryStatusBadge.className = 'summary-status-badge status-warn';
            elements.summaryStatusBadge.innerHTML = `<i class="fa-solid fa-scale-balanced"></i> Balans to'liq sarflandi`;
        }
        elements.monthlySummaryText.textContent = `${monthLabel} oyida barcha kirimlar to'liq xarajatlarni qopladi, qoldiq 0 so'm.`;
    }
}

function copyMonthlySummaryToClipboard() {
    const {
        totalIncome,
        totalExpense,
        remainingFree,
        netBalance,
        baseBudget,
        extraIncome
    } = calculateFamilyTotals('currentMonth');

    const monthLabel = `${UZBEK_MONTHS[state.selectedMonth]} ${state.selectedYear}`;
    let holat = "Barqaror (Tejamkor)";
    if (netBalance < 0) {
        holat = `Kamomad (-${formatCurrency(Math.abs(netBalance))})`;
    } else if (remainingFree > 0) {
        holat = `Erkin qoldiq mavjud (+${formatCurrency(remainingFree)})`;
    }

    const textToCopy = 
`📊 OILA BYUDJETI VA XARAJATLAR HISOBOTI
🗓 Davr: ${monthLabel}
━━━━━━━━━━━━━━━━━━
🛡 Asosiy oylik byudjet: ${formatCurrency(baseBudget)}
➕ Qo'shimcha tushumlar: +${formatCurrency(extraIncome)}
💰 Jami daromad/byudjet: ${formatCurrency(totalIncome)}
💸 Jami xarajatlar: -${formatCurrency(totalExpense)}
━━━━━━━━━━━━━━━━━━
💎 Erkin qoldiq (Jamg'arma): ${formatCurrency(remainingFree)}
📌 Holat: ${holat}
━━━━━━━━━━━━━━━━━━
📱 HamyonPro Mobile ilovasi orqali hisoblandi`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast("Oylik hisobot nusxalandi! Telegram orqali yuborishingiz mumkin.", "success", 4000);
        }).catch(() => {
            fallbackCopyText(textToCopy);
        });
    } else {
        fallbackCopyText(textToCopy);
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showToast("Oylik hisobot nusxalandi! Telegram orqali yuborishingiz mumkin.", "success", 4000);
    } catch (err) {
        showToast("Nusxalashda xatolik yuz berdi.", "danger");
    }
    document.body.removeChild(textArea);
}

function openBudgetModal() {
    elements.budgetInputsContainer.innerHTML = '';

    EXPENSE_CATEGORIES.forEach(cat => {
        const currentLimit = state.budgets[cat.name] ?? cat.defaultBudget;
        const group = document.createElement('div');
        group.className = 'budget-field-group';
        group.innerHTML = `
            <div class="budget-field-label">
                <i class="fa-solid ${cat.icon}" style="color: ${cat.color}"></i>
                <span>${cat.name}</span>
            </div>
            <div class="input-wrapper">
                <input type="text" name="budget_${cat.name}" class="form-input formatted-number-input" value="${formatNumberString(currentLimit)}" inputmode="numeric" required>
                <span class="input-currency">UZS</span>
            </div>
        `;
        elements.budgetInputsContainer.appendChild(group);

        const input = group.querySelector('input');
        input.addEventListener('input', (e) => {
            e.target.value = formatNumberString(e.target.value);
        });
    });

    elements.budgetModalOverlay.classList.add('active');
}

function closeBudgetModal() {
    elements.budgetModalOverlay.classList.remove('active');
}

function handleSaveBudgets(e) {
    e.preventDefault();
    const formData = new FormData(elements.budgetSettingsForm);

    EXPENSE_CATEGORIES.forEach(cat => {
        const raw = formData.get(`budget_${cat.name}`);
        const val = parseFormattedNumber(raw);
        state.budgets[cat.name] = isNaN(val) ? 0 : val;
    });

    saveBudgetsToStorage();
    closeBudgetModal();
    renderBudgetSection();
    renderDashboardStats();
    showToast("Kategoriyalar limitlari yangilandi!", "success");
}

// ============================================================================
// CALCULATIONS FOR INTERCONNECTED FAMILY BUDGET
// ============================================================================
function calculateFamilyTotals(period = 'currentMonth') {
    const txs = getFilteredTransactionsByPeriod(period);

    let extraIncome = 0;
    let incomeCount = 0;
    let totalExpense = 0;
    let expenseCount = 0;

    txs.forEach(t => {
        if (t.type === 'income') {
            extraIncome += t.amount;
            incomeCount++;
        } else {
            totalExpense += t.amount;
            expenseCount++;
        }
    });

    // In currentMonth, baseBudget is active
    const baseBudget = state.familyBaseBudget;
    const totalIncome = baseBudget + extraIncome;
    const netBalance = totalIncome - totalExpense;
    const usedPercentage = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;
    const remainingFree = Math.max(0, totalIncome - totalExpense);

    return {
        baseBudget,
        extraIncome,
        incomeCount,
        totalIncome,
        totalExpense,
        expenseCount,
        netBalance,
        usedPercentage,
        remainingFree
    };
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================
function renderAll() {
    updateMonthNavigationDisplay();
    renderDashboardStats();
    renderHomeRecentTransactions();
    renderTransactionsList();
    renderBudgetSection();
    renderStatisticsSection();
    renderMonthlySummaryCard();
}

/**
 * Renders Top Balances, Interconnected Family Budget on Home Screen
 */
function renderDashboardStats() {
    const {
        baseBudget,
        extraIncome,
        incomeCount,
        totalIncome,
        totalExpense,
        expenseCount,
        netBalance,
        usedPercentage,
        remainingFree
    } = calculateFamilyTotals('currentMonth');

    let barClass = 'bar-success';
    if (usedPercentage >= 100) {
        barClass = 'bar-danger';
    } else if (usedPercentage >= 80) {
        barClass = 'bar-warning';
    }

    // 1. Total Balance Displays (Hero Card & Add Page)
    if (elements.totalBalance) {
        elements.totalBalance.textContent = formatCurrency(netBalance);
    }
    if (elements.availableBalanceDisplay) {
        elements.availableBalanceDisplay.textContent = formatCurrency(netBalance);
    }
    if (elements.addPageBalanceDisplay) {
        elements.addPageBalanceDisplay.textContent = formatCurrency(netBalance);
    }

    // Hero Balance Status Pill
    if (elements.balanceStatus) {
        if (netBalance > 0) {
            elements.balanceStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Barqaror`;
            elements.balanceStatus.className = "hero-status-pill status-safe";
        } else if (netBalance < 0) {
            elements.balanceStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Kamomad`;
            elements.balanceStatus.className = "hero-status-pill status-danger";
        } else {
            elements.balanceStatus.innerHTML = `<i class="fa-solid fa-circle-info"></i> Balans 0`;
            elements.balanceStatus.className = "hero-status-pill status-neutral";
        }
    }

    // 2. Home Hero 3 Vital Metrics (Jami Kirim, Jami Chiqim, Erkin Qoldiq)
    if (elements.heroTotalIncome) {
        elements.heroTotalIncome.textContent = `+${formatCurrency(totalIncome)}`;
    }
    if (elements.heroTotalExpense) {
        elements.heroTotalExpense.textContent = `-${formatCurrency(totalExpense)}`;
    }
    if (elements.heroRemainingSavings) {
        elements.heroRemainingSavings.textContent = formatCurrency(remainingFree);
    }

    // Hero Budget Meter
    if (elements.heroBudgetPercent) {
        elements.heroBudgetPercent.textContent = `${usedPercentage}%`;
    }
    if (elements.heroBudgetRemaining) {
        elements.heroBudgetRemaining.textContent = `${formatCurrency(remainingFree)} qoldi`;
    }
    if (elements.heroProgressBar) {
        elements.heroProgressBar.style.width = `${Math.min(usedPercentage, 100)}%`;
        elements.heroProgressBar.className = `progress-bar-fill ${barClass}`;
    }

    // 3. Interconnected Family Budget Section Counters
    if (elements.homeBaseBudget) {
        elements.homeBaseBudget.textContent = formatCurrency(baseBudget);
    }
    if (elements.homeExtraIncome) {
        elements.homeExtraIncome.textContent = `+${formatCurrency(extraIncome)}`;
    }
    if (elements.homeIncomeCount) {
        elements.homeIncomeCount.textContent = `${incomeCount} ta qo'shimcha kirim`;
    }
    if (elements.homeTotalExpense) {
        elements.homeTotalExpense.textContent = `-${formatCurrency(totalExpense)}`;
    }
    if (elements.homeExpenseCount) {
        elements.homeExpenseCount.textContent = `${expenseCount} ta xarajat`;
    }

    // Interconnected Progress Bar
    if (elements.familyBudgetUsedPct) {
        elements.familyBudgetUsedPct.textContent = `${usedPercentage}%`;
    }
    if (elements.familyBudgetRemainingTxt) {
        elements.familyBudgetRemainingTxt.textContent = `${formatCurrency(remainingFree)} erkin qoldiq`;
    }
    if (elements.familyBudgetProgressBar) {
        elements.familyBudgetProgressBar.style.width = `${Math.min(usedPercentage, 100)}%`;
        elements.familyBudgetProgressBar.className = `progress-bar-fill ${barClass}`;
    }

    // 4. Overall Budget Tab Cards
    if (elements.budgetOverallBaseDisplay) {
        elements.budgetOverallBaseDisplay.textContent = formatCurrency(totalIncome);
        elements.budgetOverallDetails.textContent = `${formatCurrency(totalExpense)} sarflandi • ${formatCurrency(remainingFree)} erkin qoldiq`;
    }
    if (elements.budgetOverallBadge) {
        if (usedPercentage >= 100) {
            elements.budgetOverallBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Limit oshgan (${usedPercentage}%)`;
            elements.budgetOverallBadge.className = "meter-status-badge badge-danger";
        } else if (usedPercentage >= 80) {
            elements.budgetOverallBadge.innerHTML = `<i class="fa-solid fa-bell"></i> Diqqat (${usedPercentage}%)`;
            elements.budgetOverallBadge.className = "meter-status-badge badge-warn";
        } else {
            elements.budgetOverallBadge.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Xavfsiz (${usedPercentage}%)`;
            elements.budgetOverallBadge.className = "meter-status-badge badge-safe";
        }
    }
}

/**
 * Renders Recent Transactions on Home Screen
 */
function renderHomeRecentTransactions() {
    if (!elements.homeTransactionsList) return;

    const ym = getSelectedYearMonth();
    let filtered = state.transactions.filter(t => t.date && t.date.startsWith(ym));
    if (state.homeFilter === 'expense') {
        filtered = filtered.filter(t => t.type === 'expense');
    } else if (state.homeFilter === 'income') {
        filtered = filtered.filter(t => t.type === 'income');
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    const topItems = filtered.slice(0, 6);
    elements.homeTransactionsList.innerHTML = '';

    if (topItems.length === 0) {
        elements.homeTransactionsList.innerHTML = `
            <div style="text-align: center; padding: 20px; color: var(--text-dim); font-size: 0.8rem;">
                Ushbu oyda operatsiyalar mavjud emas
            </div>
        `;
        return;
    }

    topItems.forEach(tx => {
        const meta = getCategoryMeta(tx.category, tx.type);
        const isExpense = tx.type === 'expense';
        const sign = isExpense ? '-' : '+';
        const amountClass = isExpense ? 'text-danger' : 'text-success';

        const item = document.createElement('div');
        item.className = 'tx-compact-item';
        item.innerHTML = `
            <div class="tx-compact-left">
                <div class="tx-compact-icon" style="background: ${meta.color}1a; color: ${meta.color}; border: 1px solid ${meta.color}33;">
                    <i class="fa-solid ${meta.icon}"></i>
                </div>
                <div class="tx-compact-info">
                    <div class="tx-compact-title">${escapeHTML(tx.description)}</div>
                    <div class="tx-compact-sub">${escapeHTML(tx.category)} • ${formatDate(tx.date)}</div>
                </div>
            </div>
            <div class="tx-compact-amount ${amountClass}">
                ${sign}${formatCurrency(tx.amount)}
            </div>
        `;
        elements.homeTransactionsList.appendChild(item);
    });
}

/**
 * Renders Filtered Transactions in Tarix (History) Tab
 */
function renderTransactionsList() {
    const searchTerm = elements.searchFilter.value.trim().toLowerCase();
    const typeTerm = elements.typeFilter.value;
    const catTerm = elements.categoryFilter.value;

    const filtered = state.transactions.filter(t => {
        const matchesSearch = !searchTerm ||
            t.description.toLowerCase().includes(searchTerm) ||
            t.category.toLowerCase().includes(searchTerm) ||
            t.amount.toString().includes(searchTerm);

        const matchesType = (typeTerm === 'all') || (t.type === typeTerm);
        const matchesCat = (catTerm === 'all') || (t.category === catTerm);

        return matchesSearch && matchesType && matchesCat;
    });

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    elements.txFilteredCount.textContent = `${filtered.length} ta`;
    elements.transactionsList.innerHTML = '';

    if (filtered.length === 0) {
        elements.emptyState.style.display = 'flex';
        return;
    } else {
        elements.emptyState.style.display = 'none';
    }

    filtered.forEach(tx => {
        const meta = getCategoryMeta(tx.category, tx.type);
        const isExpense = tx.type === 'expense';
        const sign = isExpense ? '-' : '+';
        const amountClass = isExpense ? 'text-danger' : 'text-success';

        const item = document.createElement('div');
        item.className = 'tx-item';
        item.innerHTML = `
            <div class="tx-left">
                <div class="tx-cat-icon" style="background: ${meta.color}1a; color: ${meta.color}; border: 1px solid ${meta.color}33;">
                    <i class="fa-solid ${meta.icon}"></i>
                </div>
                <div class="tx-details">
                    <div class="tx-title">${escapeHTML(tx.description)}</div>
                    <div class="tx-meta">
                        <span class="tx-category-badge">${escapeHTML(tx.category)}</span>
                        <span><i class="fa-regular fa-calendar"></i> ${formatDate(tx.date)}</span>
                    </div>
                </div>
            </div>

            <div class="tx-right">
                <div class="tx-amount ${amountClass}">
                    ${sign}${formatCurrency(tx.amount)}
                </div>
                <div class="tx-actions">
                    <button class="tx-action-btn btn-edit" title="Tahrirlash" data-id="${tx.id}" onclick="openEditModal('${tx.id}')">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="tx-action-btn btn-delete" title="O'chirish" data-id="${tx.id}" onclick="deleteTransaction('${tx.id}')">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
        elements.transactionsList.appendChild(item);
    });
}

/**
 * Renders Budget Progress Bars in Byudjet Tab
 */
function renderBudgetSection() {
    elements.budgetList.innerHTML = '';

    EXPENSE_CATEGORIES.forEach(cat => {
        const limit = state.budgets[cat.name] || 0;
        const spent = calculateSpentForCategory(cat.name, 'currentMonth');
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;
        const roundedPercent = Math.round(percentage);

        let barClass = 'bar-success';
        let badgeClass = 'badge-safe';

        if (roundedPercent >= 100) {
            barClass = 'bar-danger';
            badgeClass = 'badge-danger';
        } else if (roundedPercent >= 80) {
            barClass = 'bar-warning';
            badgeClass = 'badge-warn';
        }

        const barWidth = Math.min(percentage, 100);

        const budgetItem = document.createElement('div');
        budgetItem.className = 'budget-item';
        budgetItem.innerHTML = `
            <div class="budget-top">
                <div class="budget-category-info">
                    <i class="fa-solid ${cat.icon}" style="color: ${cat.color}"></i>
                    <span>${cat.name}</span>
                </div>
                <span class="budget-percentage-badge ${badgeClass}">${roundedPercent}%</span>
            </div>
            <div class="progress-container">
                <div class="progress-bar-fill ${barClass}" style="width: ${barWidth}%;"></div>
            </div>
            <div class="budget-stats">
                <span class="budget-spent">${formatCurrency(spent)} sarflandi</span>
                <span class="budget-limit">Limit: ${formatCurrency(limit)}</span>
            </div>
        `;
        elements.budgetList.appendChild(budgetItem);
    });
}

/**
 * Enhanced Statistika Bo'limi (Circular Chart, Key Metrics & Breakdown with Progress Bars)
 */
function renderStatisticsSection() {
    const period = state.statsPeriod;
    const txs = getFilteredTransactionsByPeriod(period);

    // Filter expenses & incomes for period
    const expenseTxs = txs.filter(t => t.type === 'expense');
    const incomeTxs = txs.filter(t => t.type === 'income');

    let totalExpense = 0;
    const categoryTotals = {};
    EXPENSE_CATEGORIES.forEach(cat => {
        categoryTotals[cat.name] = 0;
    });

    expenseTxs.forEach(tx => {
        if (!categoryTotals[tx.category]) categoryTotals[tx.category] = 0;
        categoryTotals[tx.category] += tx.amount;
        totalExpense += tx.amount;
    });

    let extraIncome = 0;
    incomeTxs.forEach(tx => extraIncome += tx.amount);
    const totalIncome = (period === 'currentMonth' ? state.familyBaseBudget : 0) + extraIncome;

    // Center display & header total
    elements.statsCenterExpenseValue.textContent = formatCurrency(totalExpense);
    elements.chartExpenseTotal.textContent = `Jami: ${formatCurrency(totalExpense)}`;

    // Prepare data for chart & breakdown
    const labels = [];
    const dataValues = [];
    const backgroundColors = [];
    const breakdownItems = [];

    EXPENSE_CATEGORIES.forEach(cat => {
        const sum = categoryTotals[cat.name] || 0;
        if (sum > 0) {
            labels.push(cat.name);
            dataValues.push(sum);
            backgroundColors.push(cat.color);
            const pct = totalExpense > 0 ? Math.round((sum / totalExpense) * 100) : 0;
            breakdownItems.push({
                name: cat.name,
                icon: cat.icon,
                amount: sum,
                percent: pct,
                color: cat.color
            });
        }
    });

    // Render Key Indicators
    renderKeyIndicators({
        breakdownItems,
        totalExpense,
        totalIncome,
        expenseTxs,
        period
    });

    // Render Category Breakdown list
    renderCategoryBreakdownList(breakdownItems, totalExpense);

    // Render Chart.js
    if (typeof Chart === 'undefined') {
        elements.emptyChart.style.display = 'flex';
        elements.expenseChartCanvas.style.display = 'none';
        if (elements.chartCenterContent) elements.chartCenterContent.style.display = 'none';
        return;
    }

    if (dataValues.length === 0) {
        if (state.chartInstance) {
            state.chartInstance.destroy();
            state.chartInstance = null;
        }
        elements.emptyChart.style.display = 'flex';
        elements.expenseChartCanvas.style.display = 'none';
        if (elements.chartCenterContent) elements.chartCenterContent.style.display = 'none';
        return;
    }

    elements.emptyChart.style.display = 'none';
    elements.expenseChartCanvas.style.display = 'block';

    if (state.chartInstance) {
        state.chartInstance.destroy();
    }

    const ctx = elements.expenseChartCanvas.getContext('2d');

    if (state.chartType === 'doughnut') {
        if (elements.chartCenterContent) elements.chartCenterContent.style.display = 'flex';

        state.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: dataValues,
                    backgroundColor: backgroundColors,
                    borderWidth: 3,
                    borderColor: '#ffffff',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                const val = context.parsed;
                                const pct = totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0;
                                return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
                            }
                        }
                    }
                },
                cutout: '76%',
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 800
                }
            }
        });
    } else {
        if (elements.chartCenterContent) elements.chartCenterContent.style.display = 'none';

        const gradient = ctx.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, '#a855f7');
        gradient.addColorStop(1, '#6c2bd9');

        state.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: "Xarajat",
                    data: dataValues,
                    backgroundColor: gradient,
                    borderRadius: 10,
                    barPercentage: 0.65
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#fff',
                        bodyColor: '#a78bfa',
                        padding: 10,
                        callbacks: {
                            label: function(context) {
                                return ` ${formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748b', font: { size: 10, weight: '600' } }
                    },
                    y: {
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                            color: '#64748b',
                            font: { size: 9 },
                            callback: function(val) {
                                if (val >= 1000000) return (val / 1000000) + 'M';
                                if (val >= 1000) return (val / 1000) + 'k';
                                return val;
                            }
                        }
                    }
                }
            }
        });
    }
}

/**
 * Calculates and Renders Key Financial Indicators in Statistics Tab
 */
function renderKeyIndicators({ breakdownItems, totalExpense, totalIncome, expenseTxs, period }) {
    // 1. Top Category
    if (breakdownItems.length > 0) {
        breakdownItems.sort((a, b) => b.amount - a.amount);
        const top = breakdownItems[0];
        elements.statTopCategory.textContent = top.name;
        elements.statTopCategoryAmount.textContent = `${formatCurrency(top.amount)} (${top.percent}%)`;
    } else {
        elements.statTopCategory.textContent = "-";
        elements.statTopCategoryAmount.textContent = "0 so'm";
    }

    // 2. Savings Rate & Amount
    const savings = Math.max(0, totalIncome - totalExpense);
    const savingsPct = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;
    elements.statSavingsRate.textContent = `${savingsPct}%`;
    elements.statSavingsAmount.textContent = `${formatCurrency(savings)} tejandi`;

    // 3. Daily Average Spend
    const daysInPeriod = period === 'all' ? Math.max(1, expenseTxs.length) : new Date().getDate();
    const dailyAvg = totalExpense > 0 ? Math.round(totalExpense / Math.max(1, daysInPeriod)) : 0;
    elements.statDailyAverage.textContent = formatCurrency(dailyAvg);

    // 4. Income vs Expense Ratio
    const ratio = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;
    elements.statIncomeExpenseRatio.textContent = `${ratio}%`;
}

/**
 * Renders the Category Breakdown List with Progress Bars & Comma Amounts
 */
function renderCategoryBreakdownList(items, totalExpense) {
    if (!elements.categoryBreakdownList) return;
    elements.categoryBreakdownList.innerHTML = '';
    elements.statsCategoryCount.textContent = `${items.length} ta`;

    if (items.length === 0) {
        elements.categoryBreakdownList.innerHTML = `
            <div style="text-align: center; color: var(--text-dim); font-size: 0.8rem; padding: 14px;">
                Ushbu davrda xarajatlar mavjud emas
            </div>
        `;
        return;
    }

    items.sort((a, b) => b.amount - a.amount);

    items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'breakdown-row-item';
        row.innerHTML = `
            <div class="b-row-top">
                <div class="b-row-left">
                    <span class="b-color-dot" style="background: ${item.color};"></span>
                    <span class="b-name">${escapeHTML(item.name)}</span>
                </div>
                <div class="b-row-right">
                    <span class="b-amount">${formatCurrency(item.amount)}</span>
                    <span class="b-pct-badge">${item.percent}%</span>
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar-fill" style="width: ${item.percent}%; background: ${item.color};"></div>
            </div>
        `;
        elements.categoryBreakdownList.appendChild(row);
    });
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================
function showToast(message, type = 'info', duration = 3800) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-info';
    let title = 'Bildirishnoma';

    if (type === 'success') {
        iconClass = 'fa-circle-check';
        title = 'Muvaffaqiyatli';
    } else if (type === 'warning') {
        iconClass = 'fa-triangle-exclamation';
        title = 'Ogohlantirish';
    } else if (type === 'danger') {
        iconClass = 'fa-circle-radiation';
        title = 'Diqqat!';
    }

    toast.innerHTML = `
        <i class="fa-solid ${iconClass} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${escapeHTML(message)}</div>
        </div>
        <button class="toast-close">&times;</button>
        <div class="toast-progress">
            <div class="toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
        </div>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
        toast.classList.add('toast-closing');
        setTimeout(() => toast.remove(), 250);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);

    elements.toastContainer.appendChild(toast);
}

// ============================================================================
// HELPER / UTILITY FUNCTIONS
// ============================================================================
function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dateStr;
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

// ============================================================================
// INITIAL DEMO DATA SEEDING (REALISTIC FAMILY FINANCES)
// ============================================================================
function seedInitialDemoData() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');

    // O'tgan oy (Zero bug integer calculation)
    let prevM = today.getMonth() - 1;
    let prevY = today.getFullYear();
    if (prevM < 0) {
        prevM = 11;
        prevY--;
    }
    const prevMm = String(prevM + 1).padStart(2, '0');

    // 1. Oila doimiy byudjeti: 8,000,000 so'm
    state.familyBaseBudget = 8000000;
    saveFamilyBudgetToStorage();

    // 2. Kategoriya limitlarini o'rnatish
    EXPENSE_CATEGORIES.forEach(cat => {
        state.budgets[cat.name] = cat.defaultBudget;
    });
    saveBudgetsToStorage();

    // 3. Namunaviy operatsiyalar (Joriy oy va o'tgan oy uchun)
    state.transactions = [
        // Joriy oy operatsiyalari
        {
            id: 'tx_seed_1',
            type: 'income',
            amount: 2500000,
            category: 'Pensiya',
            date: `${yyyy}-${mm}-03`,
            description: 'Ota-ona oylik pensiyasi'
        },
        {
            id: 'tx_seed_2',
            type: 'income',
            amount: 1500000,
            category: 'Qo\'shimcha daromad',
            date: `${yyyy}-${mm}-05`,
            description: 'Frilans loyiha va veb-sayt dizayni'
        },
        {
            id: 'tx_seed_3',
            type: 'expense',
            amount: 1750000,
            category: 'Oziq-ovqat',
            date: `${yyyy}-${mm}-08`,
            description: 'Katta oylik bozorlik (Korzinka)'
        },
        {
            id: 'tx_seed_4',
            type: 'expense',
            amount: 450000,
            category: 'Transport',
            date: `${yyyy}-${mm}-10`,
            description: 'Avtomobil benzin yoqilg\'isi'
        },
        {
            id: 'tx_seed_5',
            type: 'expense',
            amount: 620000,
            category: 'Kommunal',
            date: `${yyyy}-${mm}-12`,
            description: 'Gaz, elektr va suv to\'lovlari'
        },
        {
            id: 'tx_seed_6',
            type: 'expense',
            amount: 850000,
            category: 'Uy-ro\'zg\'or',
            date: `${yyyy}-${mm}-16`,
            description: 'Mebel va maishiy buyumlar'
        },
        {
            id: 'tx_seed_7',
            type: 'expense',
            amount: 350000,
            category: 'Sog\'liq',
            date: `${yyyy}-${mm}-19`,
            description: 'Dorixona va profilaktik ko\'rik'
        },
        {
            id: 'tx_seed_8',
            type: 'expense',
            amount: 500000,
            category: 'Ta\'lim & Bolalar',
            date: `${yyyy}-${mm}-22`,
            description: 'Bolalar o\'quv markazi to\'lovi'
        },
        {
            id: 'tx_seed_9',
            type: 'expense',
            amount: 320000,
            category: 'Ko\'ngilochar',
            date: `${yyyy}-${mm}-25`,
            description: 'Oila bilan tushlik va dam olish'
        },
        // O'tgan oy (Arxiv) operatsiyalari - Oyma-oy ko'rish uchun
        {
            id: 'tx_seed_prev_1',
            type: 'income',
            amount: 2500000,
            category: 'Pensiya',
            date: `${prevY}-${prevMm}-02`,
            description: "O'tgan oy pensiyasi"
        },
        {
            id: 'tx_seed_prev_2',
            type: 'expense',
            amount: 1950000,
            category: 'Oziq-ovqat',
            date: `${prevY}-${prevMm}-07`,
            description: 'Katta bozorlik'
        },
        {
            id: 'tx_seed_prev_3',
            type: 'expense',
            amount: 550000,
            category: 'Kommunal',
            date: `${prevY}-${prevMm}-11`,
            description: 'Gaz va elektr to\'lovlari'
        },
        {
            id: 'tx_seed_prev_4',
            type: 'expense',
            amount: 420000,
            category: 'Sog\'liq',
            date: `${prevY}-${prevMm}-18`,
            description: 'Dorixona va tibbiy ko\'rik'
        }
    ];

    saveTransactionsToStorage();
    renderAll();
}

// Global functions accessible to inline events
window.switchTab = switchTab;
window.setChartType = setChartType;
window.openEditModal = openEditModal;
window.deleteTransaction = deleteTransaction;
window.openBudgetModal = openBudgetModal;
window.openFamilyBudgetModal = openFamilyBudgetModal;
window.closeFamilyBudgetModal = closeFamilyBudgetModal;
window.closeSideMenu = closeSideMenu;
window.closeConfirmDeleteModal = closeConfirmDeleteModal;
// Month Navigator & Picker
window.navigateMonth = navigateMonth;
window.resetToCurrentMonth = resetToCurrentMonth;
window.openMonthPickerModal = openMonthPickerModal;
window.closeMonthPickerModal = closeMonthPickerModal;
window.changePickerYear = changePickerYear;
// Top Up Budget Modal
window.openTopUpBudgetModal = openTopUpBudgetModal;
window.closeTopUpBudgetModal = closeTopUpBudgetModal;
// Monthly Summary Card
window.copyMonthlySummaryToClipboard = copyMonthlySummaryToClipboard;
// Profile Modal
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.switchToProfileEditMode = switchToProfileEditMode;
window.switchToProfileViewMode = switchToProfileViewMode;
