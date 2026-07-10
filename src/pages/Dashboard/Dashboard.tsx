import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import type { SummaryMetrics } from '../../types'; 

// --- STYLED COMPONENTS ---
const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 30px;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #333;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
`;

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
`;

const Card = styled.div`
  flex: 1 1 300px;
  max-width: 380px; /* Prevents cards from getting comically huge */
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const NetworkName = styled.h2`
  font-size: 1.25rem;
  text-transform: capitalize;
  margin: 0 0 20px 0;
  color: #111;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 0.95rem;
`;

const MetricLabel = styled.span`
  color: #666;
`;

const MetricValue = styled.span`
  font-weight: 600;
  color: #222;
`;

const DetailsButton = styled(Link)`
  margin-top: auto; /* Pushes button to the bottom of the card */
  padding: 10px 0;
  background: #007bff;
  color: white;
  text-decoration: none;
  text-align: center;
  border-radius: 6px;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

// --- COMPONENT LOGIC ---
export default function Dashboard() {
  // Note: Adjust the state type if the API returns an object instead of an array!
  const [data, setData] = useState<any[] | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://eulerity-hackathon.appspot.com/v1/metrics-summary')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch summary metrics');
        return res.json();
      })
      .then((jsonData) => {
        // If the backend returns an array, great. 
        // If it returns an object with network keys, we convert it to an array for easy mapping.
        const formattedData = Array.isArray(jsonData) 
          ? jsonData 
          : Object.keys(jsonData).map(key => ({ network: key, ...jsonData[key] }));
          
        setData(formattedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <DashboardContainer><h2>Loading dashboard...</h2></DashboardContainer>;
  if (error) return <DashboardContainer><h2 style={{ color: 'red' }}>Error: {error}</h2></DashboardContainer>;

  return (
    <DashboardContainer>
      <Header>
        <Title>Platform Overview</Title>
        <Subtitle>30-Day Rolling Performance</Subtitle>
      </Header>
      
      <Grid>
        {data?.map((platform, index) => {
          // Normalize the network ID to map 'facebook' and 'instagram' to the '/meta' route
          const routeId = (platform.network === 'facebook' || platform.network === 'instagram') 
            ? 'meta' 
            : platform.network;

          return (
            <Card key={index}>
              <NetworkName>{platform.network}</NetworkName>
              
              <MetricRow>
                <MetricLabel>Spend</MetricLabel>
                {/* Format as currency */}
                <MetricValue>${platform.spend?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</MetricValue>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Impressions</MetricLabel>
                <MetricValue>{platform.impressions?.toLocaleString()}</MetricValue>
              </MetricRow>
              
              <MetricRow>
                <MetricLabel>Clicks</MetricLabel>
                <MetricValue>{platform.clicks?.toLocaleString()}</MetricValue>
              </MetricRow>

              <DetailsButton to={`/${routeId}`}>
                View {platform.network} Details
              </DetailsButton>
            </Card>
          );
        })}
      </Grid>
    </DashboardContainer>
  );
}