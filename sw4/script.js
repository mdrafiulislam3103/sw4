// ===== GLOBAL DATA =====
let currentUser = null;
let currentView = 'public'; // 'public', 'user', 'admin'

// Users Data
let users = JSON.parse(localStorage.getItem('axcrypto_users')) || [
    { id: 1, name: "John Doe", email: "john@example.com", mobile: "01712345678", wallet: 1250.50, role: "user", status: "active", password: "password123" },
    { id: 2, name: "Sarah Smith", email: "sarah@example.com", mobile: "01812345678", wallet: 540.00, role: "user", status: "active", password: "password123" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", mobile: "01912345678", wallet: 0, role: "user", status: "pending", password: "password123" },
    { id: 4, name: "Admin User", email: "admin@axcrypto.com", mobile: "01612345678", wallet: 3250.75, role: "admin", status: "active", password: "admin123" }
];

let pendingRequests = JSON.parse(localStorage.getItem('axcrypto_requests')) || [
    { 
        id: 1, 
        userId: 3, 
        type: "seller_application", 
        amount: 150000, 
        status: "pending",
        details: "New seller application with all documents submitted",
        submittedAt: "2024-01-25 10:30:00"
    },
    { 
        id: 2, 
        userId: 1, 
        type: "buy_request", 
        amount: 500, 
        status: "pending",
        details: "Buy 500 USDT via bKash",
        submittedAt: "2024-01-25 11:15:00"
    }
];

let transactions = JSON.parse(localStorage.getItem('axcrypto_transactions')) || [
    { id: 1, userId: 1, type: "credit", amount: 100, status: "completed", date: "2024-01-25 10:00:00", approvedBy: "Admin", notes: "Welcome bonus" },
    { id: 2, userId: 2, type: "debit", amount: 50, status: "completed", date: "2024-01-25 09:30:00", approvedBy: "Admin", notes: "Withdrawal" },
    { id: 3, userId: 1, type: "credit", amount: 500, status: "completed", date: "2024-01-25 08:15:00", approvedBy: "Admin", notes: "Buy order approved" }
];

// Save data to localStorage
function saveData() {
    localStorage.setItem('axcrypto_users', JSON.stringify(users));
    localStorage.setItem('axcrypto_requests', JSON.stringify(pendingRequests));
    localStorage.setItem('axcrypto_transactions', JSON.stringify(transactions));
}

// ===== VIEW MANAGEMENT =====
function showPublicWebsite() {
    document.getElementById('public-website').classList.remove('hidden');
    document.getElementById('user-dashboard').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    currentView = 'public';
    document.body.style.overflow = 'auto';
    hideMobileMenu();
}

function showUserDashboard() {
    document.getElementById('public-website').classList.add('hidden');
    document.getElementById('user-dashboard').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    currentView = 'user';
    loadUserDashboard();
    hideMobileMenu();
}

function showAdminDashboard() {
    document.getElementById('public-website').classList.add('hidden');
    document.getElementById('user-dashboard').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    currentView = 'admin';
    loadAdminDashboard();
    hideMobileMenu();
}

function showPublicSection(sectionId) {
    const element = document.getElementById(sectionId + '-section');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
    hideMobileMenu();
}

function showUserSection(sectionId) {
    document.querySelectorAll('#user-content > div').forEach(div => {
        div.classList.add('hidden');
    });
    document.getElementById('user-' + sectionId).classList.remove('hidden');
    
    document.querySelectorAll('#user-dashboard .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navItem = Array.from(document.querySelectorAll('#user-dashboard .nav-item')).find(item => 
        item.textContent.includes(sectionId.charAt(0).toUpperCase() + sectionId.slice(1)) || 
        (sectionId === 'overview' && item.textContent.includes('Overview'))
    );
    if (navItem) navItem.classList.add('active');
}

function showAdminSection(sectionId) {
    document.querySelectorAll('#admin-content > div').forEach(div => {
        div.classList.add('hidden');
    });
    document.getElementById('admin-' + sectionId).classList.remove('hidden');
    
    document.querySelectorAll('#admin-dashboard .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const navItem = Array.from(document.querySelectorAll('#admin-dashboard .nav-item')).find(item => 
        item.textContent.includes(sectionId.charAt(0).toUpperCase() + sectionId.slice(1)) || 
        (sectionId === 'overview' && item.textContent.includes('Dashboard'))
    );
    if (navItem) navItem.classList.add('active');
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

function hideMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('active');
}

// ===== AUTHENTICATION =====
function showLoginModal() {
    switchAuthTab('login');
    showModal('loginModal');
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    
    const tabElement = Array.from(document.querySelectorAll('.auth-tab')).find(t => 
        t.textContent.includes(tab === 'login' ? 'Login' : 'Register')
    );
    const formElement = document.getElementById(tab === 'login' ? 'loginForm' : 'registerForm');
    
    if (tabElement) tabElement.classList.add('active');
    if (formElement) formElement.classList.add('active');
}

// Login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const emailPhone = this.querySelector('input[type="text"]').value;
    const password = this.querySelector('input[type="password"]').value;
    
    const user = users.find(u => 
        (u.email === emailPhone || u.mobile === emailPhone) && u.password === password
    );
    
    if (user) {
        if (user.status !== 'active') {
            showNotification('Your account is not active. Please contact support.', 'error');
            return;
        }
        
        currentUser = user;
        hideModal('loginModal');
        if (user.role === 'admin') {
            showAdminDashboard();
            showNotification(`Welcome back, Admin ${user.name}!`);
        } else {
            showUserDashboard();
            showNotification(`Welcome back, ${user.name}!`);
        }
    } else {
        showNotification('Invalid email/phone or password!', 'error');
    }
});

