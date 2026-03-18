const Mic = ({ size = 18, color = "#6F6F6F" }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.5 6C4.5 3.51472 6.51472 1.5 9 1.5C11.4853 1.5 13.5 3.51472 13.5 6V9.75C13.5 12.2353 11.4853 14.25 9 14.25C6.51472 14.25 4.5 12.2353 4.5 9.75V6Z" stroke={color} strokeWidth="1.2" />
      <path d="M7.5 4.875C7.5 4.875 7.85455 4.5 9 4.5C10.1455 4.5 10.5 4.875 10.5 4.875" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M7.5 7.125C7.5 7.125 7.85455 6.75 9 6.75C10.1455 6.75 10.5 7.125 10.5 7.125" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M15.75 8.25V9.75C15.75 13.4779 12.7279 16.5 9 16.5C5.27208 16.5 2.25 13.4779 2.25 9.75V8.25" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};

export default Mic;
