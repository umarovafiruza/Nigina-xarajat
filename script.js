/**
 * ============================================================================
 * KUNDALIK XARAJATLAR VA BYUDJET BOSHQARUVI (EXPENSE TRACKER PRO)
 * Pure JavaScript: LocalStorage, Dynamic DOM, Chart.js, Toast Notifications
 * ============================================================================
 */

// Category Meta Data (Icons, Colors, Names)
const EXPENSE_CATEGORIES = [
    { name: "Oziq-ovqat", icon: "fa-utensils", color: "#f59e0b", defaultBudget: 2000000 },
    { name: "Transport", icon: "fa-car", color: "#3b82f6", defaultBudget: 600000 },
    { name: "Ko'ngilochar", icon: "fa-gamepad", color: "#ec4899", defaultBudget: 500000 },
    { name: "Kommunal", icon: "fa-lightbulb", color: "#14b8a6", defaultBudget: 700000 },
    { name: "Xaridlar", icon: "fa-bag-shopping", color: "#8b5cf6", defaultBudget: 1000000 },
    { name: "Sog'liq", icon: "fa-notes-medical", color: "#ef4444", defaultBudget: 400000 },
    { name: "Boshqa", icon: "fa-layer-group", color: "#64748b", defaultBudget: 300000 }
];

const INCOME_CATEGORIES = [
    { name: "Oylik maosh", icon: "fa-briefcase", color: "#10b981" },
    { name: "Frilans", icon: "fa-laptop-code", color: "#06b6d4" },
    { name: "Investitsiya", icon: "fa-arrow-trend-up", color: "#6366f1" },
    { name: "Sovg'a", icon: "fa-gift", color: "#f43f5e" },
    { name: "Boshqa daromad", icon: "fa-coins", color: "#84cc16" }
];

// LocalStorage Keys
const STORAGE_KEYS = {
    TRANSACTIONS: 'hamyon_transactions',
    BUDGETS: 'hamyon_budgets'
};

// Application State
let state = {
    transactions: [],
    budgets: {},
    chartInstance: null
};

// DOM Elements
const elements = {
    // Top summary
    currentMonthYearText: document.getElementById('currentMonthYearText'),
    totalBalance: document.getElementById('totalBalance'),
    balanceStatus: document.getElementById('balanceStatus'),
    totalIncome: document.getElementById('totalIncome'),
    incomeCount: document.getElementById('incomeCount'),
    totalExpense: document.getElementById('totalExpense'),
    expenseCount: document.getElementById('expenseCount'),
    overallBudgetPercent: document.getElementById('overallBudgetPercent'),
    overallBudgetRemaining: document.getElementById('overallBudgetRemaining'),

    // Transaction Form
    transactionForm: document.getElementById('transactionForm'),
    txAmount: document.getElementById('txAmount'),
    txCategory: document.getElementById('txCategory'),
    txDate: document.getElementById('txDate'),
    txDescription: document.getElementById('txDescription'),
    labelExpense: document.getElementById('labelExpense'),
    labelIncome: document.getElementById('labelIncome'),
    txTypeRadios: document.getElementsByName('txType'),

    // History and Filter
    searchFilter: document.getElementById('searchFilter'),
    typeFilter: document.getElementById('typeFilter'),
    categoryFilter: document.getElementById('categoryFilter'),
    transactionsList: document.getElementById('transactionsList'),
    txFilteredCount: document.getElementById('txFilteredCount'),
    emptyState: document.getElementById('emptyState'),

    // Budget Section
    budgetList: document.getElementById('budgetList'),
    openBudgetModalBtn: document.getElementById('openBudgetModalBtn'),
    openBudgetModalBtn2: document.getElementById('openBudgetModalBtn2'),
    budgetModalOverlay: document.getElementById('budgetModalOverlay'),
    closeBudgetModalBtn: document.getElementById('closeBudgetModalBtn'),
    cancelBudgetBtn: document.getElementById('cancelBudgetBtn'),
    budgetSettingsForm: document.getElementById('budgetSettingsForm'),
    budgetInputsContainer: document.getElementById('budgetInputsContainer'),

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

    // Chart & Toast
    expenseChartCanvas: document.getElementById('expenseChart'),
    emptyChart: document.getElementById('emptyChart'),
    chartExpenseTotal: document.getElementById('chartExpenseTotal'),
    toastContainer: document.getElementById('toastContainer'),

    // Header buttons
    seedDataBtn: document.getElementById('seedDataBtn'),
    resetDataBtn: document.getElementById('resetDataBtn')
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initDateDefaults();
    loadFromStorage();

    // If storage is empty on first load, seed with demo data for pleasant presentation
    if (state.transactions.length === 0) {
        seedInitialDemoData();
    }

    setupEventListeners();
    populateCategoryDropdown(elements.txCategory, 'expense');
    populateFilterCategories();
    renderAll();
});

