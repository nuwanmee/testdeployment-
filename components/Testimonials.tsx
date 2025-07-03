'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Testimonial } from '../types';

const TestimonialsWrapper = styled.section`
  .testimonial-card {
    background: white;
    border-radius: 10px;
    padding: 2rem;
    margin: 1rem;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    position: relative;
    .quote {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 3rem;
      color: var(--primary-light);
      opacity: 0.2;
    }
    .content {
      margin-bottom: 1.5rem;
      color: var(--gray);
      font-style: italic;
    }
    .author {
      display: flex;
      align-items: center;
      .avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 1rem;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .info {
        h4 {
          margin-bottom: 0.2rem;
          color: var(--dark);
        }
        p {
          margin-bottom: 0;
          color: var(--gray);
          font-size: 0.9rem;
        }
      }
    }
  }

  .carousel-indicators {
    bottom: -50px;
    button {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--primary-light);
      border: none;
      &.active {
        background-color: var(--primary);
      }
    }
  }
`;

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      content:
        'I had almost given up on finding someone compatible with my lifestyle and values. MatrimonyMatch made it so easy to connect with like-minded individuals. Within 3 months, I met my soulmate!',
      name: 'Praveen & Rishmy',
      role: 'Married December 2024',
      image: '/images/testimonial1.jpg',
    },
    {
      id: 2,
      content:
        'The verification process gave me confidence that I was interacting with genuine people. The matching algorithm really understands compatibility. We are so grateful to have found each other through this platform.',
      name: 'Anuradha & Nisanasala',
      role: 'Engaged March 2025',
      image: '/images/testimonial2.jpg',
    },
    {
      id: 3,
      content:
        'As someone who was skeptical about online matrimony, I was pleasantly surprised by the quality of matches I received. The customer support team was incredibly helpful throughout my journey.',
      name: 'Sandaruwan & Shiromi',
      role: 'Married May 2025',
      image: '/images/testimonial3.jpg',
    },
  ];

  useEffect(() => {
  const interval = setInterval(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, 4000);
  return () => clearInterval(interval);
}, []);

  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex);
  };

  return (
    <TestimonialsWrapper id="testimonials" className="section">
      <div className="container">
        <h2 className="section-title">Success Stories</h2>
        <p className="text-center mb-5">
          Hear from couples who found their life partners through MatrimonyMatch
        </p>
        <div
          id="testimonialCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
        >
          <div className="carousel-inner">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`carousel-item ${index === activeIndex ? 'active' : ''}`}
              >
                <div className="testimonial-card">
                  <div className="quote">"</div>
                  <div className="content">{testimonial.content}</div>
                  <div className="author">
                    <div className="avatar">
                      <img src={testimonial.image} alt={testimonial.name} />
                    </div>
                    <div className="info">
                      <h4>{testimonial.name}</h4>
                      <p>{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="carousel-indicators">
            {testimonials.map((_, index) => (
              <button
                key={index}
                type="button"
                data-bs-target="#testimonialCarousel"
                data-bs-slide-to={index}
                className={index === activeIndex ? 'active' : ''}
                aria-current={index === activeIndex ? 'true' : 'false'}
                aria-label={`Slide ${index + 1}`}
                onClick={() => handleSelect(index)}
              ></button>
            ))}
          </div>
        </div>
      </div>
    </TestimonialsWrapper>
  );
};

export default Testimonials;