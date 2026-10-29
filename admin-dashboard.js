
const admin=Matchday.requireRole("admin");
const tbody=document.getElementById("applications"), msg=document.getElementById("message");
function render(){
 tbody.replaceChildren();
 const regs=Matchday.registrations();
 if(!regs.length){msg.hidden=false;msg.textContent="No student applications yet. Create one through Student Registration.";return;}
 msg.hidden=true;
 const users=JSON.parse(localStorage.getItem("matchday_demo_users_v1")||"[]");
 regs.forEach(reg=>{
  const u=users.find(x=>x.id===reg.userId), tr=document.createElement("tr");
  [u?.fullName||"Unknown",u?.rollNumber||"—",u?.course||"—",reg.game,reg.status].forEach(value=>{
   const td=document.createElement("td");td.textContent=value;tr.appendChild(td);
  });
  const actions=document.createElement("td");
  if(reg.status==="pending"){
   [["Approve","approved","btn-green"],["Reject","rejected",""]].forEach(([label,status,cls])=>{
    const b=document.createElement("button");b.className="action-btn "+cls;b.textContent=label;
    b.addEventListener("click",()=>{Matchday.updateStatus(reg.id,status);render();});actions.appendChild(b);
   });
  }else{actions.textContent="Reviewed";}
  tr.appendChild(actions);tbody.appendChild(tr);
 });
}
document.getElementById("logout").addEventListener("click",()=>{Matchday.logout();window.open("login.html","_blank","noopener,noreferrer");});
if(admin)render();