/**
 * Sets current month display and default date input to today
 */
function initDateDefaults() {
    const today = new Date();
    const uzbekMonths = [
        "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
        "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ];
    elements.currentMonthYearText.textContent = `${uzbekMonths[today.getMonth()]} ${today.getFullYear()}`;

    // Format YYYY-MM-DD
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    elements.txDate.value = `${yyyy}-${mm}-${dd}`;
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
            // Initialize default budgets
            state.budgets = {};
            EXPENSE_CATEGORIES.forEach(cat => {
                state.budgets[cat.name] = cat.defaultBudget;
            });
            saveBudgetsToStorage();
        }
    } catch (e) {
        console.error("Storage loading error:", e);
        state.transactions = [];
        state.budgets = {};
    }
}

function saveTransactionsToStorage() {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(state.transactions));
}

function saveBudgetsToStorage() {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(state.budgets));
}

// ============================================================================
// EVENT LISTENERS SETUP
// ============================================================================
function setupEventListeners() {
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

    // Filters
    elements.searchFilter.addEventListener('input', renderTransactionsList);
    elements.typeFilter.addEventListener('change', renderTransactionsList);
    elements.categoryFilter.addEventListener('change', renderTransactionsList);

    // Budget Modal open/close
    elements.openBudgetModalBtn.addEventListener('click', openBudgetModal);
    elements.openBudgetModalBtn2.addEventListener('click', openBudgetModal);
    elements.closeBudgetModalBtn.addEventListener('click', closeBudgetModal);
    elements.cancelBudgetBtn.addEventListener('click', closeBudgetModal);
    elements.budgetSettingsForm.addEventListener('submit', handleSaveBudgets);

    // Edit Modal close
    elements.closeEditModalBtn.addEventListener('click', closeEditModal);
    elements.cancelEditBtn.addEventListener('click', closeEditModal);

    // Close modals when clicking backdrop
    elements.editModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.editModalOverlay) closeEditModal();
    });
    elements.budgetModalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.budgetModalOverlay) closeBudgetModal();
    });

    // Quick seed demo & Reset buttons
    elements.seedDataBtn.addEventListener('click', () => {
        seedInitialDemoData();
        showToast("Namunaviy ma'lumotlar muvaffaqiyatli yuklandi!", "success");
    });

    elements.resetDataBtn.addEventListener('click', () => {
        if (confirm("Rostdan ham barcha ma'lumotlarni o'chirib tashlamoqchimisiz?")) {
            state.transactions = [];
            saveTransactionsToStorage();
            renderAll();
            showToast("Barcha operatsiyalar o'chirildi.", "info");
        }
    });

    // Delegated click handler for edit & delete buttons
    elements.transactionsList.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit');
        if (editBtn) {
            const id = editBtn.getAttribute('data-id');
            if (id) openEditModal(id);
            return;
        }
        const delBtn = e.target.closest('.btn-delete');
        if (delBtn) {
            const id = delBtn.getAttribute('data-id');
            if (id) deleteTransaction(id);
            return;
        }
    });

    // Quick amount chips for main form
    document.querySelectorAll('#quickAmountsContainer .quick-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const val = parseFloat(chip.getAttribute('data-val'));
            const current = parseFloat(elements.txAmount.value) || 0;
            elements.txAmount.value = current + val;
            elements.txAmount.focus();
        });
    });

    // Quick amount chips for edit form
    document.querySelectorAll('#editQuickAmountsContainer .edit-quick-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const val = parseFloat(chip.getAttribute('data-val'));
            const current = parseFloat(elements.editTxAmount.value) || 0;
            elements.editTxAmount.value = current + val;
            elements.editTxAmount.focus();
        });
    });

    // Setup mobile quick jump navigation
    initQuickScrollNav();
}

