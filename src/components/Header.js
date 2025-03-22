import React from 'react';
import './Header.css'; // Import do arquivo de estilo
import logo from '../assets/logo.png';

function Header() {
  return (
    <header className="header">

<img src={logo} alt="Logo" className="logo" />

    </header>
  );
}

export default Header;