// Register form submission
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = this.querySelector('input[placeholder="Enter full name"]').value;
    const email = this.querySelector('input[type="email"]').value;
    const phone = this.querySelector('input[type="tel"]').value;
    const password = this.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
    
    if (!name || !email || !phone || !password) {
        showNotification('Please fill all fields!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    if (users.some(u => u.email === email)) {
        showNotification('Email already registered!', 'error');
        return;
    }
    
    if (users.some(u => u.mobile === phone)) {
        showNotification('Phone number already registered!', 'error');
        return;
    }
    
    const newUser = {
        id: users.length + 1,
        name: name,
        email: email,
        mobile: phone,
        wallet: 0,
        role: 'user',
        status: 'active',
        password: password
    };
    
    users.push(newUser);
    currentUser = newUser;
    saveData();
    
    hideModal('loginModal');
    showUserDashboard();
    showNotification(`Account created successfully! Welcome to axcrypto, ${name}!`);
    
    this.reset();
});

function logout() {
    currentUser = null;
    currentView = 'public';
    showPublicWebsite();
    showNotification('Successfully logged out');
}

// ===== MODAL FUNCTIONS =====
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showBuyModal() {
    if (currentUser) {
        showUserSection('buy');
    } else {
        showModal('buyModal');
    }
}

function showSellerModal() {
    if (currentUser) {
        showUserSection('sell');
    } else {
        showModal('sellerModal');
    }
}

function showAdminAddFundsModal() {
    showModal('adminAddFundsModal');
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    
    text.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('active');
    
    setTimeout(() => {
        notification.classList.remove('active');
    }, 5000);
}

