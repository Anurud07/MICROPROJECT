
const user=Matchday.requireRole("student");
const msg=document.getElementById("message");
if(user){
 document.getElementById("welcome").textContent=`Welcome, ${user.fullName} · Roll No. ${user.rollNumber} · ${user.course}`;
 const reg=Matchday.registrations().find(r=>r.userId===user.id);
 if(reg){
  document.getElementById("game").textContent=reg.game;
  document.getElementById("status").textContent=reg.status[0].toUpperCase()+reg.status.slice(1);
  document.getElementById("regDate").textContent="Submitted: "+new Date(reg.createdAt).toLocaleString();
  document.getElementById("team").textContent=reg.team||"Not assigned yet";
  document.getElementById("points").textContent=reg.points??0;
  document.getElementById("participation").textContent=`You selected ${reg.game}. Registration status: ${reg.status}.`;
 }else{msg.hidden=false;msg.textContent="No game registration found for this account.";}
}
document.getElementById("logout").addEventListener("click",()=>{Matchday.logout();window.open("login.html","_blank","noopener,noreferrer");});
