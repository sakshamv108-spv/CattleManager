const USERS_KEY = 'cattle_users';
const DATA_KEY = 'cattle_records';
const SESSION_KEY = 'cattle_session';
const EXPENSE_KEY = 'cattle_expenses';
const TASKS_KEY = 'cattle_tasks';

/* Function finder for
1. getStoredUsers()
2. register()
3. login()
4. logout()
5. toggleAuth(view)
6. switchTab(tabName)
7. getCattleData()
8. saveRecord()
9. renderTable()
10. editRecord(index)
11. deleteRecord(index)
12. clearForm(
13. toggleOffspring() 
14. exportToCSV()
15. updateCharts()
16. checkReminders()
17. showQR(index)
18. closeQR()
19. previewImage(event)
20. runFakePrediction()
21. resetBreed()
22. getExpenses()
23. addExpense()
24. deleteExpense(id)
25. calculateFinancials()
26. printFinancialReport()
27. loadProfileData()
28. updateProfile()
29. getTasks()
30. addTask()
31. toggleTaskStatus(taskId)
32. deleteTask(taskId)
33. renderTasks()
34.loadAdminDashboard()
35. renderAdminStats()
36. renderUserTable()
37. deleteUser(index)
38. viewUserDetail(index)
39. closeUserDetail()
*/

// ----------------------- User inputs -----------------------

function getStoredUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function register() {
    const user = document.getElementById('reg-user').value;
    const phone = document.getElementById('reg-phone').value;
    const addr = document.getElementById('reg-addr').value;
    const pass = document.getElementById('reg-pass').value;

    if (!user || !pass) return alert("Username and Password required");

    const users = getStoredUsers();
    if (users.find(u => u.username === user)) {
        return alert("Username already exists!");
    }

    users.push({ username: user, phone, address: addr, password: pass });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    alert("Account Created! Please Login.");
    toggleAuth('login');
}

function login() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;

    // ---------------------------for Admin Login ---------------------------
    if (user === "admin" && pass === "@123456") {
        localStorage.setItem(SESSION_KEY, "ADMIN_USER");
        loadAdminDashboard();
        return;
    }

    // ---------------------------for Regular User Login---------------------------for 
    const users = getStoredUsers();
    const validUser = users.find(u => u.username === user && u.password === pass);

    if (validUser) {
        localStorage.setItem(SESSION_KEY, user);
        loadDashboard();
    } else {
        alert("Invalid credentials");
    }
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    location.reload();
}

function toggleAuth(view) {
    if (view === 'register') {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    } else {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    }
}

//---------------------------- Check session on load----------------------------
window.onload = () => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
        if (session === "ADMIN_USER") {
            loadAdminDashboard();
        } else {
            loadDashboard();
        }
    }
};

// -------------------------- Dashboard --------------------------

function loadDashboard() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('display-username').innerText = localStorage.getItem(SESSION_KEY);
    renderTable();
    updateCharts();
    checkReminders();
}

function toggleOffspring() {
    const gender = document.getElementById('c-gender').value;
    const offSection = document.getElementById('offspring-section');
    const lacSection = document.getElementById('lactation-section'); // NEW
    const warning = document.getElementById('male-warning');

    if (gender === 'Male') {
        offSection.classList.add('hidden');
        lacSection.classList.add('hidden'); // NEW: Hide Lactation
        warning.classList.remove('hidden');

        // Clear the hidden inputs so male cattle don't accidentally save old data
        document.getElementById('o-tag').value = '';
        document.getElementById('o-dob').value = '';
        document.getElementById('l-start').value = '';
        document.getElementById('l-end').value = '';
        document.getElementById('l-yield').value = '';
    } else {
        offSection.classList.remove('hidden');
        lacSection.classList.remove('hidden'); // NEW: Show Lactation
        warning.classList.add('hidden');
    }
}

