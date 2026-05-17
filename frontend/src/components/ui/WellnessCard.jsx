export default function WellnessCard({
  children,
  className = ''
}) {
  return (
    <div className={`panel ${className}`}>
      {children}
    </div>
  );
}