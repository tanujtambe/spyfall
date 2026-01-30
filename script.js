let agents=[];
let current=0;
let timerStarted=false;
let timerInterval;
let phase="reveal";
let voteIndex=0;
let holdTimeout = null;
let holdCountdown = null;
let holdSeconds = 5;

const isGame=location.pathname.includes("game");

const locations={
"Kashmir Houseboat":["Captain","Tourist","Cook","Guide","Photographer","Cleaner","Vendor","Guard"],
"Amritsar Golden Temple":["Priest","Volunteer","Devotee","Cook","Guard","Guide","Cleaner","Tourist"],
"Delhi Street Market":["Seller","Shop Owner","Courier","Customer","Performer","Pickpocket","Police","Guide"],
"Jaipur Palace":["Guide","Guard","Historian","Caretaker","Tourist","Staff","Photographer","Attendant"],
"Varanasi Ghats":["Priest","Boatman","Pilgrim","Flower Seller","Photographer","Ashram Worker","Local","Tourist"],
"Mumbai Local Train":["TC","Office Worker","Student","Vendor","Guard","Commuter","Tourist","Cleaner"],
"Goa Beach Shack":["Bartender","DJ","Instructor","Vendor","Lifeguard","Tourist","Manager","Organizer"],
"Bengaluru IT Park":["Developer","HR","Founder","Intern","Guard","PM","Analyst","Delivery"],
"Kerala Backwaters":["Captain","Fisherman","Resort Staff","Traveler","Vendor","Farmer","Guide","Watcher"],
"Hyderabad Biryani Hotel":["Chef","Waiter","Customer","Manager","Cleaner","Delivery","Cashier","Guard"],
"Kolkata Tram":["Driver","Passenger","TC","Vendor","Student","Tourist","Cleaner","Inspector"],
"Puri Jagannath Temple":["Priest","Devotee","Volunteer","Guard","Guide","Cleaner","Vendor","Tourist"],
"Chennai Marina Beach":["Vendor","Tourist","Fisherman","Guard","Photographer","Cleaner","Jogger","Rescuer"],
"Madurai Temple":["Priest","Devotee","Guide","Guard","Cleaner","Vendor","Volunteer","Tourist"],
"Assam Tea Estate":["Manager","Picker","Inspector","Exporter","Farmer","Operator","Guide","Warehouse"],
"Nagpur Orange Market":["Trader","Farmer","Buyer","Loader","Inspector","Driver","Cleaner","Guard"],
"Rajasthan Desert Camp":["Guide","Camel Handler","Tourist","Cook","Guard","Photographer","Organizer","Cleaner"],
"Patna Railway":["Vendor","Porter","Driver","TC","Passenger","Manager","Cleaner","Police"],
"Indore Sarafa Bazaar":["Snack Seller","Customer","Cashier","Cook","Cleaner","Guard","Supplier","Tourist"],
"Shillong View Point":["Guide","Tourist","Photographer","Vendor","Guard","Cleaner","Driver","Local"],
"Agra Taj Mahal":["Guide","Security","Photographer","Tourist","Cleaner","Vendor","Caretaker","Historian"],
"Lucknow Imambara":["Guide","Volunteer","Devotee","Guard","Cleaner","Tourist","Vendor","Caretaker"],
"Udaipur City Palace":["Guide","Boatman","Tourist","Guard","Cleaner","Vendor","Historian","Photographer"],
"Bhopal Lakefront":["Jogger","Photographer","Vendor","Cleaner","Guard","Tourist","Boat Operator","Local"],
"Surat Textile Market":["Trader","Buyer","Quality Checker","Loader","Cashier","Guard","Driver","Supervisor"],
"Ahmedabad Sabarmati":["Guide","Tourist","Cleaner","Security","Vendor","Photographer","Volunteer","Local"],
"Rajkot Workshop":["Mechanic","Supervisor","Intern","Quality Inspector","Driver","Cleaner","Store Manager","Guard"],
"Coimbatore Factory":["Operator","Engineer","Supervisor","Intern","Cleaner","Security","Driver","Manager"],
"Vizag Shipyard":["Engineer","Welder","Inspector","Captain","Dock Worker","Guard","Cleaner","Logistics"],
"Ranchi Waterfall":["Guide","Tourist","Photographer","Vendor","Cleaner","Driver","Forest Guard","Local"],
"Raipur Rice Mill":["Operator","Supervisor","Loader","Quality Checker","Driver","Cleaner","Guard","Accountant"],
"Guwahati Ferry":["Captain","Ticket Clerk","Passenger","Cleaner","Vendor","Security","Guide","Local"],
"Imphal Handloom":["Weaver","Designer","Buyer","Supervisor","Cleaner","Security","Driver","Accountant"],
"Aizawl Hill Cafe":["Barista","Tourist","Cleaner","Owner","Guide","Supplier","Photographer","Local"],
"Gangtok Ropeway":["Operator","Tourist","Guide","Cleaner","Technician","Security","Photographer","Local"],
"Darjeeling Toy Train":["Driver","Ticket Clerk","Tourist","Guide","Cleaner","Vendor","Photographer","Inspector"],
"Dhanbad Coal Mine":["Miner","Supervisor","Safety Officer","Engineer","Cleaner","Driver","Guard","Inspector"],
"Jamshedpur Steel Plant":["Operator","Engineer","Supervisor","Intern","Security","Cleaner","Driver","Manager"],
"Chandigarh Sector Market":["Vendor","Customer","Security","Cleaner","Courier","Shop Owner","Tourist","Inspector"],
"Shimla Ridge":["Guide","Tourist","Photographer","Vendor","Cleaner","Security","Driver","Local"],
"Manali Snow Camp":["Instructor","Tourist","Guide","Cook","Cleaner","Rescue Staff","Photographer","Driver"],
"Leh Army Camp":["Officer","Medic","Driver","Technician","Guard","Cook","Logistics","Engineer"],
"Jodhpur Blue City":["Guide","Tourist","Photographer","Vendor","Cleaner","Guard","Driver","Local"]
};

