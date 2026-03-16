import React from "react";

const Chat = ({ size = 18, color = "white", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M6 9H6.00675M8.99325 9H9M11.9933 9H12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 10.1998 1.78171 11.3337 2.2826 12.3394C2.4157 12.6066 2.46001 12.912 2.38284 13.2005L1.93613 14.87C1.74222 15.5947 2.40526 16.2578 3.13001 16.0639L4.79954 15.6172C5.08795 15.54 5.39341 15.5843 5.66065 15.7174C6.66627 16.2183 7.80024 16.5 9 16.5Z"
      stroke={color}
      strokeWidth="1.2"
    />
  </svg>
);

export default Chat;
