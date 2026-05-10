"use client";

interface PlaceholderImageProps {
  text: string;
  className?: string;
}

export function PlaceholderImage({ text, className = "" }: PlaceholderImageProps) {
  // Generate a consistent color based on text
  const colors = [
    "from-blue-400 to-blue-600",
    "from-green-400 to-green-600",
    "from-purple-400 to-purple-600",
    "from-red-400 to-red-600",
    "from-yellow-400 to-yellow-600",
    "from-pink-400 to-pink-600",
    "from-indigo-400 to-indigo-600",
  ];
  
  const colorIndex = text.length % colors.length;
  const gradientClass = colors[colorIndex];
  
  return (
    <div className={`bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white ${className}`}>
      <div className="text-center p-4">
        <div className="text-lg font-semibold mb-1">🍽️</div>
        <div className="text-sm font-medium">{text.substring(0, 20)}</div>
      </div>
    </div>
  );
}