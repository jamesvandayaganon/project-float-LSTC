// DOM Elements
const leaveRestForm = document.getElementById("LeaveRequestForm"),
  firstName = document.getElementById("FirstName"),
  lastName = document.getElementById("LastName"),
  employeeID = document.getElementById("EmployeeID"),
  initialRemainingDays = document.getElementById("RemainingDays"),
  startDate = document.getElementById("StartDate"),
  endDate = document.getElementById("EndDate");

// Web Speech API
let synth = window.speechSynthesis;

// Function to speak text
function speakText(text) {
  let utterThis = new SpeechSynthesisUtterance(text);
  let voices = synth.getVoices();
  let femaleVoice = voices.find(voice => voice.name.includes('Google UK English Female'));
  if (femaleVoice) {
    utterThis.voice = femaleVoice;
  }
  utterThis.rate = 1.1;
  utterThis.pitch = 1;
  utterThis.volume = .4;
  synth.speak(utterThis);
}

// Add event listeners to the input fields
firstName.addEventListener('focus', () => speakText('Enter your first name here.'));
lastName.addEventListener('focus', () => speakText('Enter your last name here.'));
employeeID.addEventListener('focus', () => speakText('Enter your employee ID here.'));
initialRemainingDays.addEventListener('focus', () => speakText('Enter your initial remaining leave days here.'));
startDate.addEventListener('focus', () => speakText('Enter the start date of your leave here.'));
endDate.addEventListener('focus', () => speakText('Enter the end date of your leave here.'));

// Add event listener to the form for form submission
leaveRestForm.addEventListener('submit', function(e) {
  e.preventDefault();
  if (
    firstName.value.trim() === "" ||
    lastName.value.trim() === "" ||
    employeeID.value.trim() === "" ||
    initialRemainingDays.value.trim() === "" ||
    startDate.value.trim() === "" ||
    endDate.value.trim() === ""
  ) {
    alert("Complete all fields!");
    speakText("Please complete all fields before submitting the form.");
  } else {
    createLeaveRequest();
  }
});

function createLeaveRequest() {
  let leaveRequest = document.createElement("div");
  let formData = {
    firstName: firstName.value,
    lastName: lastName.value,
    employeeID: employeeID.value,
    initialRemainingDays: initialRemainingDays.value,
    startDate: startDate.value,
    endDate: endDate.value,
    leaveDays: calculateLeaveDays(startDate.value, endDate.value),
    remainingLeaveDays: calculateRemainingLeaveDays(initialRemainingDays.value),
    submissionTimeStamp: getSubmissionTimeStamp(),
  };
  leaveRequest.innerHTML = `
    <header class="text-center mb-5">
      <i class="bi bi-person-fill display-1 text-primary" style="font-size: 10rem"></i>
      <h1 class="display-1 h1">Leave Request Form</h1>
    </header>
    <main class="container">
      <section class="row mb-3">
        <div class="col font-medium">
          <label for="">First Name:</label>
          <span class="text-primary">${firstName.value}</span>
        </div>
        <div class="col">
          <label class="text-lg">Last Name:</label>
          <span class="text-primary">${lastName.value}</span>
        </div>
      </section>
      <section class="row mb-3">
        <div class="col font-medium">
          <label for="">Employee ID:</label>
          <span class="text-primary">${employeeID.value}</span>
        </div>
        <div class="col">
          <label class="text-lg">Initial leave days:</label>
          <span class="text-primary">${initialRemainingDays.value}</span>
        </div>
      </section>
      <section class="row mb-3">
        <div class="col font-medium">
          <label for="">Start Date:</label>
          <span class="text-primary">${startDate.value}</span>
        </div>
        <div class="col leading-6 font-medium">
          <label class="text-lg">End Date:</label>
          <span class="text-primary">${endDate.value}</span>
        </div>
      </section>
      <section class="mb-3 row">
        <div class="col leading-6 font-medium">
          <label>Requested leave day/s:</label>
          <span class="text-indigo-700">${calculateLeaveDays(startDate.value, endDate.value)}</span>
        </div>
        <div class="col leading-6 font-medium">
          <label>Remaining leave day/s:</label>
          <span class="text-indigo-700">${calculateRemainingLeaveDays(initialRemainingDays.value)}</span>
        </div>
      </section>
      <div class="col">
        <label>Submitted:</label>
        <span class="text-primary">${getSubmissionTimeStamp()}</span>
      </div>
      <section class="d-flex justify-content-between mt-3">
        <button type="button" class="btn btn-success btn-lg btn-transition" onclick="onLeaveApproval()">
          <i class="bi bi-emoji-smile-fill me-2"></i>Approve
        </button>
        <button type="button" class="btn btn-danger btn-lg btn-transition" onclick="onLeaveReject()">
          <i class="bi bi-emoji-frown-fill me-2"></i>Decline
        </button>
      </section>
    </main>
  `;
  document.querySelector(".leave-request").remove();
  document.querySelector(".container").appendChild(leaveRequest);
}