// ============================================================================
// MOBILE QUICK JUMP SCROLL SYSTEM
// ============================================================================
function scrollToCard(cardId) {
    const el = document.getElementById(cardId);
    if (!el) return;

    // Highlight clicked pill
    document.querySelectorAll('.quick-nav-pill').forEach(pill => {
        pill.classList.remove('active');
        if (pill.getAttribute('onclick') && pill.getAttribute('onclick').includes(cardId)) {
            pill.classList.add('active');
        }
    });

    const offset = 70; // Header offset
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
    });
}

function initQuickScrollNav() {
    const cards = [
        { id: 'statsGrid', pillText: 'Balans' },
        { id: 'formCard', pillText: 'Kiritish' },
        { id: 'historyCard', pillText: 'Tarix' },
        { id: 'budgetCard', pillText: 'Byudjet' },
        { id: 'chartCard', pillText: 'Tahlil' }
    ];

    // Scroll spy to highlight active pill
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        let currentCard = 'statsGrid';

        cards.forEach(c => {
            const el = document.getElementById(c.id);
            if (el) {
                const top = el.offsetTop - 120;
                if (scrollY >= top) {
                    currentCard = c.id;
                }
            }
        });

        document.querySelectorAll('.quick-nav-pill').forEach(pill => {
            if (pill.getAttribute('onclick') && pill.getAttribute('onclick').includes(currentCard)) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    }, { passive: true });
}

window.scrollToCard = scrollToCard;

// ============================================================================
// CATEGORY UTILS
// ============================================================================
function getCategoryMeta(categoryName, type) {
    const list = (type === 'income') ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    let found = list.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    if (!found) {
        // Fallback search across both
        found = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    }
    return found || { name: categoryName, icon: "fa-tag", color: "#64748b" };
}

function populateCategoryDropdown(selectElement, type, selectedValue = '') {
    selectElement.innerHTML = '';
    const list = (type === 'income') ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    list.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        if (cat.name === selectedValue) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    });
}

function populateFilterCategories() {
    elements.categoryFilter.innerHTML = '<option value="all">Barcha kategoriyalar</option>';
    const allCategories = new Set([
        ...EXPENSE_CATEGORIES.map(c => c.name),
        ...INCOME_CATEGORIES.map(c => c.name)
    ]);
    allCategories.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        elements.categoryFilter.appendChild(option);
    });
}

// ============================================================================
// CRUD OPERATIONS (CREATE, READ, UPDATE, DELETE)
// ============================================================================
function handleAddTransaction(e) {
    e.preventDefault();

    const selectedType = document.querySelector('input[name="txType"]:checked').value;
    const amount = parseFloat(elements.txAmount.value);
    const category = elements.txCategory.value;
    const date = elements.txDate.value;
    const description = elements.txDescription.value.trim();

    if (!amount || amount <= 0 || !category || !date || !description) {
        showToast("Iltimos, barcha maydonlarni to'g'ri to'ldiring!", "warning");
        return;
    }

    const newTx = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        type: selectedType,
        amount: amount,
        category: category,
        date: date,
        description: description,
        createdAt: new Date().toISOString()
    };

    state.transactions.unshift(newTx);
    saveTransactionsToStorage();

    // Reset input fields but keep date as today
    elements.txAmount.value = '';
    elements.txDescription.value = '';
    elements.txAmount.focus();

    renderAll();
    showToast("Operatsiya muvaffaqiyatli saqlandi!", "success");

    // Check budget limits for this category if expense
    if (selectedType === 'expense') {
        checkBudgetAlert(category);
    }

    // Smoothly scroll to transactions list on mobile
    if (window.innerWidth <= 768) {
        scrollToCard('historyCard');
    }
}

function openEditModal(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    elements.editTxId.value = tx.id;
    elements.editTxAmount.value = tx.amount;
    elements.editTxDate.value = tx.date;
    elements.editTxDescription.value = tx.description;

    // Set radio
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

    populateCategoryDropdown(elements.editTxCategory, tx.type, tx.category);
    elements.editModalOverlay.classList.add('active');
}

function closeEditModal() {
    elements.editModalOverlay.classList.remove('active');
}

