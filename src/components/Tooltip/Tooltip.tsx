  return (
    <div
      ref={tooltipRef}
      className={cnsMerge(
        "absolute px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg",
        "whitespace-nowrap",
        "transform -translate-x-1/2",
        "z-50",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
      <div
        className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -translate-x-1/2"
        style={{
          top: `${position.top - 4}px`,
          left: `${position.left}px`,
        }}
      />
    </div>
  ); 