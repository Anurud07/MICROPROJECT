
const form=document.getElementById("registerForm"), msg=document.getElementById("message");
form.addEventListener("submit",e=>{
 e.preventDefault();
 try{
  Matchday.register({
   fullName:document.getElementById("fullName").value.trim(),
   rollNumber:document.getElementById("rollNumber").value.trim(),
   course:document.getElementById("course").value.trim(),
   email:document.getElementById("email").value.trim(),
   password:document.getElementById("password").value,
   game:document.getElementById("game").value
  });
  msg.hidden=false;msg.textContent="Registration submitted successfully! Status: Pending admin approval. You can now log in.";
  form.reset();
 }catch(err){msg.hidden=false;msg.textContent=err.message;}
});
