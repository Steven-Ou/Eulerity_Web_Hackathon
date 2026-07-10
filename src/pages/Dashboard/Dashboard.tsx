import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import type { SummaryMetrics } from "../../types";

// --- PREMIUM STYLED COMPONENTS ---
const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const HeroBanner = styled.div`
  background: linear-gradient(135deg, #aa3bff 0%, #6366f1 100%);
  border-radius: 16px;
  padding: 40px 30px;
  color: white;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(170, 59, 255, 0.2);
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  color: white;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  margin: 0;
  opacity: 0.9;
`;

const Grid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
`;

const Card = styled.div`
  flex: 1 1 calc(33.333% - 24px);
  min-width: 300px;
  max-width: 380px;
  background: #ffffff;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  }
`;

const NetworkHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 2px solid #f8fafc;
  padding-bottom: 16px;
`;

const NetworkIcon = styled.div`
  font-size: 1.8rem;
`;

const NetworkName = styled.h2`
  font-size: 1.4rem;
  text-transform: capitalize;
  margin: 0;
  color: #0f172a;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  align-items: center;
`;

const MetricLabel = styled.span`
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 500;
`;

const MetricValue = styled.span`
  font-weight: 700;
  color: #0f172a;
  font-size: 1.1rem;
`;

const DetailsButton = styled(Link)`
  margin-top: auto;
  padding: 12px 0;
  background: #f1f5f9;
  color: #4f46e5;
  text-decoration: none;
  text-align: center;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #4f46e5;
    color: white;
  }
`;

// Platform Icon Helper
const getIcon = (network: string) => {
  if (network === "facebook") return "📘";
  if (network === "instagram") return "📸";
  if (network === "google") return "🔍";
  if (network === "linkedin") return "💼";
  return "📊";
};

// --- COMPONENT LOGIC ---
export default function Dashboard() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://eulerity-hackathon.appspot.com/v1/metrics-summary")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch summary metrics");
        return res.json();
      })
      .then((jsonData) => {
        // 1. Define the whitelist for the standard networks
        const allowedNetworks = ["google", "linkedin"];

        // 2. Map the standard networks
        const formattedData = Object.keys(jsonData)
          .filter((key) => allowedNetworks.includes(key.toLowerCase()))
          .map((key) => ({ network: key, ...jsonData[key] }));

        // 3. Manually construct and push the Meta card if data exists
        if (jsonData["facebook"] || jsonData["instagram"]) {
          formattedData.push({
            network: "meta",
            spend:
              (jsonData["facebook"]?.spend || 0) +
              (jsonData["instagram"]?.spend || 0),
            impressions:
              (jsonData["facebook"]?.impressions || 0) +
              (jsonData["instagram"]?.impressions || 0),
            clicks:
              (jsonData["facebook"]?.clicks || 0) +
              (jsonData["instagram"]?.clicks || 0),
          });
        }

        // 4. Finally, set the state with the fully prepared array
        setData(formattedData);
        setLoading(false);
      });
  }, []);

  return (
    <DashboardContainer>
      <HeroBanner>
        <HeroTitle>Campaign Overview</HeroTitle>
        <HeroSubtitle>Real-time 30-Day Rolling Performance</HeroSubtitle>
      </HeroBanner>

      {loading && <h2 style={{ textAlign: "center" }}>Loading data...</h2>}
      {error && (
        <h2 style={{ color: "red", textAlign: "center" }}>Error: {error}</h2>
      )}

      <Grid>
        {data?.map((platform, index) => {
          const routeId =
            platform.network === "facebook" || platform.network === "instagram"
              ? "meta"
              : platform.network;

          return (
            <Card key={index}>
              <NetworkHeader>
                <NetworkIcon>{getIcon(platform.network)}</NetworkIcon>
                <NetworkName>{platform.network}</NetworkName>
              </NetworkHeader>

              <MetricRow>
                <MetricLabel>Total Spend</MetricLabel>
                <MetricValue>
                  $
                  {platform.spend?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </MetricValue>
              </MetricRow>

              <MetricRow>
                <MetricLabel>Impressions</MetricLabel>
                <MetricValue>
                  {platform.impressions?.toLocaleString()}
                </MetricValue>
              </MetricRow>

              <MetricRow>
                <MetricLabel>Clicks</MetricLabel>
                <MetricValue>{platform.clicks?.toLocaleString()}</MetricValue>
              </MetricRow>

              <DetailsButton to={`/${routeId}`}>
                View {platform.network} Details &rarr;
              </DetailsButton>
            </Card>
          );
        })}
      </Grid>
    </DashboardContainer>
  );
}
