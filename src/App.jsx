import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom'

function App() {

  const navLinks = [
    { name: 'แดชบอร์ด', path: '/' },
    { name: 'นักเรียน', path: '/students' },
    { name: 'ครู', path: '/teachers' },
    { name: 'ห้องเรียน', path: '/classroom' },
    { name: 'วิชาเรียน', path: '/subjects' },
    { name: 'กิจกรรม', path: '/activities' },
    { name: 'การเข้าเรียน', path: '/attendances' },
    { name: 'คำร้อง', path: '/leavereq' },
    { name: 'ตั้งค่า', path: '/settings' },
  ]

  function openMenu() {
    document.querySelector('header').classList.toggle('active').classList.toggle('close')
  }

  return (
    <>
      <header className='bg- sticky left-0 top-0 md:bottom-0 md:fixed md:w-56 h-14 md:h-full'>
        <div className='p-2 md:p-3 text-white bg-slate-400 flex sm:block justify-between h-14'>
          <div id='toggle' className='sm:hidden' onClick={openMenu}>menu</div>
          <h1 className='text-center md:text-left'>ระบบจัดการโรงเรียน</h1>
          <div className='sm:hidden'>ออกจากระบบ</div>
        </div>
          <nav className='md:p-3'>
            <ul className='grid grid-cols-5 gap-3 md:flex md:flex-col md:gap-4'>
              {navLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className='md:block text-white hover:bg-slate-400 sub'>{link.name}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <button className='p-2 md:p-3 hidden md:block'>ออกจากระบบ</button>
      </header>
      <main className='md:ml-56'>
        <Outlet />
      </main>
    </>
  )
}

export default App
