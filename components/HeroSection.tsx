"use client";

import styled from "styled-components";
import Link from "next/link";

const HeroWrapper = styled.section`
  background: linear-gradient(#6a6ca7, #464989),
    url("/images/hero-bg") no-repeat center center/cover;
  min-height: 100vh;
  display: flex;
  align-items: center;
  color: white;
  padding-top: 80px;
  overflow: hidden;

  .hero-content {
    position: relative;
    z-index: 2;
    
    h1 {
      font-size: clamp(2.5rem, 5vw, 3.5rem);
      margin-bottom: 1.5rem;
      line-height: 1.2;
      span {
        color: var(--primary);
      }
    }
    p {
      font-size: clamp(1rem, 2vw, 1.2rem);
      margin-bottom: 2rem;
      opacity: 0.9;
    }
  }

  // .hero-image {
  //   width: 100%;
  //   height: auto;
  //   max-height: 700px;
  //   object-fit: contain;
  //   transform: scale(1);
  //   transform-origin: bottom right;

  //   @media (max-width: 768px) {
  //     transform: scale(1);
  //     margin-top: 2rem;
  //   }
  // }

// .hero-image {
//     width: 100%;
//     height: auto;
//     max-height: 700px;
//     object-fit: contain;
//     transform: scale(1);
//     transform-origin: bottom right;
//     box-shadow: 
//         inset 0 0 15px rgba(106, 108, 167, 0.3), /* Inner glow */
//         0 5px 20px rgba(0, 0, 0, 0.1); /* Soft outer shadow */

//     @media (max-width: 768px) {
//         transform: scale(1);
//         margin-top: 2rem;
//         box-shadow: 
//             inset 0 0 10px rgba(106, 108, 167, 0.2),
//             0 3px 10px rgba(0, 0, 0, 0.1);
//     }
// }

// .hero-image {
//     position: relative;
//     width: 100%;
//     height: auto;
//     max-height: 700px;
//     object-fit: contain;
//     transform: scale(1);
//     transform-origin: bottom right;

//     &::after {
//         content: '';
//         position: absolute;
//         top: 0;
//         left: 0;
//         right: 0;
//         bottom: 0;
//         background: linear-gradient(
//             to bottom,
//             transparent 85%,
//             rgba(106, 108, 167, 0.7) 100%
//         );
//         pointer-events: none;
//     }

//     @media (max-width: 768px) {
//         transform: scale(1);
//         margin-top: 2rem;
//     }
// }


.hero-image {
    width: 100%;
    height: auto;
    max-height: 700px;
    object-fit: contain;
    transform: scale(1);
    transform-origin: bottom right;
    filter: drop-shadow(0 0 10px rgba(106, 108, 167, 0.5)); /* Matches the gradient */
    // mix-blend-mode: lighten; /* Helps blend with the background */
    opacity: 1; /* Slight transparency for smoother blending */

    @media (max-width: 768px) {
        transform: scale(1);
        margin-top: 2rem;
        filter: drop-shadow(0 0 5px rgba(106, 108, 167, 0.3)); /* Smaller shadow on mobile */
    }
}

  .btn-primary {
    background-color: #c9607e;
    border-color: #c9607e;
    &:hover {
      background-color: #b54f6d;
      border-color: #b54f6d;
    }
  }

  .btn-outline-light {
    color: #dd90a6;
    border-color: #dd90a6;
    &:hover {
      color: #fff;
      background-color: rgba(221, 144, 166, 0.1);
      border-color: #dd90a6;
    }
  }
`;

export default function HeroSection() {
  return (
    <HeroWrapper id="home">
      <div className="container">
        <div className="row align-items-center">
          {/* <div className="col-lg-6 col-md-10 order-lg-1 order-2">
            <div className="hero-content">
              <h1 className="display-4 fw-bold mb-4">
                Find Your Perfect <span>Life Partner</span>
              </h1>
              <p className="lead mb-4">
                Join thousands of happy couples who found their soulmates through
                our advanced matching algorithm. Start your journey to forever
                today.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link href="/register" className="btn btn-primary px-4 py-3 fs-5">
                  Create Free Profile
                </Link>
                <Link
                  href="#features"
                  className="btn btn-outline-light px-4 py-3 fs-5"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div> */}
          <div className="col-lg-12 order-lg-2 order-1">
            <img
              src="hero-img.png"
              className="hero-image img-fluid"
              alt="Happy Couple"
              loading="eager"
            />
          </div>
        </div>
               <div className="col-lg-6 col-md-10 order-lg-1 order-2">
            <div className="hero-content">
              <h1 className="display-4 fw-bold mb-4">
                Find Your Perfect <span>Life Partner</span>
              </h1>
              <p className="lead mb-4">
                Join thousands of happy couples who found their soulmates through
                our advanced matching algorithm. Start your journey to forever
                today.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link href="/register" className="btn btn-primary px-4 py-3 fs-5">
                  Create Free Profile
                </Link>
                <Link
                  href="#features"
                  className="btn btn-outline-light px-4 py-3 fs-5"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
      </div>
    </HeroWrapper>
  );
}