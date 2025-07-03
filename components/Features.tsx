'use client'

import styled from 'styled-components';
import { Feature } from '../types';

const FeaturesWrapper = styled.section`
  background-color: var(--light);
  .feature-card {
    background: white;
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    margin-bottom: 2rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
    }
    .icon {
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      background-color: rgba(255, 77, 109, 0.1);
      border-radius: 50%;
      color: var(--primary);
      font-size: 2rem;
    }
    h3 {
      margin-bottom: 1rem;
    }
    p {
      color: var(--gray);
    }
  }
`;

const Features = () => {
  const features: Feature[] = [
    {
      icon: 'fas fa-heart',
      title: 'Advanced Matching',
      description:
        'Our intelligent algorithm matches you based on personality, interests, and compatibility factors.',
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Verified Profiles',
      description:
        'All profiles go through a strict verification process to ensure authenticity and safety.',
    },
    {
      icon: 'fas fa-comments',
      title: 'Private Messaging',
      description:
        'Communicate securely with your matches through our encrypted messaging system.',
    },
    {
      icon: 'fas fa-mobile-alt',
      title: 'Mobile Friendly',
      description: 'Access your matches anytime, anywhere with our mobile-optimized platform.',
    },
    {
      icon: 'fas fa-user-friends',
      title: 'Diverse Community',
      description:
        'Connect with thousands of eligible singles from different cultures and backgrounds.',
    },
    {
      icon: 'fas fa-headset',
      title: '24/7 Support',
      description:
        'Our dedicated support team is always available to assist you with any questions.',
    },
  ];

  return (
    <FeaturesWrapper id="features" className="section">
      <div className="container">
        <h2 className="section-title">Why Choose MatrimonyMatch</h2>
        <p className="text-center mb-5">
          We make finding your life partner simple, safe, and successful.
        </p>
        <div className="row">
          {features.map((feature, index) => (
            <div key={index} className="col-md-4">
              <div className="feature-card">
                <div className="icon">
                  <i className={feature.icon}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FeaturesWrapper>
  );
};

export default Features;