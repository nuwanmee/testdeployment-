


"use client"
import styled from 'styled-components';
import { PricingPlan } from '../types';

const PricingWrapper = styled.section`
  .pricing-card {
    background: white;
    border-radius: 10px;
    padding: 2rem;
    text-align: center;
    transition: all 0.3s ease;
    margin-bottom: 2rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    &.featured {
      border: 2px solid var(--primary);
      transform: scale(1.05);
      position: relative;
      &::before {
        content: 'Most Popular';
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--primary);
        color: white;
        padding: 0.2rem 1rem;
        border-radius: 50px;
        font-size: 0.8rem;
        font-weight: 600;
      }
    }
    .price {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
      margin: 1.5rem 0;
      span {
        font-size: 1rem;
        color: var(--gray);
      }
    }
    ul {
      margin: 2rem 0;
      li {
        margin-bottom: 0.8rem;
        color: var(--gray);
        i {
          color: var(--success);
          margin-right: 0.5rem;
        }
      }
    }
    .btn {
      width: 100%;
    }
  }
`;

const Pricing = () => {
  const plans: PricingPlan[] = [
    {
      name: 'Basic',
      price: '0',
      duration: 'month',
      features: [
        'Create a profile',
        'Browse matches',
        'Send 5 interests per month',
        'Basic search filters',
        'Email support',
      ],
      featured: false,
    },
    {
      name: 'Premium',
      price: '29',
      duration: 'month',
      features: [
        'Unlimited interests',
        'Advanced search filters',
        'Priority customer support',
        'View who visited your profile',
        'Message read receipts',
        'Featured in search results',
      ],
      featured: true,
    },
    {
      name: 'Gold',
      price: '99',
      duration: '3 months',
      features: [
        'All Premium features',
        'Profile highlighted',
        'Verified badge',
        'Personalized matchmaking',
        'Exclusive events access',
        'Profile boost weekly',
      ],
      featured: false,
    },
  ];

  return (
    <PricingWrapper id="pricing" className="section">
      <div className="container">
        <h2 className="section-title">Simple, Transparent Pricing</h2>
        <p className="text-center mb-5">
          Choose the plan that works best for your journey to find your life partner
        </p>
        <div className="row">
          {plans.map((plan, index) => (
            <div key={index} className="col-md-4">
              <div
                className={`pricing-card ${plan.featured ? 'featured' : ''}`}
              >
                <h3>{plan.name}</h3>
                <div className="price">
                  ${plan.price}
                  <span>/{plan.duration}</span>
                </div>
                <ul>
                  {plan.features.map((feature, i) => (
                    <li key={i}>
                      <i className="fas fa-check"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="btn btn-primary">
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PricingWrapper>
  );
};

export default Pricing;