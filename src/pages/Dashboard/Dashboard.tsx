import { useEffect, useState } from 'react';
import { SummaryMetrics } from '../../types';

export default function Dashboard() {
  const [data, setData] = useState<SummaryMetrics[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // The backend computes the 30-day window automatically for this endpoint
    fetch('https://eulerity-hackathon.appspot.com/v1/metrics-summary')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch summary metrics');
        return res.json();
      })
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Dashboard Overview</h1>
      <p>Data successfully fetched! Check the console or see the raw output below.</p>
      
      {/* Temporary raw JSON dump just to verify the connection */}
      <pre style={{ background: '#eee', padding: '10px' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}