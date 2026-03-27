"use client";

import React from "react";

const Profile = ({ size = 27, color = "#717680", className, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 27 27"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M22.5 23.625C22.5 22.055 22.5 21.27 22.3062 20.6312C21.87 19.193 20.7445 18.0675 19.3063 17.6313C18.6675 17.4375 17.8825 17.4375 16.3125 17.4375H10.6875C9.11749 17.4375 8.33249 17.4375 7.69372 17.6313C6.25551 18.0675 5.13005 19.193 4.69377 20.6312C4.5 21.27 4.5 22.055 4.5 23.625M18.5625 8.4375C18.5625 11.2334 16.2959 13.5 13.5 13.5C10.7041 13.5 8.4375 11.2334 8.4375 8.4375C8.4375 5.64156 10.7041 3.375 13.5 3.375C16.2959 3.375 18.5625 5.64156 18.5625 8.4375Z"
      stroke={color}
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Profile;
