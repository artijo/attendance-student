function Login() {
  return (
    <div className="max-w-80">
      <h1>เข้าสู่ระบบ</h1>
<div>
  <label htmlFor="username" className="block text-sm font-medium text-gray-700"> Email </label>
  <input
    type="text"
    id="username"
    placeholder="username@mail.com"
    className="mt-1 w-full h-10 rounded-md border-gray-200 shadow-sm sm:text-sm"
  />
  <label htmlFor="password" className="block text-sm font-medium text-gray-700"> Password </label>
  <input
    type="password"
    id="password"
    className="mt-1 w-full h-10 rounded-md border-gray-200 shadow-sm sm:text-sm"
  />
</div>
    </div>
  );
}
export default Login;