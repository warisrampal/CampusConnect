const DEFAULT_EVENTS = [
  {id:101,title:"Campus Tree Plantation",category:"Environment",location:"College Garden",date:"2026-12-12",capacity:25,joined:12,description:"Help plant native trees and make the campus greener. Volunteers will help prepare the garden and learn about local plants.",emoji:"🌱"},
  {id:102,title:"Weekend Learning Support",category:"Education",location:"Community Centre",date:"2026-12-19",capacity:15,joined:8,description:"Support school students with reading, basic maths and fun learning activities.",emoji:"📚"},
  {id:103,title:"Neighbourhood Clean-up",category:"Community Support",location:"Model Town Park",date:"2026-12-22",capacity:30,joined:19,description:"Work together to clean a shared public space and encourage responsible waste disposal.",emoji:"🧹"},
  {id:104,title:"Animal Shelter Care Day",category:"Animal Welfare",location:"City Animal Shelter",date:"2027-01-05",capacity:12,joined:7,description:"Assist shelter staff with approved cleaning, organising supplies and enrichment activities.",emoji:"🐾"},
  {id:105,title:"Community Health Awareness",category:"Health Awareness",location:"Student Activity Hall",date:"2027-01-10",capacity:20,joined:11,description:"Help share reliable public-health information and guide visitors to awareness resources.",emoji:"❤️"},
  {id:106,title:"Books for Every Child",category:"Education",location:"University Library",date:"2027-01-16",capacity:18,joined:6,description:"Sort donated books and prepare reading packs for a community learning centre.",emoji:"📖"},
  {id:107,title:"Reusable Bag Campaign",category:"Environment",location:"Main Campus",date:"2027-01-20",capacity:22,joined:9,description:"Promote reusable bags and share practical ways to reduce single-use plastic.",emoji:"♻️"},
  {id:108,title:"Community Meal Packing",category:"Community Support",location:"Civic Hall",date:"2027-01-25",capacity:24,joined:14,description:"Help organise and pack food kits with a local community volunteer group.",emoji:"🥫"},
  {id:109,title:"Pet Care Awareness Booth",category:"Animal Welfare",location:"Campus Square",date:"2027-02-02",capacity:16,joined:5,description:"Share responsible pet-care information and promote kindness towards animals.",emoji:"🐶"},
  {id:110,title:"Healthy Habits Student Drive",category:"Health Awareness",location:"Lecture Block A",date:"2027-02-08",capacity:20,joined:10,description:"Create an awareness display about sleep, hydration, movement and wellbeing.",emoji:"💚"},
  {id:111,title:"Campus Recycling Sort",category:"Environment",location:"Student Centre",date:"2027-02-14",capacity:20,joined:4,description:"Help sort recyclable materials and label collection points around campus.",emoji:"♻️"},
  {id:112,title:"Digital Basics Workshop",category:"Education",location:"Computer Lab 2",date:"2027-02-20",capacity:10,joined:3,description:"Help beginners practise basic computer skills in a friendly learning session.",emoji:"💻"}
];

const COMMUNITIES = [
  {id:"green",name:"Green Campus Collective",category:"Environment",members:48,icon:"🌿",description:"Students working on cleaner, greener and more sustainable spaces."},
  {id:"learn",name:"Learning Together",category:"Education",members:35,icon:"📚",description:"Peer learning, tutoring and access to educational resources."},
  {id:"care",name:"Community Care Circle",category:"Community Support",members:62,icon:"🤝",description:"Small acts of support that make neighbourhoods stronger."},
  {id:"paws",name:"Paws & Kindness",category:"Animal Welfare",members:27,icon:"🐾",description:"Promoting responsible animal care and welfare awareness."}
];

const STORAGE_KEYS = {
  events:"campusconnect_events_v1",
  joined:"campusconnect_joined_v1",
  groups:"campusconnect_groups_v1"
};

function readStorage(key,fallback) {
  try {
    const value=localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch(error) {
    console.warn("Could not read saved demo data:",error);
    return fallback;
  }
}
function writeStorage(key,value) {
  try {
    localStorage.setItem(key,JSON.stringify(value));
    return true;
  } catch(error) {
    showToast("Browser storage is unavailable. Changes may not persist.");
    return false;
  }
}

let events=readStorage(STORAGE_KEYS.events,DEFAULT_EVENTS);
let joinedIds=readStorage(STORAGE_KEYS.joined,[]);
let joinedGroups=readStorage(STORAGE_KEYS.groups,[]);

const eventGrid=document.querySelector("#eventGrid");
const searchInput=document.querySelector("#searchInput");
const categoryFilter=document.querySelector("#categoryFilter");
const sortFilter=document.querySelector("#sortFilter");
const emptyState=document.querySelector("#emptyState");
const resultsLine=document.querySelector("#resultsLine");
const dialog=document.querySelector("#eventDialog");
const dialogContent=document.querySelector("#dialogContent");
let toastTimer;

function showToast(message) {
  const toast=document.querySelector("#toast");
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
}
function categoryClass(category) {
  return ({
    "Environment":"environment","Education":"education",
    "Community Support":"community","Animal Welfare":"animal",
    "Health Awareness":"health"
  })[category] || "environment";
}
function formatDate(dateString) {
  const date=new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime()) ? "Date to be announced" :
    date.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
}
function saveEvents(){writeStorage(STORAGE_KEYS.events,events);}
function saveJoined(){writeStorage(STORAGE_KEYS.joined,joinedIds);}

