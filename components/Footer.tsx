'use client'

import styled from 'styled-components';
import Link from 'next/link';
import { NavLink } from '../types';

const FooterWrapper = styled.footer`
  background-color: #464989;
  color: white;
  padding: 4rem 0 2rem;
  .footer-logo {
    color:#edb1c4;
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    display: inline-block;
   
  }
  .footer-about {
    p {
      opacity: 0.8;
      margin-bottom: 1.5rem;
    }
      .footer-logo {

}
    .social-links {
      a {
      
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: rgba(230, 214, 214, 0.1);
        border-radius: 50%;
        margin-right: 1rem;
        color: white;
        transition: all 0.3s ease;
        &:hover {
          background-color: var(--primary);
          transform: translateY(-3px);
        }
      }
    }
  }
  .footer-links {
    h3 {
    
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
      position: relative;
      padding-bottom: 0.8rem;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 40px;
        height: 2px;
        background-color: var(--primary);
      }
    }
    ul {
      li {
        margin-bottom: 0.8rem;
        a {
          opacity: 0.8;
          transition: all 0.3s ease;
          &:hover {
            opacity: 1;
            color: var(--primary);
            padding-left: 5px;
          }
        }
      }
    }
  }
  .footer-newsletter {
    h3 {
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
      position: relative;
      padding-bottom: 0.8rem;
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 40px;
        height: 2px;
        background-color: var(--primary);
      }
    }
    p {
      opacity: 0.8;
      margin-bottom: 1.5rem;
    }
    .newsletter-form {
      display: flex;
      input {
        flex: 1;
        padding: 0.8rem 1rem;
        border: none;
        border-radius: 50px 0 0 50px;
        outline: none;
      }
      button {
        padding: 0 1.5rem;
        background-color: var(--primary);
        color: white;
        border: none;
        border-radius: 0 50px 50px 0;
        cursor: pointer;
        transition: all 0.3s ease;
        &:hover {
          background-color: var(--primary-dark);
        }
      }
    }
  }
  .footer-bottom {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    p {
      opacity: 0.7;
      font-size: 0.9rem;
      margin-bottom: 0;
    }
  }
`;

const Footer = () => {
  const quickLinks: NavLink[] = [
    { name: 'Home', link: '#home' },
    { name: 'About Us', link: '#about' },
    { name: 'Features', link: '#features' },
    { name: 'Success Stories', link: '#testimonials' },
    { name: 'Pricing', link: '#pricing' },
  ];

  const supportLinks: NavLink[] = [
    { name: 'FAQ', link: '/faq' },
    { name: 'Privacy Policy', link: '/privacy' },
    { name: 'Terms & Conditions', link: '/terms' },
    { name: 'Contact Us', link: '/contact' },
    { name: 'Help Center', link: '/help' },
  ];

  return (
    <FooterWrapper>
      <div className="container">
        <div className="row">
          <div className="col-lg-4 mb-5 mb-lg-0">
            <div className="footer-about">
               <img 
    src="/title-logo.svg" 
    alt="MatrimonyMatch Logo"
    style={{
      height: '30px', // adjust as needed
      width: 'auto',
      marginRight: '10px',
      verticalAlign: 'middle'
    }}
  />
              <Link href="/" className="footer-logo">
                MatrimonyMatch
              </Link>
              <p>
                We are committed to helping you find your perfect life partner
                through our advanced matching technology and personalized
                approach.
              </p>
              <div className="social-links">
                <a href="#">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 mb-5 mb-md-0">
            <div className="footer-links">
              <h3>Quick Links</h3>
              <ul>
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.link} style={{ color: '#edb1c4' }}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-2 col-md-6 mb-5 mb-md-0">
            <div className="footer-links">
              <h3>Support</h3>
              <ul>
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.link} style={{ color: '#edb1c4' }}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="footer-newsletter">
              <h3>Newsletter</h3>
              <p>
                Subscribe to our newsletter to get updates on new features and
                success stories.
              </p>
              <form className="newsletter-form">
                <input type="email" placeholder="Nuwanmee@gmail.com" />
                <button type="submit">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="footer-bottom text-center">
              <p>
                &copy; {new Date().getFullYear()} MatrimonyMatch. All Rights
                Reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </FooterWrapper>
  );
};

export default Footer;