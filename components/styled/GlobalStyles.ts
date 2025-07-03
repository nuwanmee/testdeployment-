// import { createGlobalStyle } from 'styled-components';

// export const GlobalStyles = createGlobalStyle`
//   :root {
//     --primary: #ff4d6d;
//     --primary-light: #ff758f;
//     --primary-dark: #c9184a;
//     --secondary: #4361ee;
//     --dark: #212529;
//     --light: #f8f9fa;
//     --gray: #6c757d;
//     --success: #2ecc71;
//   }

//   * {
//     margin: 0;
//     padding: 0;
//     box-sizing: border-box;
//   }

//   html {
//     scroll-behavior: smooth;
//   }

//   body {
//     font-family: 'Poppins', sans-serif;
//     color: var(--dark);
//     line-height: 1.6;
//     overflow-x: hidden;
//   }

//   h1, h2, h3, h4, h5, h6 {
//     font-weight: 700;
//     line-height: 1.2;
//     margin-bottom: 1rem;
//   }

//   a {
//     text-decoration: none;
//     color: inherit;
//   }

//   ul {
//     list-style: none;
//   }

//   img {
//     max-width: 100%;
//     height: auto;
//   }

//   .container {
//     width: 100%;
//     padding-right: 15px;
//     padding-left: 15px;
//     margin-right: auto;
//     margin-left: auto;
//   }

//   @media (min-width: 576px) {
//     .container {
//       max-width: 540px;
//     }
//   }

//   @media (min-width: 768px) {
//     .container {
//       max-width: 720px;
//     }
//   }

//   @media (min-width: 992px) {
//     .container {
//       max-width: 960px;
//     }
//   }

//   @media (min-width: 1200px) {
//     .container {
//       max-width: 1140px;
//     }
//   }

//   .btn {
//     display: inline-block;
//     font-weight: 400;
//     text-align: center;
//     white-space: nowrap;
//     vertical-align: middle;
//     user-select: none;
//     border: 1px solid transparent;
//     padding: 0.5rem 1.5rem;
//     font-size: 1rem;
//     line-height: 1.5;
//     border-radius: 50px;
//     transition: all 0.3s ease;
//     cursor: pointer;
//   }

//   .btn-primary {
//     background-color: var(--primary);
//     color: white;
//     &:hover {
//       background-color: var(--primary-dark);
//       transform: translateY(-2px);
//       box-shadow: 0 5px 15px rgba(255, 77, 109, 0.3);
//     }
//   }

//   .btn-outline-primary {
//     background-color: transparent;
//     color: var(--primary);
//     border: 1px solid var(--primary);
//     &:hover {
//       background-color: var(--primary);
//       color: white;
//     }
//   }

//   .section {
//     padding: 5rem 0;
//   }

//   .section-title {
//     font-size: 2.5rem;
//     margin-bottom: 2rem;
//     text-align: center;
//     position: relative;
//     &:after {
//       content: '';
//       position: absolute;
//       bottom: -10px;
//       left: 50%;
//       transform: translateX(-50%);
//       width: 80px;
//       height: 4px;
//       background-color: var(--primary);
//       border-radius: 2px;
//     }
//   }

//   .text-center {
//     text-align: center;
//   }
// `;



'use client';

import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --primary: #ff4d6d;
    --primary-light: #ff758f;
    --primary-dark: #c9184a;
    --secondary: #4361ee;
    --dark: #212529;
    --light: #f8f9fa;
    --gray: #6c757d;
    --success: #2ecc71;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    font-family: 'Poppins', sans-serif;
    color: var(--dark);
    line-height: 1.6;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  ul {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  .container {
    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
  }

  @media (min-width: 576px) {
    .container {
      max-width: 540px;
    }
  }

  @media (min-width: 768px) {
    .container {
      max-width: 720px;
    }
  }

  @media (min-width: 992px) {
    .container {
      max-width: 960px;
    }
  }

  @media (min-width: 1200px) {
    .container {
      max-width: 1140px;
    }
  }

  .btn {
    display: inline-block;
    font-weight: 400;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 50px;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .btn-primary {
    background-color: var(--primary);
    color: white;
    &:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 77, 109, 0.3);
    }
  }

  .btn-outline-primary {
    background-color: transparent;
    color: var(--primary);
    border: 1px solid var(--primary);
    &:hover {
      background-color: var(--primary);
      color: white;
    }
  }

  .section {
    padding: 5rem 0;
  }

  .section-title {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    text-align: center;
    position: relative;
    &:after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 4px;
      background-color: var(--primary);
      border-radius: 2px;
    }
  }

  .text-center {
    text-align: center;
  }
`;