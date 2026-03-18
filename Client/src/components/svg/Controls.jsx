const Controls = ({ size = 18, color = "#6F6F6F" }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.125 10.5C8.36764 10.5 9.375 11.5073 9.375 12.75C9.375 13.9926 8.36764 15 7.125 15C5.88236 15 4.875 13.9926 4.875 12.75C4.875 11.5073 5.88236 10.5 7.125 10.5Z" stroke={color} strokeWidth="1.2" />
      <path d="M10.875 2.99998C9.63236 2.99998 8.625 4.00734 8.625 5.24998C8.625 6.49262 9.63236 7.49998 10.875 7.49998C12.1176 7.49998 13.125 6.49262 13.125 5.24998C13.125 4.00734 12.1176 2.99998 10.875 2.99998Z" stroke={color} strokeWidth="1.2" />
      <path d="M11.25 12.7188L16.5 12.7187" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M6.75 5.21875L1.5 5.21875" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M1.5 12.7188L3 12.7187" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M16.5 5.21875L15 5.21875" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};

export default Controls;