// ===== DASHBOARD LOADING =====
function loadUserDashboard() {
    if (!currentUser) return;
    
    document.getElementById('userWalletBalance').textContent = `$${currentUser.wallet.toFixed(2)}`;
    document.getElementById('userMainBalance').textContent = `$${currentUser.wallet.toFixed(2)}`;
    
    const userTransactions = transactions.filter(t => t.userId === currentUser.id);
    const tableBody = document.getElementById('userTransactionsTable');
    tableBody.innerHTML = '';
    
    userTransactions.slice(0, 5).forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td>${transaction.notes}</td>
            <td style="color: ${transaction.type === 'credit' ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
                ${transaction.type === 'credit' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </td>
            <td><span class="status ${transaction.status}">${transaction.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
    
    const userPending = pendingRequests.filter(r => r.userId === currentUser.id);
    const pendingBody = document.getElementById('userPendingRequestsTable');
    pendingBody.innerHTML = '';
    
    if (userPending.length === 0) {
        pendingBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-secondary); padding: 40px;">
                    No pending requests
                </td>
            </tr>
        `;
    } else {
        userPending.forEach(request => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${getRequestTypeLabel(request.type)}</td>
                <td style="font-weight: 600;">$${request.amount.toLocaleString()}</td>
                <td style="color: var(--text-secondary);">${new Date(request.submittedAt).toLocaleDateString()}</td>
                <td><span class="status pending">${request.status}</span></td>
            `;
            pendingBody.appendChild(row);
        });
    }
    
    const fullHistoryBody = document.getElementById('userFullHistoryTable');
    fullHistoryBody.innerHTML = '';
    userTransactions.forEach(transaction => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleString()}</td>
            <td>${transaction.type === 'credit' ? 'Deposit' : 'Withdrawal'}</td>
            <td style="color: ${transaction.type === 'credit' ? 'var(--success)' : 'var(--danger)'}; font-weight: 600;">
                ${transaction.type === 'credit' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </td>
            <td><span class="status ${transaction.status}">${transaction.status}</span></td>
            <td>${transaction.notes}</td>
        `;
        fullHistoryBody.appendChild(row);
    });
}

function loadAdminDashboard() {
    document.getElementById('adminPendingStats').textContent = pendingRequests.length;
    document.getElementById('adminPendingCount').textContent = pendingRequests.length;
    document.getElementById('adminTotalStats').textContent = users.length;
    
    const tableBody = document.getElementById('adminRequestsTable');
    tableBody.innerHTML = '';
    
    pendingRequests.forEach(request => {
        const user = users.find(u => u.id === request.userId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 600;
                    ">${user.name.charAt(0)}</div>
                    <div>
                        <div style="font-weight: 600;">${user.name}</div>
                        <div style="font-size: 12px; color: var(--text-secondary);">${user.mobile}</div>
                    </div>
                </div>
            </td>
            <td>${getRequestTypeLabel(request.type)}</td>
            <td style="font-weight: 600;">$${request.amount.toLocaleString()}</td>
            <td><span class="status pending">Pending</span></td>
            <td>
                <input type="number" style="
                    width: 100px;
                    padding: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--dark-border);
                    border-radius: 6px;
                    color: var(--text-primary);
                    text-align: center;
                " value="${getDefaultCreditAmount(request.type)}">
            </td>
            <td>
                <button class="action-btn btn-view" onclick="adminViewRequest(${request.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="action-btn btn-approve" onclick="adminApproveRequestFromTable(${request.id})">
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="action-btn btn-reject" onclick="adminRejectRequestFromTable(${request.id})">
                    <i class="fas fa-times"></i> Reject
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    const transBody = document.getElementById('adminTransactionsTable');
    transBody.innerHTML = '';
    
    transactions.slice(0, 10).forEach(transaction => {
        const user = users.find(u => u.id === transaction.userId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>TX${transaction.id.toString().padStart(6, '0')}</td>
            <td style="font-weight: 600; color: ${transaction.type === 'credit' ? 'var(--success)' : 'var(--danger)'}">
                ${transaction.type === 'credit' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </td>
            <td>${transaction.type === 'credit' ? 'Wallet Credit' : 'Withdrawal'}</td>
            <td><span class="status ${transaction.status}">${transaction.status}</span></td>
            <td style="color: var(--text-secondary);">${new Date(transaction.date).toLocaleString()}</td>
            <td>${transaction.approvedBy}</td>
        `;
        transBody.appendChild(row);
    });
    
    const usersBody = document.getElementById('adminUsersTable');
    usersBody.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="
                        width: 30px;
                        height: 30px;
                        background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 600;
                        font-size: 12px;
                    ">${user.name.charAt(0)}</div>
                    ${user.name}
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.mobile}</td>
            <td>$${user.wallet.toFixed(2)}</td>
            <td><span class="status ${user.status}">${user.status}</span></td>
            <td>
                <button class="action-btn btn-view" onclick="adminViewUser(${user.id})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        usersBody.appendChild(row);
    });
    
    const select = document.getElementById('adminUserSelect');
    select.innerHTML = '<option value="">Select a user</option>';
    users.forEach(user => {
        if (user.role === 'user') {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.name} (${user.mobile}) - Current: $${user.wallet.toFixed(2)}`;
            select.appendChild(option);
        }
    });
}

// ===== HELPER FUNCTIONS =====
function getRequestTypeLabel(type) {
    const labels = {
        'seller_application': 'Seller Application',
        'buy_request': 'Buy Request',
        'withdrawal': 'Withdrawal Request'
    };
    return labels[type] || type;
}

function getDefaultCreditAmount(type) {
    const defaults = {
        'seller_application': 10,
        'buy_request': 0,
        'withdrawal': 0
    };
    return defaults[type] || 10;
}

// ===== ADMIN FUNCTIONS =====
let currentRequestId = null;

function adminViewRequest(requestId) {
    currentRequestId = requestId;
    const request = pendingRequests.find(r => r.id === requestId);
    const user = users.find(u => u.id === request.userId);
    
    let detailsHtml = `
        <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="margin-bottom: 15px; color: var(--primary);">${getRequestTypeLabel(request.type)}</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <div style="font-size: 12px; color: var(--text-secondary);">User</div>
                    <div style="font-weight: 600;">${user.name}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Mobile</div>
                    <div style="font-weight: 600;">${user.mobile}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Current Wallet</div>
                    <div style="font-weight: 600; color: var(--success);">$${user.wallet.toFixed(2)}</div>
                </div>
                <div>
                    <div style="font-size: 12px; color: var(--text-secondary);">Request Amount</div>
                    <div style="font-weight: 600;">$${request.amount.toLocaleString()}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="font-size: 12px; color: var(--text-secondary);">Details</div>
                <div>${request.details}</div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <div style="font-size: 12px; color: var(--text-secondary);">Submitted At</div>
                <div>${new Date(request.submittedAt).toLocaleString()}</div>
            </div>
        </div>
    `;
    
    document.getElementById('requestDetails').innerHTML = detailsHtml;
    document.getElementById('creditAmount').value = getDefaultCreditAmount(request.type);
    showModal('viewRequestModal');
}

function adminApproveRequest() {
    const request = pendingRequests.find(r => r.id === currentRequestId);
    const user = users.find(u => u.id === request.userId);
    const creditAmount = parseFloat(document.getElementById('creditAmount').value) || getDefaultCreditAmount(request.type);
    
    pendingRequests = pendingRequests.filter(r => r.id !== currentRequestId);
    user.wallet += creditAmount;
    
    transactions.unshift({
        id: transactions.length + 1,
        userId: user.id,
        type: "credit",
        amount: creditAmount,
        status: "completed",
        date: new Date().toISOString().replace('T', ' ').substr(0, 19),
        approvedBy: currentUser.name,
        notes: `Approved ${getRequestTypeLabel(request.type)}`
    });
    
    saveData();
    loadAdminDashboard();
    hideModal('viewRequestModal');
    showNotification(`Request approved! $${creditAmount.toFixed(2)} credited to ${user.name}'s wallet`);
    
    currentRequestId = null;
}

function adminRejectRequest() {
    const request = pendingRequests.find(r => r.id === currentRequestId);
    const user = users.find(u => u.id === request.userId);
    
    pendingRequests = pendingRequests.filter(r => r.id !== currentRequestId);
    
    transactions.unshift({
        id: transactions.length + 1,
        userId: user.id,
        type: "debit",
        amount: 0,
        status: "rejected",
        date: new Date().toISOString().replace('T', ' ').substr(0, 19),
        approvedBy: currentUser.name,
        notes: `Rejected ${getRequestTypeLabel(request.type)}`
    });
    
    saveData();
    loadAdminDashboard();
    hideModal('viewRequestModal');
    showNotification(`Request rejected for ${user.name}`);
    
    currentRequestId = null;
}

function adminApproveRequestFromTable(requestId) {
    const request = pendingRequests.find(r => r.id === requestId);
    const user = users.find(u => u.id === request.userId);
    const creditAmount = 10;
    
    pendingRequests = pendingRequests.filter(r => r.id !== requestId);
    user.wallet += creditAmount;
    
    transactions.unshift({
        id: transactions.length + 1,
        userId: user.id,
        type: "credit",
        amount: creditAmount,
        status: "completed",
        date: new Date().toISOString().replace('T', ' ').substr(0, 19),
        approvedBy: currentUser.name,
        notes: `Approved ${getRequestTypeLabel(request.type)}`
    });
    
    saveData();
    loadAdminDashboard();
    showNotification(`Request approved! $${creditAmount} credited to ${user.name}'s wallet`);
}

function adminRejectRequestFromTable(requestId) {
    const request = pendingRequests.find(r => r.id === requestId);
    const user = users.find(u => u.id === request.userId);
    
    pendingRequests = pendingRequests.filter(r => r.id !== requestId);
    
    transactions.unshift({
        id: transactions.length + 1,
        userId: user.id,
        type: "debit",
        amount: 0,
        status: "rejected",
        date: new Date().toISOString().replace('T', ' ').substr(0, 19),
        approvedBy: currentUser.name,
        notes: `Rejected ${getRequestTypeLabel(request.type)}`
    });
    
    saveData();
    loadAdminDashboard();
    showNotification(`Request rejected for ${user.name}`);
}

function adminViewUser(userId) {
    const user = users.find(u => u.id === userId);
    document.getElementById('viewUserAvatar').textContent = user.name.charAt(0);
    document.getElementById('viewUserName').textContent = user.name;
    document.getElementById('viewUserEmail').textContent = user.email;
    document.getElementById('viewUserMobile').textContent = user.mobile;
    document.getElementById('viewUserWallet').textContent = `$${user.wallet.toFixed(2)}`;
    document.getElementById('viewUserStatus').innerHTML = `<span class="status ${user.status}">${user.status}</span>`;
    showModal('viewUserModal');
}

function adminAddNewUser() {
    showNotification('Feature: Add New User - Coming Soon!');
}

// ===== FORM HANDLERS =====
document.getElementById('publicBuyForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    hideModal('buyModal');
    if (!currentUser) {
        showNotification('Please login first!', 'error');
        showLoginModal();
        return;
    }
    
    const formData = new FormData(this);
    const amount = parseFloat(formData.get('amount'));
    
    pendingRequests.push({
        id: pendingRequests.length + 1,
        userId: currentUser.id,
        type: "buy_request",
        amount: amount,
        status: "pending",
        details: `Buy ${amount} USDT via ${formData.get('paymentMethod')}`,
        submittedAt: new Date().toISOString().replace('T', ' ').substr(0, 19)
    });
    
    saveData();
    showNotification('Buy request submitted! Admin will review within 30 minutes.');
    this.reset();
});