function renderEvents() {
  const term=searchInput.value.trim().toLowerCase();
  const category=categoryFilter.value;
  let filtered=events.filter(event=>{
    const searchable=`${event.title} ${event.category} ${event.location} ${event.description}`.toLowerCase();
    return searchable.includes(term) && (category==="All" || event.category===category);
  });
  filtered.sort((a,b)=>sortFilter.value==="title" ?
    a.title.localeCompare(b.title) : a.date.localeCompare(b.date));

  resultsLine.textContent=`${filtered.length} opportunit${filtered.length===1?"y":"ies"} found`;
  emptyState.classList.toggle("hidden",filtered.length!==0);
  eventGrid.innerHTML=filtered.map(event=>{
    const isJoined=joinedIds.includes(event.id);
    const placesLeft=Math.max(0,Number(event.capacity)-Number(event.joined));
    return `
      <article class="event-card">
        <div class="event-visual ${categoryClass(event.category)}">
          <span class="event-emoji">${escapeHTML(event.emoji || "🌱")}</span>
          <span class="category-pill">${escapeHTML(event.category)}</span>
        </div>
        <div class="event-body">
          <h3>${escapeHTML(event.title)}</h3>
          <p class="event-description">${escapeHTML(event.description)}</p>
          <div class="event-meta"><span>📅 ${formatDate(event.date)}</span><span>📍 ${escapeHTML(event.location)}</span></div>
          <div class="event-footer">
            <span class="spots">${placesLeft} places left</span>
            <button class="card-button" data-action="details" data-id="${event.id}">View details →</button>
          </div>
          ${isJoined ? '<p class="joined-label">✓ You joined this activity</p>' : ""}
        </div>
      </article>`;
  }).join("");
  updateStats();
}

function openEventDetails(id) {
  const event=events.find(item=>item.id===Number(id));
  if(!event) return;
  const isJoined=joinedIds.includes(event.id);
  const left=Math.max(0,event.capacity-event.joined);
  dialogContent.innerHTML=`
    <div class="dialog-content">
      <p class="eyebrow">${escapeHTML(event.category)}</p>
      <h2>${escapeHTML(event.title)}</h2>
      <p>${escapeHTML(event.description)}</p>
      <p><strong>Date:</strong> ${formatDate(event.date)}<br>
      <strong>Location:</strong> ${escapeHTML(event.location)}<br>
      <strong>Places remaining:</strong> ${left}</p>
      <button class="button" id="dialogJoin" ${(!isJoined && left===0)?"disabled":""}>
        ${isJoined?"Leave activity":left===0?"Fully booked":"Join activity"}
      </button>
      <p class="form-note">This is a local browser demonstration, not a live registration.</p>
    </div>`;
  dialog.showModal();
  document.querySelector("#dialogJoin").addEventListener("click",()=>{
    toggleJoin(event.id);
    dialog.close();
  });
}

function toggleJoin(id) {
  const event=events.find(item=>item.id===Number(id));
  if(!event) return;
  if(joinedIds.includes(event.id)) {
    joinedIds=joinedIds.filter(joinedId=>joinedId!==event.id);
    event.joined=Math.max(0,event.joined-1);
    showToast("You left the activity.");
  } else {
    if(event.joined>=event.capacity) {
      showToast("Sorry, this activity is full.");
      return;
    }
    joinedIds.push(event.id);
    event.joined+=1;
    showToast("You joined the activity!");
  }
  saveJoined();
  saveEvents();
  renderEvents();
  renderDashboard();
}

function renderCommunities() {
  const container=document.querySelector("#communityGrid");
  container.innerHTML=COMMUNITIES.map(group=>{
    const isJoined=joinedGroups.includes(group.id);
    return `<article class="community-card">
      <div class="community-icon">${group.icon}</div>
      <h3>${escapeHTML(group.name)}</h3>
      <p>${escapeHTML(group.description)}</p>
      <span class="spots">${group.members+(isJoined?1:0)} members · ${escapeHTML(group.category)}</span><br>
      <button class="card-button" data-action="group" data-id="${escapeHTML(group.id)}">
        ${isJoined?"Leave community":"Join community"} →
      </button>
    </article>`;
  }).join("");
}
function toggleGroup(id) {
  if(joinedGroups.includes(id)) {
    joinedGroups=joinedGroups.filter(groupId=>groupId!==id);
    showToast("You left the community.");
  } else {
    joinedGroups.push(id);
    showToast("Welcome to the community!");
  }
  writeStorage(STORAGE_KEYS.groups,joinedGroups);
  renderCommunities();
  updateStats();
}

