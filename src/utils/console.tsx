// @ts-expect-error
import { jsonToTableHtmlString } from 'json-table-converter'
import {
  ArcElement,
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
} from 'chart.js';
import { ErrorBoundary } from "react-error-boundary";
import { Bar, Doughnut, Line, Pie, Radar } from 'react-chartjs-2';
import { ChartType, ConsoleEvent, ConsoleLogType } from "../types.d";
import { JSX } from "react";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
);

export function consoleToDivs (consoleLogs: ConsoleLogType[]): JSX.Element[] {
  return consoleLogs.map((log) => {
    const { type, args, chunkIdx: _chunkIdx, time }:ConsoleLogType = log;
    let itemKey: string = String(Date.now());
    try {
      itemKey = btoa(String(time));
    } catch(e) {
      
    }

    if (type === ConsoleEvent.Table) {
      // return <div key={itemKey} className="table-wrapper">
      //   <JtR data={args} />
      // </div>jsonToTableHtmlString
      return <div key={itemKey} className="table-wrapper" dangerouslySetInnerHTML={{__html: jsonToTableHtmlString(args)}} />;
    }

    if (type === ConsoleEvent.Chart) {
      const Charts = {
        'bar': Bar,
        'line': Line,
        'pie': Pie,
        'radar': Radar,
        'doughnut': Doughnut
      }

      const ChartComponent = Charts[args[0] as ChartType] || Charts.bar;

      return <div key={itemKey} className="chart-wrapper">
        <ErrorBoundary fallback={<></>}>
          <ChartComponent options={args[2] as any} data={args[1] as any} />
        </ErrorBoundary>
      </div>;
    }

    if (type === ConsoleEvent.Error) {
      return <pre key={itemKey} className={`console-type-${type}`}>{args.join('   ')}</pre>;
    }

    return <pre key={itemKey} className={`console-type-${type}`}>
      {args.map((a) => {
        try {
          return typeof a === 'object' ? JSON.stringify(a, undefined, 2) : a;
        } catch {
          return String(a);
        }
      }).join('   ')}
    </pre>;
  });
}