function getCattleData() {
    const allData = JSON.parse(localStorage.getItem(DATA_KEY)) || [];
    const currentUser = localStorage.getItem(SESSION_KEY);

    return allData.filter(item => item.owner === currentUser);
}

function saveRecord() {
    const currentUser = localStorage.getItem(SESSION_KEY);
    const editIndex = document.getElementById('edit-index').value;

    // -----------------------------Gathering Data-----------------------------
    const record = {
        owner: currentUser,
        id: document.getElementById('c-id').value,
        breed: document.getElementById('c-breed').value,
        dob: document.getElementById('c-dob').value,
        gender: document.getElementById('c-gender').value,

        vaccine: {
            name: document.getElementById('v-name').value,
            date: document.getElementById('v-date').value
        },
        lactation: {
            start: document.getElementById('l-start').value,
            end: document.getElementById('l-end').value,
            yield: document.getElementById('l-yield').value
        },
        disease: {
            name: document.getElementById('d-name').value,
            date: document.getElementById('d-date').value,
            status: document.getElementById('d-status').value
        },
        offspring: {
            tag: document.getElementById('o-tag').value,
            gender: document.getElementById('o-gender').value,
            dob: document.getElementById('o-dob').value
        }
    };

    let allData = JSON.parse(localStorage.getItem(DATA_KEY)) || [];

    if (editIndex === "-1") {
        //------------------------------ New Record------------------------------
        allData.push(record);
    } else {
        //------------------------------ Update Record------------------------------
        const userItems = allData.filter(i => i.owner === currentUser);
        const globalIndex = allData.indexOf(userItems[editIndex]);
        allData[globalIndex] = record;
    }

    localStorage.setItem(DATA_KEY, JSON.stringify(allData));
    alert("Record Saved Successfully!");
    clearForm();
    renderTable();
    updateCharts();
}

