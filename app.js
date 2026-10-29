
/* Frontend-only demonstration. Data is stored in this browser's localStorage. */
const Matchday = (() => {
  const USERS_KEY = "matchday_demo_users_v1";
  const REGS_KEY = "matchday_demo_registrations_v1";
  const SESSION_KEY = "matchday_demo_session_v1";
  const read = (key, fallback=[]) => {
    try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
    catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  let users = read(USERS_KEY, []);
  if (!users.some(u => u.role === "admin")) {
    users.push({id:"admin-demo",fullName:"Tournament Admin",rollNumber:"ADMIN",course:"Administration",email:"admin@matchday.demo",password:"admin123",role:"admin"});
    write(USERS_KEY, users);
  }
  const registrations = () => read(REGS_KEY, []);
  const saveRegistrations = value => write(REGS_KEY, value);
  const session = () => read(SESSION_KEY, null);
  const currentUser = () => {
    const s=session(); return s ? users.find(u=>u.id===s.userId) || null : null;
  };
  function register(data) {
    users=read(USERS_KEY,[]);
    if(users.some(u=>u.email.toLowerCase()===data.email.toLowerCase())) throw new Error("This email is already registered.");
    if(users.some(u=>u.rollNumber.toLowerCase()===data.rollNumber.toLowerCase())) throw new Error("This roll number is already registered.");
    const id="student-"+Date.now()+"-"+Math.random().toString(36).slice(2,7);
    users.push({...data,id,role:"student"});
    write(USERS_KEY,users);
    const regs=registrations();
    regs.push({id:"reg-"+Date.now(),userId:id,game:data.game,status:"pending",createdAt:new Date().toISOString(),team:"Not assigned yet",points:0});
    saveRegistrations(regs);
  }
  function login(email,password) {
    users=read(USERS_KEY,[]);
    const user=users.find(u=>u.email.toLowerCase()===email.toLowerCase()&&u.password===password);
    if(!user) throw new Error("Email or password is incorrect.");
    write(SESSION_KEY,{userId:user.id});
    return user;
  }
  function logout(){localStorage.removeItem(SESSION_KEY);}
  function requireRole(role) {
    const user=currentUser();
    if(!user){location.href="login.html";return null;}
    if(user.role!==role){location.href=user.role==="admin"?"admin-dashboard.html":"student-dashboard.html";return null;}
    return user;
  }
  function updateStatus(regId,status) {
    const user=currentUser();
    if(!user || user.role!=="admin") throw new Error("Admin access required.");
    const regs=registrations(), reg=regs.find(r=>r.id===regId);
    if(!reg) throw new Error("Registration not found.");
    reg.status=status; saveRegistrations(regs);
  }
  return {register,login,logout,requireRole,currentUser,registrations,updateStatus};
})();
