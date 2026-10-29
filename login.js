
const form=document.getElementById("loginForm"),msg=document.getElementById("message");
form.addEventListener("submit",e=>{
 e.preventDefault();
 try{
  const user=Matchday.login(document.getElementById("email").value.trim(),document.getElementById("password").value);
  window.open(user.role==="admin"?"admin-dashboard.html":"student-dashboard.html","_blank","noopener,noreferrer");
 }catch(err){msg.hidden=false;msg.textContent=err.message;}
});