document.getElementById('publicSellerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    hideModal('sellerModal');
    if (!currentUser) {
        showNotification('Please login first!', 'error');
        showLoginModal();
        return;
    }
    
    const formData = new FormData(this);
    
    pendingRequests.push({
        id: pendingRequests.length + 1,
        userId: currentUser.id,
        type: "seller_application",
        amount: 150000,
        status: "pending",
        details: "Seller application submitted with documents",
        submittedAt: new Date().toISOString().replace('T', ' ').substr(0, 19)
    });
    
    saveData();
    showNotification('Seller application submitted! We will contact you on WhatsApp within 24 hours.');
    this.reset();
});

document.getElementById('userBuyForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const amount = parseFloat(formData.get('amount'));
    
    pendingRequests.push({
        id: pendingRequests.length + 1,
        userId: currentUser.id,
        type: "buy_request",
        amount: amount,
        status: "pending",
        details: `Buy ${amount} USDT via ${formData.get('paymentMethod')}`,
        submittedAt: new Date().toISOString().replace('T', ' ').substr(0, 19)
    });
    
    saveData();
    showNotification('Buy request submitted successfully! Admin will review shortly.');
    this.reset();
});

document.getElementById('userSellerForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const depositAmount = parseFloat(formData.get('depositAmount')) || 150000;
    
    pendingRequests.push({
        id: pendingRequests.length + 1,
        userId: currentUser.id,
        type: "seller_application",
        amount: depositAmount,
        status: "pending",
        details: `Seller application with ${depositAmount} BDT deposit`,
        submittedAt: new Date().toISOString().replace('T', ' ').substr(0, 19)
    });
    
    saveData();
    showNotification('Seller application submitted! We will contact you on WhatsApp for verification.');
    this.reset();
});