function handleSaveEditedTransaction(e) {
    e.preventDefault();

    const id = elements.editTxId.value;
    const txIndex = state.transactions.findIndex(t => t.id === id);
    if (txIndex === -1) return;

    const selectedType = document.querySelector('input[name="editTxType"]:checked').value;
    const amount = parseFloat(elements.editTxAmount.value);
    const category = elements.editTxCategory.value;
    const date = elements.editTxDate.value;
    const description = elements.editTxDescription.value.trim();

    if (!amount || amount <= 0 || !category || !date || !description) {
        showToast("Iltimos, ma'lumotlarni to'liq kiriting!", "warning");
        return;
    }

    state.transactions[txIndex] = {
        ...state.transactions[txIndex],
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

function deleteTransaction(id) {
    const tx = state.transactions.find(t => t.id === id);
    if (!tx) return;

    if (confirm(`"${tx.description}" operatsiyasini o'chirishni xohlaysizmi?`)) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveTransactionsToStorage();
        renderAll();
        showToast("Operatsiya o'chirildi.", "info");
    }
}

// ============================================================================
// BUDGET LIMITS & NOTIFICATIONS LOGIC
// ============================================================================
/**
 * Checks budget threshold for a specific category and displays appropriate alert toast
 */
function checkBudgetAlert(categoryName) {
    const limit = state.budgets[categoryName];
    if (!limit || limit <= 0) return;

    const spent = calculateSpentForCategory(categoryName);
    const percentage = (spent / limit) * 100;

    if (percentage >= 100) {
        showToast(
            `Xavf: "${categoryName}" bo'yicha belgilangan limit to'ldi yoki oshib ketdi! (${Math.round(percentage)}%)`,
            "danger",
            6000
        );
    } else if (percentage >= 80) {
        showToast(
            `Diqqat: "${categoryName}" byudjeti 80% dan oshdi! (${Math.round(percentage)}%)`,
            "warning",
            5000
        );
    }
}

/**
 * Calculates current month spent amount for a category
 */
function calculateSpentForCategory(categoryName) {
    const currentYearMonth = getCurrentYearMonth();
    return state.transactions
        .filter(t => t.type === 'expense' && t.category === categoryName && t.date.startsWith(currentYearMonth))
        .reduce((sum, t) => sum + t.amount, 0);
}

function getCurrentYearMonth() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    return `${yyyy}-${mm}`;
}

// Budget Modal Handlers
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
                <input type="number" name="budget_${cat.name}" value="${currentLimit}" min="0" step="50000" required>
                <span class="input-currency">UZS</span>
            </div>
        `;
        elements.budgetInputsContainer.appendChild(group);
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
        const val = parseFloat(formData.get(`budget_${cat.name}`));
        state.budgets[cat.name] = isNaN(val) ? 0 : val;
    });

    saveBudgetsToStorage();
    closeBudgetModal();
    renderBudgetSection();
    renderDashboardStats();
    showToast("Byudjet limitlari yangilandi!", "success");
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================
function renderAll() {
    renderDashboardStats();
    renderTransactionsList();
    renderBudgetSection();
    renderExpenseChart();
}

/**
 * Renders Top KPI Cards (Balance, Income, Expense, Overall Budget)
 */
function renderDashboardStats() {
    let totalInc = 0;
    let totalExp = 0;
    let incCount = 0;
    let expCount = 0;

    state.transactions.forEach(t => {
        if (t.type === 'income') {
            totalInc += t.amount;
            incCount++;
        } else {
            totalExp += t.amount;
            expCount++;
        }
    });

    const netBalance = totalInc - totalExp;

    // Balance display
    elements.totalBalance.textContent = formatCurrency(netBalance);
    if (netBalance > 0) {
        elements.totalBalance.className = "card-value text-success";
        elements.balanceStatus.innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> Musbat balans`;
    } else if (netBalance < 0) {
        elements.totalBalance.className = "card-value text-danger";
        elements.balanceStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Kamomad mavjud`;
    } else {
        elements.totalBalance.className = "card-value";
        elements.balanceStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Balans 0 so'm`;
    }

    elements.totalIncome.textContent = `+${formatCurrency(totalInc)}`;
    elements.incomeCount.innerHTML = `<i class="fa-solid fa-plus"></i> ${incCount} ta daromad`;

    elements.totalExpense.textContent = `-${formatCurrency(totalExp)}`;
    elements.expenseCount.innerHTML = `<i class="fa-solid fa-minus"></i> ${expCount} ta xarajat`;

    // Overall current month budget calculation
    const currentYM = getCurrentYearMonth();
    let currentMonthExpense = 0;
    state.transactions.forEach(t => {
        if (t.type === 'expense' && t.date.startsWith(currentYM)) {
            currentMonthExpense += t.amount;
        }
    });

    let totalMonthlyLimit = 0;
    EXPENSE_CATEGORIES.forEach(cat => {
        totalMonthlyLimit += (state.budgets[cat.name] || 0);
    });

    if (totalMonthlyLimit > 0) {
        const overallPercent = Math.round((currentMonthExpense / totalMonthlyLimit) * 100);
        elements.overallBudgetPercent.textContent = `${overallPercent}%`;
        elements.overallBudgetRemaining.textContent = `${formatCurrency(currentMonthExpense)} / ${formatCurrency(totalMonthlyLimit)}`;
        
        if (overallPercent >= 100) {
            elements.overallBudgetPercent.className = "card-value text-danger";
        } else if (overallPercent >= 80) {
            elements.overallBudgetPercent.className = "card-value text-warning";
        } else {
            elements.overallBudgetPercent.className = "card-value text-success";
        }
    } else {
        elements.overallBudgetPercent.textContent = `0%`;
        elements.overallBudgetRemaining.textContent = `Limit belgilanmagan`;
    }
}