function getSubmissionTimeStamp() {
  const today = new Date();
  const date = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  const time = ` ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`;
  const dateTime = `${date} / ${time}`;
  return dateTime;
}

function calculateLeaveDays(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let leaveDays = endDate.workingDaysFrom(startDate);
  return leaveDays;
}

function calculateRemainingLeaveDays(initialRemainingDays) {
  return initialRemainingDays - calculateLeaveDays(startDate.value, endDate.value);
}

Date.prototype.workingDaysFrom = function(fromDate) {
  if (!fromDate || isNaN(fromDate) || this < fromDate) {
    return -1;
  }
  let frDay = new Date(fromDate.getTime()),
    toDay = new Date(this.getTime()),
    numOfWorkingDays = 1;
  frDay.setHours(0, 0, 0, 0);
  toDay.setHours(0, 0, 0, 0);
  while (frDay < toDay) {
    frDay.setDate(frDay.getDate() + 1);
    let day = frDay.getDay();
    if (day != 0 && day != 6) {
      numOfWorkingDays++;
    }
  }
  return numOfWorkingDays;
};

let leaveRequests = [];

function saveLeaveRequest(leaveRequest) {
  let existingRequests = JSON.parse(localStorage.getItem('leaveData')) || [];
  existingRequests.push(leaveRequest);
  localStorage.setItem('leaveData', JSON.stringify(existingRequests));
}

function onLeaveApproval() {
  let leaveRequest = {
    firstName: firstName.value,
    lastName: lastName.value,
    employeeID: employeeID.value,
    initialRemainingDays: initialRemainingDays.value,
    startDate: startDate.value,
    endDate: endDate.value,
    leaveDays: calculateLeaveDays(startDate.value, endDate.value),
    remainingLeaveDays: calculateRemainingLeaveDays(initialRemainingDays.value),
    submissionTimeStamp: getSubmissionTimeStamp(),
    status: 'Approved'
  };
  displayLeaveMessage('approved', leaveRequest);
}

function onLeaveReject() {
  let leaveRequest = {
    firstName: firstName.value,
    lastName: lastName.value,
    employeeID: employeeID.value,
    initialRemainingDays: initialRemainingDays.value,
    startDate: startDate.value,
    endDate: endDate.value,
    leaveDays: calculateLeaveDays(startDate.value, endDate.value),
    remainingLeaveDays: calculateRemainingLeaveDays(initialRemainingDays.value),
    submissionTimeStamp: getSubmissionTimeStamp(),
    status: 'Rejected'
  };
  displayLeaveMessage('declined', leaveRequest);
}

function displayLeaveMessage(status, leaveRequest) {
  const message = status === 'approved' ? 'Your leave was approved' : 'Your leave was declined';
  const icon = status === 'approved' ? 'bi-emoji-smile-fill' : 'bi-emoji-frown-fill';
  const color = status === 'approved' ? 'text-success' : 'text-danger';

  document.querySelector(".container").innerHTML = `
    <header class="text-center mb-5">
      <i class="bi ${icon} h1 display-1 ${color} m-auto" style="font-size: 10rem"></i>
      <h1 class="h1 display-1">${message}</h1>
      <div class="text-center">
        <button class="btn btn-primary btn-lg mt-5 btn-transition" id="backToHomepage">Back to Homepage</button>
      </div>
    </header>
  `;

  document.getElementById("backToHomepage").addEventListener("click", function() {
    saveLeaveRequest(leaveRequest);
    downloadFormData(leaveRequest);
    window.location.href = 'login.html';
  });
}

function downloadFormData(data) {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  // Create a filename based on the first name and last name
  const filename = `${data.firstName}_${data.lastName}_leave_request.json`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function loadLeaveRequests() {
  let leaveRequests = JSON.parse(localStorage.getItem('leaveData'));
  if (leaveRequests) {
    for (let i = 0; i < leaveRequests.length; i++) {
      console.log(`- Leave Request Form #${i + 1} -`);
      console.log('First Name:', leaveRequests[i].firstName);
      console.log('Last Name:', leaveRequests[i].lastName);
      console.log('Employee ID:', leaveRequests[i].employeeID);
      console.log('Initial Remaining Days:', leaveRequests[i].initialRemainingDays);
      console.log('Start Date:', leaveRequests[i].startDate);
      console.log('End Date:', leaveRequests[i].endDate);
      console.log('Leave Days:', leaveRequests[i].leaveDays);
      console.log('Remaining Leave Days:', leaveRequests[i].remainingLeaveDays);
      console.log('Submission Time Stamp:', leaveRequests[i].submissionTimeStamp);
      console.log('Status:', leaveRequests[i].status);
      console.log('---');
    }
  } else {
    console.log('No leave requests found.');
  }
}

window.onload = loadLeaveRequests;