function randomIndexes(n,c){
 let s=new Set();
 while(s.size<c)s.add(Math.floor(Math.random()*n));
 return [...s];
}

/* ================= LOBBY ================= */

if(!isGame){

const agentInput=document.getElementById("agentInput");
const agentList=document.getElementById("agentList");
const spySelect=document.getElementById("spySelect");
const timeSelect=document.getElementById("timeSelect");
const popup=document.getElementById("popup");
const popupText=document.getElementById("popupText");

window.closePopup=()=>popup.style.display="none";

window.addAgent=()=>{
 let n=agentInput.value.trim();
 if(!n)return;

 if(agents.some(a=>a.name.toLowerCase()===n.toLowerCase())){
 popupText.innerText="AGENT ALREADY EXISTS";
 popup.style.display="flex";
 return;
 }

 agents.push({name:n});
 agentInput.value="";
 render();
};

window.removeAgent=i=>{
 agents.splice(i,1);
 render();
};

function render(){
 agentList.innerHTML="";
 agents.forEach((a,i)=>{
 agentList.innerHTML+=`
 <li>${a.name}
 <button class="remove" onclick="removeAgent(${i})">-</button>
 </li>`;
 });
}

window.startMission=()=>{

 if(agents.length<3){
 popupText.innerText="MINIMUM 3 AGENTS";
 popup.style.display="flex";
 return;
 }

 localStorage.setItem("session",JSON.stringify({
 players:agents,
 spyCount:+spySelect.value,
 time:+timeSelect.value
 }));

 newRound();
};

function newRound(){

 let s=JSON.parse(localStorage.getItem("session"));
 let locNames=Object.keys(locations);
 let loc=locNames[Math.floor(Math.random()*locNames.length)];
 let roles=[...locations[loc]];
 let spies=randomIndexes(s.players.length,s.spyCount);

 let round=s.players.map((p,i)=>({
 name:p.name,
 spy:spies.includes(i),
 role:spies.includes(i)?null:roles.pop(),
 location:loc
 }));

 localStorage.setItem("roundAgents",JSON.stringify(round));
 localStorage.setItem("roundTime",s.time);

 location="game.html";
}
}

/* ================= GAME ================= */