/**
 * Renders Filtered Transactions in Left Column
 */
function renderTransactionsList() {
    const searchTerm = elements.searchFilter.value.trim().toLowerCase();
    const typeTerm = elements.typeFilter.value;
    const catTerm = elements.categoryFilter.value;

    const filtered = state.transactions.filter(t => {
        // Search text match
        const matchesSearch = !searchTerm ||
            t.description.toLowerCase().includes(searchTerm) ||
            t.category.toLowerCase().includes(searchTerm) ||
            t.amount.toString().includes(searchTerm);

        // Type match
        const matchesType = (typeTerm === 'all') || (t.type === typeTerm);

        // Category match
        const matchesCat = (catTerm === 'all') || (t.category === catTerm);

        return matchesSearch && matchesType && matchesCat;
    });

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    elements.txFilteredCount.textContent = `${filtered.length} ta`;
    elements.transactionsList.innerHTML = '';

    if (filtered.length === 0) {
        elements.emptyState.style.display = 'flex';
        const h4 = elements.emptyState.querySelector('h4');
        const p = elements.emptyState.querySelector('p');
        if (state.transactions.length > 0) {
            if (h4) h4.textContent = "Mos keluvchi operatsiyalar topilmadi";
            if (p) p.textContent = "Qidiruv so'zini yoki filtrlarni o'zgartirib ko'ring.";
        } else {
            if (h4) h4.textContent = "Hozircha operatsiyalar yo'q";
            if (p) p.textContent = "Yangi xarajat yoki daromad qo'shing yoki namuna yuklang.";
        }
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
                <div class="tx-cat-icon" style="background: ${meta.color}22; color: ${meta.color}; border: 1px solid ${meta.color}44;">
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
 * Renders Budget Progress Bars according to specified percentages and colors:
 * 0–79%: Green (bar-success)
 * 80–99%: Yellow (bar-warning)
 * 100%+: Red (bar-danger)
 */
function renderBudgetSection() {
    elements.budgetList.innerHTML = '';

    EXPENSE_CATEGORIES.forEach(cat => {
        const limit = state.budgets[cat.name] || 0;
        const spent = calculateSpentForCategory(cat.name);
        const percentage = limit > 0 ? (spent / limit) * 100 : 0;
        const roundedPercent = Math.round(percentage);

        // Determine styles based on requirements:
        // 0–79%: green
        // 80–99%: yellow/warning
        // >= 100%: red
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
 * Chart.js Integration for Category Expense Distribution
 */
function renderExpenseChart() {
    if (typeof Chart === 'undefined') {
        elements.emptyChart.style.display = 'flex';
        elements.expenseChartCanvas.style.display = 'none';
        return;
    }

    const currentYM = getCurrentYearMonth();
    let currentExpenses = state.transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentYM));
    let isCurrentMonth = true;

    if (currentExpenses.length === 0) {
        currentExpenses = state.transactions.filter(t => t.type === 'expense');
        isCurrentMonth = false;
    }

    // Aggregate by category
    const categoryTotals = {};
    let totalExpChart = 0;

    EXPENSE_CATEGORIES.forEach(cat => {
        categoryTotals[cat.name] = 0;
    });

    currentExpenses.forEach(tx => {
        if (!categoryTotals[tx.category]) {
            categoryTotals[tx.category] = 0;
        }
        categoryTotals[tx.category] += tx.amount;
        totalExpChart += tx.amount;
    });

    elements.chartExpenseTotal.textContent = isCurrentMonth
        ? `Oylik: ${formatCurrency(totalExpChart)}`
        : `Jami: ${formatCurrency(totalExpChart)}`;

    const labels = [];
    const dataValues = [];
    const backgroundColors = [];

    EXPENSE_CATEGORIES.forEach(cat => {
        const sum = categoryTotals[cat.name] || 0;
        if (sum > 0) {
            labels.push(cat.name);
            dataValues.push(sum);
            backgroundColors.push(cat.color);
        }
    });

    // Check if empty
    if (dataValues.length === 0) {
        if (state.chartInstance) {
            state.chartInstance.destroy();
            state.chartInstance = null;
        }
        elements.emptyChart.style.display = 'flex';
        elements.expenseChartCanvas.style.display = 'none';
        return;
    }

    elements.emptyChart.style.display = 'none';
    elements.expenseChartCanvas.style.display = 'block';

    if (state.chartInstance) {
        state.chartInstance.destroy();
    }

    const ctx = elements.expenseChartCanvas.getContext('2d');
    state.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#131c31',
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '500' },
                        boxWidth: 12,
                        padding: 14
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const val = context.parsed;
                            const pct = totalExpChart > 0 ? Math.round((val / totalExpChart) * 100) : 0;
                            return ` ${context.label}: ${formatCurrency(val)} (${pct}%)`;
                        }
                    }
                }
            },
            cutout: '68%',
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 800
            }
        }
    });
}

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================
function showToast(message, type = 'info', duration = 4500) {
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
        setTimeout(() => toast.remove(), 300);
    };

    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, duration);

    elements.toastContainer.appendChild(toast);
}