function renderTable() {
    const tbody = document.querySelector('#cattle-table tbody');
    tbody.innerHTML = '';

    // Get all cattle for this user
    const allUserData = getCattleData();

    // Get what the user typed in the search box (converted to lowercase)
    const searchInput = document.getElementById('search-cattle');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    // Loop through all cattle, but pass the ORIGINAL index to keep Edit/Delete buttons accurate
    allUserData.forEach((cow, originalIndex) => {

        // --- SEARCH FILTER LOGIC ---
        // If the search term exists, and it DOES NOT match the ID or Breed, skip this cow!
        if (searchTerm &&
            !cow.id.toLowerCase().includes(searchTerm) &&
            !cow.breed.toLowerCase().includes(searchTerm)) {
            return;
        }

        // --- RENDER ROW ---
        const tr = document.createElement('tr');

        let offDisplay = cow.gender === 'Male' ? 'N/A' : (cow.offspring && cow.offspring.tag ? `${cow.offspring.tag} (${cow.offspring.gender})` : 'None');
        let yieldDisplay = cow.gender === 'Male' ? 'N/A' : (cow.lactation.yield || '0');

        // Clean display for Disease
        let diseaseDisplay = cow.disease.status === 'None'
            ? '<span style="color:var(--primary); font-weight:bold;">Healthy</span>'
            : `${cow.disease.name || '-'} <span style="color:${cow.disease.status === 'Active' ? 'red' : 'green'}">(${cow.disease.status})</span>`;

        tr.innerHTML = `
            <td>${cow.id}</td>
            <td>${cow.breed}</td>
            <td>${cow.gender}</td>
            <td>${cow.vaccine.name || '-'} <br><small>${cow.vaccine.date}</small></td>
            <td>${yieldDisplay}</td>
            <td>${diseaseDisplay}</td>
            <td>${offDisplay}</td>
            <td>
                <i class="fas fa-edit action-icon" onclick="editRecord(${originalIndex})" title="Edit"></i>
                <i class="fas fa-qrcode action-icon" onclick="showQR(${originalIndex})" title="View QR" style="color:var(--dark);"></i>
                <i class="fas fa-trash action-icon" onclick="deleteRecord(${originalIndex})" title="Delete" style="color:red;"></i>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ----------------------------- Edit & Delete cattles -----------------------------

function editRecord(index) {
    const data = getCattleData();
    const cow = data[index];

    // Populate Form
    document.getElementById('edit-index').value = index;
    document.getElementById('c-id').value = cow.id;
    document.getElementById('c-breed').value = cow.breed;
    document.getElementById('c-dob').value = cow.dob;
    document.getElementById('c-gender').value = cow.gender;
    toggleOffspring(); // trigger hide/show logic

    document.getElementById('v-name').value = cow.vaccine.name;
    document.getElementById('v-date').value = cow.vaccine.date;

    document.getElementById('l-start').value = cow.lactation.start;
    document.getElementById('l-end').value = cow.lactation.end;
    document.getElementById('l-yield').value = cow.lactation.yield;

    document.getElementById('d-name').value = cow.disease.name;
    document.getElementById('d-date').value = cow.disease.date;
    document.getElementById('d-status').value = cow.disease.status;

    if (cow.gender !== 'Male') {
        document.getElementById('o-tag').value = cow.offspring.tag;
        document.getElementById('o-gender').value = cow.offspring.gender;
        document.getElementById('o-dob').value = cow.offspring.dob;
    }

    // Scroll to form
    document.querySelector('.dashboard').scrollIntoView({ behavior: 'smooth' });
}

function deleteRecord(index) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    const currentUser = localStorage.getItem(SESSION_KEY);
    let allData = JSON.parse(localStorage.getItem(DATA_KEY)) || [];

    // Find the item in the global array
    const userItems = allData.filter(i => i.owner === currentUser);
    const itemToDelete = userItems[index];

    // Filter out the item
    allData = allData.filter(item => item !== itemToDelete);

    localStorage.setItem(DATA_KEY, JSON.stringify(allData));
    renderTable();
    updateCharts();
}

function clearForm() {
    document.getElementById('cattle-form').reset();
    document.getElementById('edit-index').value = "-1";
    toggleOffspring();
}

function exportToCSV() {
    const data = getCattleData();
    if (data.length === 0) return alert("No data to export!");

    let csvContent = "data:text/csv;charset=utf-8,";
    // Headers
    csvContent += "ID,Breed,DOB,Gender,Vaccine Name,Vaccine Date,Lactation Yield,Disease Name,Disease Status,Offspring Tag\n";

    // Rows
    data.forEach(row => {
        let rowData = [
            row.id,
            row.breed,
            row.dob,
            row.gender,
            row.vaccine.name,
            row.vaccine.date,
            row.lactation.yield,
            row.disease.name,
            row.disease.status,
            row.gender === 'Male' ? 'N/A' : row.offspring.tag
        ].join(",");
        csvContent += rowData + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cattle_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// ------------------------------------ CHARTS LOGIC ------------------------------------
let genderChartInstance = null;
let yieldChartInstance = null;

function updateCharts() {
    const data = getCattleData();

    // 1. Prepare Gender Data
    let maleCount = 0;
    let femaleCount = 0;

    data.forEach(cow => {
        if (cow.gender === 'Male') maleCount++;
        else femaleCount++;
    });

    // 2. Prepare Yield Data (Top 10 High Yielders)
    // Filter cows that have yield data, sort by yield, take top 10
    const yieldData = data
        .filter(cow => cow.lactation.yield && cow.lactation.yield > 0)
        .map(cow => ({ id: cow.id, yield: parseInt(cow.lactation.yield) }));

    const labels = yieldData.map(d => d.id);
    const yields = yieldData.map(d => d.yield);

    // --- RENDER GENDER CHART ---
    const ctx1 = document.getElementById('genderChart').getContext('2d');

    // Destroy old chart if exists to avoid "flicker" or overlay issues
    if (genderChartInstance) genderChartInstance.destroy();

    genderChartInstance = new Chart(ctx1, {
        type: 'doughnut',
        data: {
            labels: ['Male', 'Female'],
            datasets: [{
                data: [maleCount, femaleCount],
                backgroundColor: ['#36A2EB', '#FF6384'], // Blue for Male, Pink for Female
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'Herd Gender Distribution' },
                legend: { position: 'bottom' }
            }
        }
    });

    // --- RENDER YIELD CHART ---
    const ctx2 = document.getElementById('yieldChart').getContext('2d');

    if (yieldChartInstance) yieldChartInstance.destroy();

    yieldChartInstance = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Milk Yield (Litres)',
                data: yields,
                backgroundColor: '#4caf50',
                borderColor: '#2e7d32',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                title: { display: true, text: 'Lactation Yield per Cow' },
                legend: { display: false }
            }
        }
    });
}

function switchTab(tabName) {
    // Hide all tabs
    document.getElementById('tab-manage').classList.add('hidden');
    document.getElementById('tab-breed').classList.add('hidden');
    document.getElementById('tab-finance').classList.add('hidden');
    document.getElementById('tab-profile').classList.add('hidden');
    document.getElementById('tab-tasks').classList.add('hidden'); // NEW

    // Reset Buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show Selected
    if (tabName === 'manage') {
        document.getElementById('tab-manage').classList.remove('hidden');
        buttons[0].classList.add('active');
    } else if (tabName === 'breed') {
        document.getElementById('tab-breed').classList.remove('hidden');
        buttons[1].classList.add('active');
    } else if (tabName === 'finance') {
        document.getElementById('tab-finance').classList.remove('hidden');
        buttons[2].classList.add('active');
        calculateFinancials();
    } else if (tabName === 'profile') {
        document.getElementById('tab-profile').classList.remove('hidden');
        buttons[3].classList.add('active');
        loadProfileData();
    } else if (tabName === 'tasks') { // NEW CASE: TASKS
        document.getElementById('tab-tasks').classList.remove('hidden');
        buttons[4].classList.add('active');
        renderTasks(); // Load data when tab opens
    }
}

// ---------------------------------- BREED RECOGNITION ----------------------------------
const BREEDS_DB = ['Holstein', 'Jersey', 'Angus', 'Hereford', 'Simmental', 'Brahman', 'Guernsey'];

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Show preview area
            document.querySelector('.upload-area').classList.add('hidden');
            document.getElementById('prediction-result').classList.remove('hidden');
            document.getElementById('image-preview').src = e.target.result;

            // Start Simulation
            runFakePrediction();
        }
        reader.readAsDataURL(file);
    }
}

function runFakePrediction() {
    // Reset Result Area
    document.getElementById('result-text').classList.add('hidden');
    document.getElementById('loading-bar').classList.remove('hidden');
    document.querySelector('.progress-fill').style.width = "0%";


    setTimeout(() => { document.querySelector('.progress-fill').style.width = "100%"; }, 100);


    setTimeout(() => {
        document.getElementById('loading-bar').classList.add('hidden');
        document.getElementById('result-text').classList.remove('hidden');

        // Pick random breed
        const randomBreed = BREEDS_DB[Math.floor(Math.random() * BREEDS_DB.length)];
        const randomConf = Math.floor(Math.random() * (99 - 85) + 85); // 85% to 99%

        document.getElementById('breed-name').innerText = randomBreed;
        document.getElementById('breed-conf').innerText = randomConf;
    }, 2000);
}

function resetBreed() {
    document.getElementById('breed-upload').value = "";
    document.getElementById('prediction-result').classList.add('hidden');
    document.querySelector('.upload-area').classList.remove('hidden');
}

// ----------------------------------- ADMIN  -----------------------------------

function loadAdminDashboard() {
    // Hide regular User views
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('dashboard').classList.add('hidden'); // Hide User Dashboard

    // Show Admin Dashboard
    document.getElementById('admin-dashboard').classList.remove('hidden');

    renderAdminStats();
    renderUserTable();
}

function renderAdminStats() {
    const users = getStoredUsers();
    const allCattle = JSON.parse(localStorage.getItem(DATA_KEY)) || [];

    document.getElementById('admin-total-users').innerText = users.length;
    document.getElementById('admin-total-cattle').innerText = allCattle.length;
}

function renderUserTable() {
    const tbody = document.querySelector('#admin-users-table tbody');
    tbody.innerHTML = '';

    const users = getStoredUsers();
    const allCattle = JSON.parse(localStorage.getItem(DATA_KEY)) || [];

    users.forEach((u, index) => {
        const userCattleCount = allCattle.filter(c => c.owner === u.username).length;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${u.username}</strong></td>
            <td>${u.phone}</td>
            <td>${userCattleCount}</td>
            <td>
                <button class="btn-secondary" style="background: var(--primary); margin-right:5px;" onclick="viewUserDetail(${index})" title="View Details">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-secondary" style="background: #d32f2f;" onclick="deleteUser(${index})" title="Delete User">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteUser(index) {
    if (!confirm("WARNING: Deleting a user will also delete ALL their cattle records permanently. Continue?")) return;

    let users = getStoredUsers();
    const userToDelete = users[index];
    const username = userToDelete.username;

    // 1. Remove User from User List
    users.splice(index, 1);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // 2. Remove all cattle data belonging to this user
    let allCattle = JSON.parse(localStorage.getItem(DATA_KEY)) || [];
    const updatedCattle = allCattle.filter(c => c.owner !== username);
    localStorage.setItem(DATA_KEY, JSON.stringify(updatedCattle));

    // Refresh Admin View
    renderAdminStats();
    renderUserTable();
    alert(`User "${username}" has been deleted.`);
}

// ---------------------------- HEALTH REMINDERS ----------------------------
function checkReminders() {
    const data = getCattleData();
    const notificationArea = document.getElementById('notification-area');
    notificationArea.innerHTML = ''; // Clear old alerts

    const today = new Date();

    data.forEach(cow => {
        // Rule: If vaccine date is older than 365 days, alert!
        if (cow.vaccine.date) {
            const vDate = new Date(cow.vaccine.date);
            const diffTime = Math.abs(today - vDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 365) {
                const alertBox = document.createElement('div');
                alertBox.className = 'alert-card';
                alertBox.innerHTML = `<strong>⚠️ Vaccination Overdue</strong><br>Cow ID: ${cow.id} (Last: ${cow.vaccine.date})`;
                // Remove alert on click
                alertBox.onclick = function () { this.remove(); };
                notificationArea.appendChild(alertBox);
            }
        }
    });
}

//  -------------------------------  QR CODE  -------------------------------
function showQR(index) {
    const data = getCattleData();
    const cow = data[index];

    // Format a detailed "Card" of text to put inside the QR Code
    const qrText = `CATTLE ID: ${cow.id}
Breed: ${cow.breed}
Gender: ${cow.gender}
DOB: ${cow.dob}
Milk Yield: ${cow.lactation.yield || '0'} Litres
Last Vaccine: ${cow.vaccine.name || 'None'}
Owner: ${cow.owner}`;

    // Encode the text so the URL doesn't break from spaces or special characters
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrText)}`;

    // Inject the image and update the caption
    document.getElementById('qr-image-container').innerHTML = `<img src="${apiUrl}" alt="QR Code" style="border-radius: 8px; border: 4px solid #f1f8e9;">`;
    document.getElementById('qr-caption').innerText = `ID: ${cow.id} - ${cow.breed}`;

    // Show the modal
    document.getElementById('qr-modal').classList.remove('hidden');
}

function closeQR() {
    document.getElementById('qr-modal').classList.add('hidden');
}

//  ------------------------------- FINANCIALS -------------------------------
function calculateRevenue() {
    const data = getCattleData();
    const price = document.getElementById('milk-price').value || 0;

    let totalYield = 0;
    data.forEach(cow => {
        if (cow.lactation.yield) {
            totalYield += parseFloat(cow.lactation.yield);
        }
    });

    const totalRevenue = totalYield * price;

    document.getElementById('fin-total-yield').innerText = totalYield.toLocaleString();
    document.getElementById('fin-total-rev').innerText = totalRevenue.toLocaleString();
}

// --------------------------------- PROFILE  ---------------------------------

function loadProfileData() {
    const currentUser = localStorage.getItem(SESSION_KEY);
    const users = getStoredUsers();
    const userObj = users.find(u => u.username === currentUser);

    if (userObj) {
        document.getElementById('p-user').value = userObj.username;
        document.getElementById('p-phone').value = userObj.phone;
        document.getElementById('p-addr').value = userObj.address;
        document.getElementById('p-pass').value = ""; // Don't show password for security
    }
}

function updateProfile() {
    const currentUser = localStorage.getItem(SESSION_KEY);
    let users = getStoredUsers();

    // Find the user index
    const userIndex = users.findIndex(u => u.username === currentUser);

    if (userIndex > -1) {
        // Update fields
        users[userIndex].phone = document.getElementById('p-phone').value;
        users[userIndex].address = document.getElementById('p-addr').value;

        const newPass = document.getElementById('p-pass').value;
        if (newPass) {
            users[userIndex].password = newPass;
        }

        // Save back to LocalStorage
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        alert("Profile Updated Successfully!");
    } else {
        alert("Error: User not found.");
    }
}

// ---------------------------- ADMIN DETAIL VIEW  ----------------------------

function viewUserDetail(index) {
    const users = getStoredUsers();
    const user = users[index];
    const allCattle = JSON.parse(localStorage.getItem(DATA_KEY)) || [];

    // 1. Populate Profile Info
    document.getElementById('detail-username').innerText = user.username;
    document.getElementById('detail-phone').innerText = user.phone || 'N/A';
    document.getElementById('detail-addr').innerText = user.address || 'N/A';
    //document.getElementById('detail-pass').innerText = user.password; Showing password since it's admin

    // 2. Filter & Populate Cattle Table
    const userCattle = allCattle.filter(c => c.owner === user.username);
    const tbody = document.getElementById('detail-cattle-body');
    tbody.innerHTML = '';

    if (userCattle.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No cattle records found for this user.</td></tr>';
    } else {
        userCattle.forEach(cow => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cow.id}</td>
                <td>${cow.breed}</td>
                <td>${cow.gender}</td>
                <td>${cow.lactation.yield || 0}</td>
                <td>${cow.vaccine.date || 'None'}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // 3. Switch Screens
    document.getElementById('admin-home').classList.add('hidden');
    document.getElementById('admin-user-view').classList.remove('hidden');
}

function closeUserDetail() {
    // Switch back to Main List
    document.getElementById('admin-user-view').classList.add('hidden');
    document.getElementById('admin-home').classList.remove('hidden');
}

// ---------------------------- EXPENSE & PROFIT  ----------------------------

function getExpenses() {
    return JSON.parse(localStorage.getItem(EXPENSE_KEY)) || [];
}

function addExpense() {
    const type = document.getElementById('exp-type').value;
    const desc = document.getElementById('exp-desc').value;
    const amount = parseFloat(document.getElementById('exp-amount').value);

    if (!amount) return alert("Please enter an amount.");

    const expense = {
        id: Date.now(), // Unique ID based on time
        owner: localStorage.getItem(SESSION_KEY),
        type,
        desc,
        amount,
        date: new Date().toLocaleDateString()
    };

    const expenses = getExpenses();
    expenses.push(expense);
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));

    // Reset Form
    document.getElementById('exp-desc').value = '';
    document.getElementById('exp-amount').value = '';

    calculateFinancials();
}

function deleteExpense(id) {
    let expenses = getExpenses();
    expenses = expenses.filter(e => e.id !== id);
    localStorage.setItem(EXPENSE_KEY, JSON.stringify(expenses));
    calculateFinancials();
}

function calculateFinancials() {
    const currentUser = localStorage.getItem(SESSION_KEY);

    // 1. Calculate Revenue (Milk Yield * Price)
    const cattleData = getCattleData(); // Uses existing filter for current user
    const price = parseFloat(document.getElementById('milk-price').value) || 0;

    let totalYield = 0;
    cattleData.forEach(cow => {
        if (cow.lactation.yield) totalYield += parseFloat(cow.lactation.yield);
    });
    const totalRevenue = totalYield * price;

    // 2. Calculate Expenses
    const allExpenses = getExpenses();
    // Filter expenses for this user only
    const userExpenses = allExpenses.filter(e => e.owner === currentUser);

    let totalExpense = 0;
    userExpenses.forEach(e => totalExpense += e.amount);

    // 3. Calculate Net Profit
    const netProfit = totalRevenue - totalExpense;

    // 4. Update UI Stats
    document.getElementById('fin-total-rev').innerText = totalRevenue.toLocaleString();
    document.getElementById('fin-total-exp').innerText = totalExpense.toLocaleString();

    const profitEl = document.getElementById('fin-net-profit');
    profitEl.innerText = "₹ " + netProfit.toLocaleString();
    // Color code: Green if profit, Red if loss
    profitEl.style.color = netProfit >= 0 ? 'var(--primary)' : '#c62828';

    // 5. Update Table
    const tbody = document.getElementById('expense-table-body');
    tbody.innerHTML = '';

    // Show last 10 expenses (reversed)
    userExpenses.slice().reverse().forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><small>${e.type}</small></td>
            <td>${e.desc}</td>
            <td style="color:#c62828; font-weight:bold;">-${e.amount}</td>
            <td><i class="fas fa-times" style="color:red; cursor:pointer;" onclick="deleteExpense(${e.id})"></i></td>
        `;
        tbody.appendChild(tr);
    });
}

// -------------------------- PRINT FINANCIAL REPORT --------------------------

function printFinancialReport() {
    const currentUser = localStorage.getItem(SESSION_KEY);
    const cattleData = getCattleData();
    const allExpenses = getExpenses();
    const userExpenses = allExpenses.filter(e => e.owner === currentUser);
    const price = parseFloat(document.getElementById('milk-price').value) || 0;

    // Calculate Math
    let totalYield = 0;
    cattleData.forEach(cow => {
        if (cow.lactation && cow.lactation.yield) totalYield += parseFloat(cow.lactation.yield);
    });
    const totalRevenue = totalYield * price;

    let totalExpense = 0;
    userExpenses.forEach(e => totalExpense += e.amount);
    const netProfit = totalRevenue - totalExpense;

    // Get Current Date & Time
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();

    // Build the Receipt HTML
    let receiptHTML = `
        <div class="receipt-header">
            <h2>CattleManager Financial Report</h2>
            <p><strong>Farm Owner:</strong> ${currentUser}</p>
            <p><strong>Date:</strong> ${date} at ${time}</p>
        </div>
        
        <h3>Revenue Summary</h3>
        <table class="receipt-table">
            <tr><td>Total Milk Yield</td><td style="text-align:right;">${totalYield.toLocaleString()} L</td></tr>
            <tr><td>Milk Price</td><td style="text-align:right;">₹ ${price} / L</td></tr>
            <tr><td><strong>Gross Revenue</strong></td><td style="text-align:right; color: #2e7d32;"><strong>₹ ${totalRevenue.toLocaleString()}</strong></td></tr>
        </table>

        <h3>Expense Breakdown</h3>
        <table class="receipt-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th style="text-align:right;">Amount</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Adding Expense Rows
    if (userExpenses.length === 0) {
        receiptHTML += `<tr><td colspan="4" style="text-align:center;">No expenses recorded yet.</td></tr>`;
    } else {
        // Sort chronologically for the print out
        userExpenses.forEach(e => {
            receiptHTML += `
                <tr>
                    <td>${e.date}</td>
                    <td>${e.type}</td>
                    <td>${e.desc}</td>
                    <td style="text-align:right; color: #c62828;">-₹ ${e.amount.toLocaleString()}</td>
                </tr>`;
        });
    }

    // For adding Totals
    receiptHTML += `
            </tbody>
        </table>
        
        <div class="receipt-total">
            <p style="color: #c62828;">Total Expenses: -₹ ${totalExpense.toLocaleString()}</p>
            <p style="font-size: 1.6rem; color: ${netProfit >= 0 ? '#2e7d32' : '#c62828'};">
                Net Profit: ₹ ${netProfit.toLocaleString()}
            </p>
        </div>
        <div style="text-align: center; margin-top: 40px; font-size: 0.8rem; color: #666;">
            <p>Generated securely by CattleManager Pro</p>
        </div>
    `;

    // Injection into the DOM
    let printDiv = document.getElementById('print-receipt');
    if (!printDiv) {
        printDiv = document.createElement('div');
        printDiv.id = 'print-receipt';
        document.body.appendChild(printDiv);
    }
    printDiv.innerHTML = receiptHTML;

    // Trigger the Browser to Print Dialog
    window.print();
}

// --- --------------------------- TASK MANAGER --------------------------- ---

function getTasks() {
    return JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
}

function addTask() {
    const desc = document.getElementById('t-desc').value;
    const worker = document.getElementById('t-worker').value;
    const date = document.getElementById('t-date').value;

    const task = {
        id: Date.now(),
        owner: localStorage.getItem(SESSION_KEY),
        desc: desc,
        worker: worker,
        date: date,
        status: 'Pending' // Default status
    };

    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

    // Reset Form
    document.getElementById('t-desc').value = '';
    document.getElementById('t-worker').value = '';
    document.getElementById('t-date').value = '';

    renderTasks();
}

function toggleTaskStatus(taskId) {
    let tasks = getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex > -1) {
        // Flipping between Pending and Completed
        tasks[taskIndex].status = tasks[taskIndex].status === 'Pending' ? 'Completed' : 'Pending';
        localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
        renderTasks(); // Re-render table
    }
}

function deleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));

    renderTasks();
}

function renderTasks() {
    const currentUser = localStorage.getItem(SESSION_KEY);
    const allTasks = getTasks();

    // to get only the logged-in user's tasks
    const userTasks = allTasks.filter(t => t.owner === currentUser);

    const tbody = document.getElementById('task-table-body');
    tbody.innerHTML = '';

    if (userTasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No tasks assigned yet.</td></tr>';
        return;
    }

    // Task sorting
    userTasks.sort((a, b) => (a.status === 'Completed') - (b.status === 'Completed'));

    userTasks.forEach(t => {
        const tr = document.createElement('tr');
        const isCompleted = t.status === 'Completed';

        // to add gray styling if completed
        if (isCompleted) {
            tr.classList.add('task-completed');
        }

        tr.innerHTML = `
            <td style="text-align:center;">
                <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleTaskStatus(${t.id})" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary);">
            </td>
            <td><strong>${t.desc}</strong></td>
            <td><i class="fas fa-user-circle" style="color: #888;"></i> ${t.worker}</td>
            <td>${t.date}</td>
            <td>
                <i class="fas fa-trash action-icon" onclick="deleteTask(${t.id})" title="Delete Task" style="color:red;"></i>
            </td>
        `;
        tbody.appendChild(tr);
    });

}
