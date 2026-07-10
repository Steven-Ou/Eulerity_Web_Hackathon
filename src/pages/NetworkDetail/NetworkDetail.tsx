import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { format, subDays, differenceInDays } from 'date-fns';
import Papa from 'papaparse';
import { Chart } from 'react-google-charts';

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.h1`
  font-size: 2rem;
  text-transform: capitalize;
  margin: 0;
  color: #111;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 9px 16px;
  background: ${props => props.$primary ? '#aa3bff' : '#f4f4f4'};
  color: ${props => props.$primary ? '#fff' : '#333'};
  border: ${props => props.$primary ? 'none' : '1px solid #ccc'};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const KPIStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
`;

const KPICard = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #eaeaea;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
`;

const KPILabel = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const KPIValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #111;
  margin-bottom: 8px;
`;

const KPIDelta = styled.div<{ $isPositive: boolean }>`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${props => props.$isPositive ? '#16a34a' : '#dc2626'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ChartContainer = styled.div`
  background: #fff;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #eaeaea;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
`;

const ErrorBanner = styled.div`
  background: #fee2e2;
  color: #b91c1c;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f87171;
`;

// --- COMPONENT LOGIC ---
export default function NetworkDetail() {
  const { networkId } = useParams<{ networkId: string }>();
  
  // Default Date State: 14 days ago to today
  const [startDate, setStartDate] = useState(() => format(subDays(new Date(), 13), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (start: string, end: string) => {
    setLoading(true);
    setError(null);
    try {
      // Validate 7-30 day window locally before hitting API
      const days = differenceInDays(new Date(end), new Date(start)) + 1;
      if (days < 7 || days > 30) {
        throw new Error(`Invalid Date Range. You selected ${days} days. It must be between 7 and 30 days.`);
      }

      const response = await fetch(`https://eulerity-hackathon.appspot.com/v1/metrics-insights?network=${networkId}&startDate=${start}&endDate=${end}`);
      const jsonData = await response.json();
      
      if (!response.ok) {
        throw new Error(jsonData.message || 'Failed to fetch insights');
      }

      setData(jsonData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on initial load and when network changes
  useEffect(() => {
    fetchInsights(startDate, endDate);
  }, [networkId]);

  const handleApplyDates = () => {
    fetchInsights(startDate, endDate);
  };

  const handleExportCSV = () => {
    if (!data?.metrics) return;
    // PapaParse handles turning the JSON array of metrics into a CSV string automatically
    const csvString = Papa.unparse(data.metrics);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${networkId}-export-${startDate}-to-${endDate}.csv`;
    link.click();
  };

  // Helper to render delta badges (handles inverse logic like CPC where lower is better)
  const renderDelta = (current: number, previous: number, inverseGood = false) => {
    if (!previous || previous === 0) return null;
    const diff = current - previous;
    const percentChange = (diff / previous) * 100;
    const isPositive = diff >= 0;
    // If inverseGood is true (e.g. Cost per click), a drop (negative) is marked as positive (green)
    const isFavorable = inverseGood ? !isPositive : isPositive;
    
    return (
      <KPIDelta $isPositive={isFavorable}>
        {isPositive ? '▲' : '▼'} {Math.abs(percentChange).toFixed(1)}% vs Prev Period
      </KPIDelta>
    );
  };

  return (
    <PageContainer>
      <HeaderRow>
        <Title>{networkId} Performance</Title>
        <ControlsContainer>
          <DateInput 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            max={endDate}
          />
          <span>to</span>
          <DateInput 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            min={startDate}
          />
          <Button $primary onClick={handleApplyDates}>Apply</Button>
          <Button onClick={handleExportCSV} disabled={!data || loading}>Export CSV</Button>
        </ControlsContainer>
      </HeaderRow>

      {error && <ErrorBanner><strong>Error:</strong> {error}</ErrorBanner>}
      {networkId === 'linkedin' && !error && (
         <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '20px' }}>
           Note: LinkedIn traffic naturally drops to near-zero volume on weekends.
         </p>
      )}

      {loading && <h2>Loading data...</h2>}

      {!loading && data && data.totals && (
        <>
          <KPIStrip>
            <KPICard>
              <KPILabel>Total Spend</KPILabel>
              <KPIValue>${data.totals.spend?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</KPIValue>
              {renderDelta(data.totals.spend, data.previousTotals?.spend)}
            </KPICard>
            
            <KPICard>
              <KPILabel>Total Impressions</KPILabel>
              <KPIValue>{data.totals.impressions?.toLocaleString()}</KPIValue>
              {renderDelta(data.totals.impressions, data.previousTotals?.impressions)}
            </KPICard>

            <KPICard>
              <KPILabel>Total Clicks</KPILabel>
              <KPIValue>{data.totals.clicks?.toLocaleString()}</KPIValue>
              {renderDelta(data.totals.clicks, data.previousTotals?.clicks)}
            </KPICard>

            <KPICard>
              <KPILabel>Avg. CPC</KPILabel>
              <KPIValue>${data.totals.cpc?.toFixed(2)}</KPIValue>
              {/* Note: Lower CPC is better, so inverseGood = true */}
              {renderDelta(data.totals.cpc, data.previousTotals?.cpc, true)}
            </KPICard>
          </KPIStrip>

          <ChartContainer>
            <h2>Performance Over Time</h2>
            <Chart
              chartType="LineChart"
              width="100%"
              height="400px"
              data={[
                ['Date', 'Impressions', 'Clicks'],
                ...data.metrics.map((day: any) => [
                  format(new Date(day.date), 'MMM dd'), 
                  day.impressions, 
                  day.clicks
                ])
              ]}
              options={{
                curveType: 'function',
                legend: { position: 'bottom' },
                colors: ['#aa3bff', '#16a34a'],
                chartArea: { width: '90%', height: '70%' },
                vAxis: { format: 'short' }
              }}
            />
          </ChartContainer>
        </>
      )}
    </PageContainer>
  );
}