document.getElementById('userWithdrawForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const amount = parseFloat(formData.get('amount'));
    
    if (amount > currentUser.wallet) {
        showNotification('Insufficient balance!', 'error');
        return;
    }
    
    pendingRequests.push({
        id: pendingRequests.length + 1,
        userId: currentUser.id,
        type: "withdrawal",
        amount: amount,
        status: "pending",
        details: `Withdraw $${amount} to ${formData.get('accountNumber')} via ${formData.get('paymentMethod')}`,
        submittedAt: new Date().toISOString().replace('T', ' ').substr(0, 19)
    });
    
    saveData();
    showNotification('Withdrawal request submitted! Admin will process within 2-4 hours.');
    this.reset();
});

document.getElementById('adminAddFundsForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const userId = parseInt(document.getElementById('adminUserSelect').value);
    const amount = parseFloat(document.getElementById('adminFundsAmount').value);
    const notes = document.getElementById('adminTransactionNotes').value;
    
    const user = users.find(u => u.id === userId);
    user.wallet += amount;
    
    transactions.unshift({
        id: transactions.length + 1,
        userId: user.id,
        type: "credit",
        amount: amount,
        status: "completed",
        date: new Date().toISOString().replace('T', ' ').substr(0, 19),
        approvedBy: currentUser.name,
        notes: `Manual credit: ${notes}`
    });
    
    saveData();
    loadAdminDashboard();
    hideModal('adminAddFundsModal');
    showNotification(`$${amount.toFixed(2)} added to ${user.name}'s wallet. New balance: $${user.wallet.toFixed(2)}`);
    
    this.reset();
});

