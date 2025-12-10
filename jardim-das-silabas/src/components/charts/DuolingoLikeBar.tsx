import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  ChartOptions,
  ChartData
} from 'chart.js';
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

import tokens from '../../../design/tokens/lovable.tokens.json';

type Props = {
  labels?: string[];
  values?: number[];
};

const roundedBarPlugin = {
  id: 'roundedBar',
  beforeDraw: (chart: any) => {
    const ctx = chart.ctx;
    chart.data.datasets.forEach((dataset: any, i: number) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((bar: any) => {
        const radius = parseInt((tokens as any).radii?.md || '8', 10);
        const { x, y, base, width } = bar;
        const left = x - width / 2;
        const right = x + width / 2;
        ctx.save();
        ctx.fillStyle = dataset.backgroundColor || '#22C55E';
        ctx.beginPath();
        ctx.moveTo(left, base);
        ctx.lineTo(left, y + radius);
        ctx.quadraticCurveTo(left, y, left + radius, y);
        ctx.lineTo(right - radius, y);
        ctx.quadraticCurveTo(right, y, right, y + radius);
        ctx.lineTo(right, base);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    });
  }
};

export default function DuolingoLikeBar({ labels = [], values = [] }: Props) {
  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'XP',
        data: values,
        backgroundColor: (tokens as any)?.colors?.brand || '#22C55E'
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    animation: { duration: 700, easing: 'easeOutQuart' },
    plugins: { tooltip: { enabled: true, mode: 'index', intersect: false } },
    scales: { x: { grid: { display: false } }, y: { display: false } },
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div style={{ height: 220 }}>
      <Bar data={data} options={options} plugins={[roundedBarPlugin]} />
    </div>
  );
}
