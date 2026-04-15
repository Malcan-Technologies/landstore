const True = ({ size = 26, color = "#414651", className = "", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M7.41667 12.6667L10.9167 16.1667L17.9167 9.16667M24.3333 12.6667C24.3333 19.11 19.11 24.3333 12.6667 24.3333C6.22334 24.3333 1 19.11 1 12.6667C1 6.22334 6.22334 1 12.6667 1C19.11 1 24.3333 6.22334 24.3333 12.6667Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default True;
