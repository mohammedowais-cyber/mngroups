import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

interface TrendChartProps {
  trend: Array<{ label: string; raised: number; closed: number }>;
}

export const TrendChart: React.FC<TrendChartProps> = ({ trend }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new ChartJS(ctx, {
      type: 'line',
      data: {
        labels: trend.map(t => t.label),
        datasets: [
          {
            label: 'Raised',
            data: trend.map(t => t.raised),
            borderColor: '#B37A1C',
            backgroundColor: 'rgba(179, 122, 28, 0.08)',
            tension: 0.35,
            fill: true,
            pointRadius: 3
          },
          {
            label: 'Closed',
            data: trend.map(t => t.closed),
            borderColor: '#347A5C',
            backgroundColor: 'rgba(52, 122, 92, 0.08)',
            tension: 0.35,
            fill: true,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 8,
              usePointStyle: true,
              font: { size: 11 }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, font: { size: 11 } },
            grid: { color: 'rgba(130, 142, 163, 0.15)' }
          },
          x: {
            ticks: { font: { size: 11 } },
            grid: { display: false }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [trend]);

  return <canvas ref={canvasRef} />;
};

interface CategoryChartProps {
  categories: Array<{ id: string; name: string; emoji: string; count: number }>;
}

const PALETTE = ['#2F6BA6', '#B37A1C', '#347A5C', '#6E5A9E', '#B14B41', '#177A82', '#B8902E', '#4B5468', '#7A8296', '#2E4372', '#98741F'];

export const CategoryChart: React.FC<CategoryChartProps> = ({ categories }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  const activeCats = categories.filter(c => c.count > 0);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: activeCats.map(c => c.name),
        datasets: [
          {
            data: activeCats.map(c => c.count),
            backgroundColor: activeCats.map((_, i) => PALETTE[i % PALETTE.length]),
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: { display: false }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [categories]);

  return (
    <div>
      <div className="chart-wrap">
        <canvas ref={canvasRef} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
        {activeCats.map((c, i) => (
          <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--ink-600)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: PALETTE[i % PALETTE.length] }} />
            {c.name} ({c.count})
          </span>
        ))}
      </div>
    </div>
  );
};