// ============================================================================
// HELPER / UTILITY FUNCTIONS
// ============================================================================
function formatCurrency(num) {
    if (isNaN(num)) return '0 so\'m';
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
}

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
// INITIAL DEMO DATA SEEDING
// ============================================================================
function seedInitialDemoData() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');

    // Create realistic initial transactions showing different budget states
    state.transactions = [
        {
            id: 'tx_seed_1',
            type: 'income',
            amount: 8500000,
            category: 'Oylik maosh',
            date: `${yyyy}-${mm}-05`,
            description: 'Asosiy oylik maosh to\'lovi'
        },
        {
            id: 'tx_seed_2',
            type: 'income',
            amount: 1200000,
            category: 'Frilans',
            date: `${yyyy}-${mm}-12`,
            description: 'Veb-sayt dizayni loyihasi'
        },
        {
            id: 'tx_seed_3',
            type: 'expense',
            amount: 1750000, // 87.5% of 2 000 000 (shows yellow warning!)
            category: 'Oziq-ovqat',
            date: `${yyyy}-${mm}-10`,
            description: 'Oylik yirik bozorlik (Korzinka)'
        },
        {
            id: 'tx_seed_4',
            type: 'expense',
            amount: 320000, // 53% of 600 000 (green)
            category: 'Transport',
            date: `${yyyy}-${mm}-15`,
            description: 'Avtomobil yoqilg\'isi (Benzin)'
        },
        {
            id: 'tx_seed_5',
            type: 'expense',
            amount: 540000, // 77% of 700 000 (green)
            category: 'Kommunal',
            date: `${yyyy}-${mm}-18`,
            description: 'Elektr energiyasi va gaz to\'lovi'
        },
        {
            id: 'tx_seed_6',
            type: 'expense',
            amount: 420000, // 84% of 500 000 (yellow warning)
            category: 'Ko\'ngilochar',
            date: `${yyyy}-${mm}-22`,
            description: 'Kino va do\'stlar bilan kechki ovqat'
        }
    ];

    saveTransactionsToStorage();
    renderAll();
}

// Make openEditModal and deleteTransaction accessible to inline onclick
window.openEditModal = openEditModal;
window.deleteTransaction = deleteTransaction;