function renderDashboard() {
  const joined=events.filter(event=>joinedIds.includes(event.id));
  const today=new Date();
  today.setHours(0,0,0,0);
  const upcoming=joined.filter(event=>new Date(`${event.date}T00:00:00`)>=today);
  const completed=joined.length-upcoming.length;
  document.querySelector("#dashJoined").textContent=joined.length;
  document.querySelector("#dashUpcoming").textContent=upcoming.length;
  document.querySelector("#dashCompleted").textContent=completed;
  const list=document.querySelector("#joinedList");
  list.innerHTML=joined.length ? joined.map(event=>`
    <div class="joined-item"><strong>${escapeHTML(event.title)}</strong>
    <span>${formatDate(event.date)} · ${escapeHTML(event.location)}</span></div>
  `).join("") : '<p class="section-intro">You have not joined any activities yet. Explore opportunities to get started.</p>';
  document.querySelector("#statJoined").textContent=joined.length;
}
function updateStats() {
  document.querySelector("#statInitiatives").textContent=events.length;
  document.querySelector("#heroEventCount").textContent=`${events.length}+`;
  document.querySelector("#statJoined").textContent=joinedIds.length;
  document.querySelector("#statGroups").textContent=COMMUNITIES.length;
}

function createInitiative(form) {
  const formData=new FormData(form);
  const title=String(formData.get("title")).trim();
  const category=String(formData.get("category"));
  const capacity=Number(formData.get("capacity"));
  const date=String(formData.get("date"));
  const location=String(formData.get("location")).trim();
  const description=String(formData.get("description")).trim();

  if(title.length<4 || description.length<15 || !category || !location ||
     !Number.isInteger(capacity) || capacity<1 || capacity>500 || !date) {
    showToast("Please check all fields and try again.");
    return;
  }
  const selectedDate=new Date(`${date}T00:00:00`);
  const today=new Date();
  today.setHours(0,0,0,0);
  if(selectedDate<today) {
    showToast("Choose today or a future date.");
    return;
  }
  const emojiByCategory={
    "Environment":"🌱","Education":"📚","Community Support":"🤝",
    "Animal Welfare":"🐾","Health Awareness":"❤️"
  };
  const newEvent={
    id:Date.now(),title,category,capacity,date,location,description,
    joined:0,emoji:emojiByCategory[category]
  };
  events.unshift(newEvent);
  saveEvents();
  form.reset();
  renderEvents();
  renderDashboard();
  showToast("Your demo initiative has been published.");
  window.location.hash="#explore";
}

function resetDemo() {
  if(!confirm("Reset all locally saved CampusConnect demo changes?")) return;
  localStorage.removeItem(STORAGE_KEYS.events);
  localStorage.removeItem(STORAGE_KEYS.joined);
  localStorage.removeItem(STORAGE_KEYS.groups);
  events=[...DEFAULT_EVENTS];
  joinedIds=[];
  joinedGroups=[];
  renderEvents();
  renderCommunities();
  renderDashboard();
  showToast("Demo data has been reset.");
}

// Event delegation keeps dynamically rendered cards interactive.
eventGrid.addEventListener("click",event=>{
  const button=event.target.closest("button[data-action='details']");
  if(button) openEventDetails(button.dataset.id);
});
document.querySelector("#communityGrid").addEventListener("click",event=>{
  const button=event.target.closest("button[data-action='group']");
  if(button) toggleGroup(button.dataset.id);
});
searchInput.addEventListener("input",renderEvents);
categoryFilter.addEventListener("change",renderEvents);
sortFilter.addEventListener("change",renderEvents);
document.querySelector("#initiativeForm").addEventListener("submit",event=>{
  event.preventDefault();
  createInitiative(event.currentTarget);
});
document.querySelector("#clearDemo").addEventListener("click",resetDemo);
document.querySelector("#dialogClose").addEventListener("click",()=>dialog.close());

const menuToggle=document.querySelector("#menuToggle");
const navLinks=document.querySelector("#navLinks");
menuToggle.addEventListener("click",()=>{
  const isOpen=navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded",String(isOpen));
});
navLinks.addEventListener("click",event=>{
  if(event.target.matches("a")) {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded","false");
  }
});

document.querySelector("#year").textContent=new Date().getFullYear();
renderEvents();
renderCommunities();
renderDashboard();
