/*--------------------------------------------1. index.html  ----------------------------------------------------


#notification-area 
#qr-modal 

---------------------------------Authentication

#auth-container 
#login-form 
#register-form 

---------------------------------User Dashboard Views

#dashboard 
#tab-manage 
#tab-breed 
#tab-finance 
#tab-profile 
#tab-tasks 

---------------------------------Admin Dashboard Views

#admin-dashboard 
#admin-home 
#admin-user-view 


-------------------------------------------------2. style.css  ----------------------------------------------------


---------------------------------Base Design

:root 
body 
@keyframes morningBreeze 

---------------------------------Components

.btn-primary, .btn-secondary, .btn-success 
.card 
.table-container, table, th, td 
.nav-tabs, .tab-btn 
.input-group 

---------------------------------Animations & Icons

.manage-icon & @keyframes manageBounce
.ai-sparkle & @keyframes sparkleSpin
.chart-icon & @keyframes coinFlip
.user-icon & @keyframes userNod
.task-icon & @keyframes taskPulse

----------------------------------Specialty Features

@media print (Controls how the Financial Report prints)
.task-completed (The effect for finished tasks)


----------------------------------------------------3. script.js  ----------------------------------------------------


----------------------------------Storage Keys 

USERS_KEY, DATA_KEY, SESSION_KEY, EXPENSE_KEY, TASKS_KEY

----------------------------------Authentication & Navigation

register()
login()
logout()
toggleAuth(view)
switchTab(tabName)

------------------------------------Manage Cattle 

getCattleData()
saveRecord()
renderTable()
editRecord(index)
deleteRecord(index)
clearForm(
toggleOffspring() 
exportToCSV()

-------------------------------------Analytics & Visuals

updateCharts()
checkReminders() (Vaccine overdue alerts)

-------------------------------------QR Codes & AI

showQR(index)
closeQR()
previewImage(event)
runFakePrediction()
resetBreed()

-------------------------------------Financials

getExpenses()
addExpense()
deleteExpense(id)
calculateFinancials()
printFinancialReport()

-------------------------------------Profile & Tasks

loadProfileData()
updateProfile()
getTasks()
addTask()
toggleTaskStatus(taskId)
deleteTask(taskId)
renderTasks()

--------------------------------------Admin Actions

loadAdminDashboard()
renderAdminStats()
renderUserTable()
deleteUser(index)
viewUserDetail(index)
closeUserDetail()*/