if(isGame){

const accuseArea=document.getElementById("accuseArea");
const startVoteBtn=document.getElementById("startVoteBtn");
const startTimerBtn=document.getElementById("startTimerBtn");
const nextBtn=document.getElementById("nextBtn");
const timer=document.getElementById("timer");
const turn=document.getElementById("turn");
const hold=document.getElementById("hold");
const card=document.getElementById("card");
const popup=document.getElementById("popup");
const popupText=document.getElementById("popupText");
const popupBox=document.getElementById("popupBox");
const playAgain=document.getElementById("playAgain");

agents=JSON.parse(localStorage.getItem("roundAgents"));

accuseArea.style.display="none";
startVoteBtn.style.display="none";
playAgain.style.display="none";
localStorage.removeItem("votes");

/* ---- DISCUSSION HINT ---- */

const discussionHint=document.createElement("div");
discussionHint.className="theme";
discussionHint.style.marginTop="8px";
discussionHint.style.textAlign="center";
discussionHint.style.display="none";
discussionHint.innerText="Discuss freely. Ask questions. Find the Spy. Then vote anonymously.";
timer.after(discussionHint);

showTurn();

/* ---- REVEAL ---- */

function reveal(){

 if(phase!=="reveal") return;

 let remaining = holdSeconds;

 card.innerHTML = `HOLD... ${remaining}`;
 card.style.display="block";

 holdCountdown = setInterval(()=>{
   remaining--;
   card.innerHTML = `HOLD... ${remaining}`;
 },1000);

 holdTimeout = setTimeout(()=>{

  clearInterval(holdCountdown);

  let a = agents[current];

  card.innerHTML = a.spy
    ? "<div class='spy'>Location: ??<br>Role : Spy</div>"
    : `Location: ${a.location}<br>Role: ${a.role}`;

  // ONLY NOW allow next action
  if(current === agents.length - 1){
    startTimerBtn.style.display = "block";
    turn.innerText = "ALL ROLES DISTRIBUTED";
  } else {
    nextBtn.style.display = "block";
  }

}, holdSeconds * 1000);

}

function hideReveal(){

 if(phase!=="reveal") return;

 clearTimeout(holdTimeout);
 clearInterval(holdCountdown);

 card.style.display="none";

}


hold.onmousedown=reveal;
hold.onmouseup=hideReveal;

hold.addEventListener("touchstart",e=>{e.preventDefault();reveal();});
hold.addEventListener("touchend",e=>{e.preventDefault();hideReveal();});

nextBtn.onclick=()=>{
 current++;
 nextBtn.style.display="none";
 showTurn();
};

function showTurn(){
 turn.innerHTML=`PASS PHONE TO ${agents[current].name.toUpperCase()}`;
}

/* ---- TIMER ---- */

startTimerBtn.onclick=startTimer;
startVoteBtn.onclick=beginVoting;

function startTimer(){

 if(timerStarted)return;

 timerStarted=true;
 phase="timer";

 startTimerBtn.style.display="none";
 startVoteBtn.style.display="block";
 startVoteBtn.innerText=`START VOTING -- ( ${agents[0].name.toUpperCase()} goes first)`;

 discussionHint.style.display="block";

 let t=+localStorage.getItem("roundTime");

 timerInterval=setInterval(()=>{
 timer.innerText=Math.floor(t/60)+":"+String(t%60).padStart(2,"0");
 if(t<=0) clearInterval(timerInterval);
 t--;
 },1000);
}

/* ---- VOTING ---- */

function beginVoting(){

 if(phase==="voting")return;
 clearInterval(timerInterval);
 phase="voting";

 discussionHint.style.display="none";

 voteIndex=0;
 localStorage.setItem("votes",JSON.stringify([]));

 accuseArea.style.display="block";
 startVoteBtn.style.display="none";

 showVote();
}

function showVote(){

 accuseArea.innerHTML=`<h3>${agents[voteIndex].name.toUpperCase()} CAST YOUR VOTE</h3>`;

 agents.forEach((a,i)=>{
 accuseArea.innerHTML+=`
 <div class="voteRow">
 <span>${a.name}</span>
 <button class="accuse" onclick="castVote(${i})">VOTE</button>
 </div>`;
 });
}

window.castVote=i=>{

 let v=JSON.parse(localStorage.getItem("votes"));
 v.push(i);
 localStorage.setItem("votes",JSON.stringify(v));

 let last = voteIndex === agents.length-1;

 accuseArea.innerHTML=`
 <button class="start" onclick="nextVote()">${last?"SEE RESULT":"PASS PHONE TO "+agents[voteIndex+1].name.toUpperCase()}</button>
 `;
};

window.nextVote=()=>{
 voteIndex++;
 if(voteIndex>=agents.length) finalize();
 else showVote();
};

/* ---- RESULT ---- */

function finalize(){

 let votes=JSON.parse(localStorage.getItem("votes"));
 let tally={};

 votes.forEach(v=>tally[v]=(tally[v]||0)+1);

 let max=0,acc=null,tie=false;

 Object.keys(tally).forEach(k=>{
 if(tally[k]>max){max=tally[k];acc=k;tie=false;}
 else if(tally[k]==max) tie=true;
 });

 popupBox.classList.remove("spyTheme","memberTheme");

 if(tie || !agents[acc].spy){
 popupBox.classList.add("spyTheme");
 popupText.innerText="SPY WINS!";
 }else{
 popupBox.classList.add("memberTheme");
 popupText.innerText="MEMBERS WIN!";
 }

 popup.style.display="flex";
 playAgain.style.display="block";
}

/* PLAY AGAIN */

playAgain.onclick=()=>{

 let s=JSON.parse(localStorage.getItem("session"));
 let locNames=Object.keys(locations);
 let loc=locNames[Math.floor(Math.random()*locNames.length)];
 let roles=[...locations[loc]];
 let spies=randomIndexes(agents.length,s.spyCount);

 let round=agents.map((p,i)=>({
 name:p.name,
 spy:spies.includes(i),
 role:spies.includes(i)?null:roles.pop(),
 location:loc
 }));

 localStorage.setItem("roundAgents",JSON.stringify(round));
 location="game.html";
};

document.getElementById("endGame").onclick = () => {

 popupBox.classList.remove("memberTheme");
 popupBox.classList.add("spyTheme");

 popupText.innerHTML = `
 <div style="margin-bottom:16px">END GAME?</div>
 <button class="start" id="confirmEnd">YES</button>
 `;

 popup.style.display="flex";

 document.getElementById("confirmEnd").onclick = () => location="index.html";
};

document.getElementById("closePopup").onclick=()=>popup.style.display="none";

}



