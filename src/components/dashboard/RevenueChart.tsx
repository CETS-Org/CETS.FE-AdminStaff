import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RevenueDataPoint {
  period: string;
  revenue: number;
  growth: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  chartType: 'bar' | 'line' | 'candlestick';
  title: string;
  className?: string;
}

export default function RevenueChart({ data, chartType, title, className = '' }: RevenueChartProps) {
  const [animatedData, setAnimatedData] = useState<number[]>(new Array(data.length).fill(0));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedData(data.map(d => d.revenue));
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatShortCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const maxValue = Math.max(...data.map(d => d.revenue));
  const minValue = Math.min(...data.map(d => d.revenue));

  if (chartType === 'bar') {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <div className="space-y-4">
          {/* Y-axis labels */}
          <div className="flex">
            <div className="w-16 relative" style={{ height: '300px' }}>
              {[0, 1, 2, 3, 4].map((i) => {
                const value = (maxValue / 4) * i;
                return (
                  <div
                    key={i}
                    className="absolute right-2 text-xs text-gray-500 font-medium"
                    style={{ bottom: `${(i / 4) * 300 - 6}px` }}
                  >
                    {formatShortCurrency(value)}
                  </div>
                );
              })}
            </div>

            {/* Chart bars */}
            <div className="flex-1 flex items-end justify-between gap-3 px-4" style={{ height: '300px' }}>
              {data.map((item, index) => {
                const height = (animatedData[index] / maxValue) * 100;
                const isHovered = hoveredIndex === index;
                
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 group cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ height: '300px' }}
                  >
                    <div className="relative w-full flex items-end justify-center" style={{ height: '300px' }}>
                      {/* Bar */}
                      <div
                        className="w-full rounded-t-lg transition-all duration-500 ease-out relative"
                        style={{
                          height: `${height}%`,
                          backgroundColor: item.growth >= 0 ? '#10B981' : '#EF4444',
                          opacity: isHovered ? 1 : 0.8,
                          transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                          minHeight: animatedData[index] > 0 ? '2px' : '0px',
                        }}
                      >
                        {/* Hover tooltip */}
                        {isHovered && (
                          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap">
                            <div className="text-xs font-medium">{item.period}</div>
                            <div className="text-sm font-bold">{formatCurrency(item.revenue)}</div>
                            <div className={`text-xs flex items-center gap-1 ${item.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {item.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {Math.abs(item.growth).toFixed(1)}%
                            </div>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* X-axis label */}
                    <div className="mt-2 text-xs font-medium text-gray-600">{item.period}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (chartType === 'line') {
    const chartHeight = 300;
    const chartWidth = 800;
    const padding = 40;
    const range = maxValue - minValue || 1;

    const points = data.map((item, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - ((item.revenue - minValue) / range) * (chartHeight - padding * 2);
      return { x, y, value: item.revenue, label: item.period, growth: item.growth };
    });

    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    
    // Area gradient
    const areaPath = `${pathData} L ${chartWidth - padding},${chartHeight - padding} L ${padding},${chartHeight - padding} Z`;

    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <div className="relative">
          <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map((i) => {
              const y = chartHeight - padding - ((i / 4) * (chartHeight - padding * 2));
              return (
                <g key={i}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {formatShortCurrency(minValue + (range / 4) * i)}
                  </text>
                </g>
              );
            })}

            {/* Area gradient */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path d={areaPath} fill="url(#areaGradient)" />

            {/* Line path */}
            <path
              d={pathData}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((point, index) => (
              <g
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredIndex === index ? 6 : 4}
                  fill="#10B981"
                  stroke="white"
                  strokeWidth="2"
                  className="transition-all duration-200"
                />
                {hoveredIndex === index && (
                  <foreignObject
                    x={point.x - 70}
                    y={point.y - 80}
                    width="140"
                    height="70"
                  >
                    <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg">
                      <div className="text-xs font-medium">{point.label}</div>
                      <div className="text-sm font-bold">{formatCurrency(point.value)}</div>
                      <div className={`text-xs flex items-center gap-1 ${point.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {point.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(point.growth).toFixed(1)}%
                      </div>
                    </div>
                  </foreignObject>
                )}
              </g>
            ))}

            {/* X-axis labels */}
            {points.map((point, index) => (
              <text
                key={index}
                x={point.x}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                className="text-xs fill-gray-600 font-medium"
              >
                {point.label}
              </text>
            ))}
          </svg>
        </div>
      </div>
    );
  }

  // Candlestick chart for revenue
  if (chartType === 'candlestick') {
    const chartHeight = 300;
    const candleWidth = 40;
    
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
        <div className="space-y-4">
          <div className="flex">
            <div className="w-16 relative" style={{ height: `${chartHeight}px` }}>
              {[0, 1, 2, 3, 4].map((i) => {
                const value = (maxValue / 4) * i;
                return (
                  <div
                    key={i}
                    className="absolute right-2 text-xs text-gray-500 font-medium"
                    style={{ bottom: `${(i / 4) * chartHeight - 6}px` }}
                  >
                    {formatShortCurrency(value)}
                  </div>
                );
              })}
            </div>

            <div className="flex-1 flex items-end justify-between gap-3 px-4" style={{ height: `${chartHeight}px` }}>
              {data.map((item, index) => {
                const prevRevenue = index > 0 ? data[index - 1].revenue : item.revenue;
                const open = prevRevenue;
                const close = item.revenue;
                const high = Math.max(open, close) * 1.05;
                const low = Math.min(open, close) * 0.95;
                
                const isPositive = close >= open;
                const openY = ((maxValue - open) / maxValue) * chartHeight;
                const closeY = ((maxValue - close) / maxValue) * chartHeight;
                const highY = ((maxValue - high) / maxValue) * chartHeight;
                const lowY = ((maxValue - low) / maxValue) * chartHeight;
                
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 relative"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="relative w-full flex items-end justify-center" style={{ height: `${chartHeight}px` }}>
                      {/* Wick (high-low line) */}
                      <div
                        className="absolute left-1/2 transform -translate-x-1/2"
                        style={{
                          top: `${highY}px`,
                          height: `${lowY - highY}px`,
                          width: '2px',
                          backgroundColor: isPositive ? '#10B981' : '#EF4444',
                        }}
                      />
                      
                      {/* Candle body */}
                      <div
                        className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-300"
                        style={{
                          top: `${Math.min(openY, closeY)}px`,
                          height: `${Math.abs(closeY - openY) || 2}px`,
                          width: `${candleWidth}px`,
                          backgroundColor: isPositive ? '#10B981' : '#EF4444',
                          border: `2px solid ${isPositive ? '#059669' : '#DC2626'}`,
                        }}
                      />

                      {/* Hover tooltip */}
                      {hoveredIndex === index && (
                        <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg z-10 whitespace-nowrap">
                          <div className="text-xs font-medium">{item.period}</div>
                          <div className="text-xs text-gray-300">Open: {formatCurrency(open)}</div>
                          <div className="text-xs text-gray-300">Close: {formatCurrency(close)}</div>
                          <div className={`text-xs flex items-center gap-1 ${item.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {item.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(item.growth).toFixed(1)}%
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-xs font-medium text-gray-600">{item.period}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


