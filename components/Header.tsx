'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { NavLink } from '../types';

const HeaderWrapper = styled.header<{ scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: all 0.3s ease;
  padding: 1rem 0;
  background-color: ${({ scrolled }) => (scrolled ? 'white' : 'transparent')};
  box-shadow: ${({ scrolled }) => (scrolled ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none')};

  .navbar-brand {
    font-size: 1.8rem;
    font-weight: 700;
    color: ${({ scrolled }) => (scrolled ? 'var(--primary)' : 'white')};
    span {
      color: var(--secondary);
    }
  }

  .nav-link {
    color: ${({ scrolled }) => (scrolled ? 'var(--dark)' : 'white')};
    font-weight: 500;
    margin: 0 0.5rem;
    padding: 0.5rem 1rem;
    transition: all 0.3s ease;
    &:hover {
      color: var(--primary);
    }
  }

  .btn-outline-primary {
    border-color: ${({ scrolled }) => (scrolled ? 'var(--primary)' : 'white')};
    color: ${({ scrolled }) => (scrolled ? 'var(--primary)' : 'white')};
    &:hover {
      background-color: ${({ scrolled }) => (scrolled ? 'var(--primary)' : 'white')};
      color: ${({ scrolled }) => (scrolled ? 'white' : 'var(--primary)')};
    }
  }
`;

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: NavLink[] = [
    { name: 'Home', link: '#home' },
    { name: 'Features', link: '#features' },
    { name: 'Success Stories', link: '#testimonials' },
    { name: 'Pricing', link: '#pricing' },
  ];

  return (
    <HeaderWrapper scrolled={scrolled}>
      <div className="container">
        <nav className="navbar navbar-expand-lg ">
          <Link href="/" className="navbar-brand">
            <img
              src="/title-logo.svg"
              alt="MaytrimonyMatch Logo"
              style={{
                height: '30px', // adjust as needed
                width: 'auto',
                marginRight: '10px',
                verticalAlign: 'middle'
              }}
            />
            Matrimony<span>Match</span>
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {navLinks.map((link, index) => (
                <li key={index} className="nav-item">
                  <Link href={link.link} className="nav-link">
                    {link.name}
                  </Link>
                </li>
              ))}
              <li className="nav-item ms-lg-3">
                <Link href="/login" className="btn btn-outline-primary">
                  Login
                </Link>
              </li>
              <li className="nav-item ms-lg-2">

                <Link href="/register" className="btn btn-primary" style={{ backgroundColor: '#c9607e', borderColor: '#c9607e' }}>
                  Register
                </Link>

              </li>
            </ul>
          </div>
        </nav>
      </div>
    </HeaderWrapper>


  );
};

export default Header;