document.getElementById('adminSettingsForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    showNotification('Settings saved successfully!');
});

// ===== LIVE PRICE UPDATES =====
function updateCryptoPrices() {
    const cryptos = [
        { id: 'btc', current: 117926.99 },
        { id: 'eth', current: 3647.14 },
        { id: 'bnb', current: 790.52 }
    ];
    
    cryptos.forEach(crypto => {
        const change = (Math.random() - 0.5) * 2;
        const newPrice = crypto.current * (1 + change / 100);
        const changePercent = change.toFixed(2);
        
        const priceElement = document.getElementById(`${crypto.id}Price`);
        const changeElement = document.getElementById(`${crypto.id}Change`);
        
        if (priceElement && changeElement) {
            priceElement.textContent = `$${newPrice.toFixed(2)}`;
            changeElement.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent}%`;
            changeElement.className = `crypto-change ${changePercent >= 0 ? 'positive' : 'negative'}`;
        }
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(this.id);
            }
        });
    });
    
    updateCryptoPrices();
    setInterval(updateCryptoPrices, 10000);
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            hideMobileMenu();
        }
    });
    
    document.querySelectorAll('[onclick*="showModal"]').forEach(element => {
        const onclick = element.getAttribute('onclick');
        const modalMatch = onclick.match(/showModal\('(\w+)'\)/);
        if (modalMatch) {
            const modalId = modalMatch[1];
            if (!document.getElementById(modalId)) {
                element.style.display = 'none';
            }
        }
    });
});