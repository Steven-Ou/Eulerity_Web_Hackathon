import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { format, subDays, differenceInDays } from "date-fns";
import Papa from "papaparse";
import { Chart } from "react-google-charts";

// --- STYLED COMPONENTS ---
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
`;

const Title = styled.h1`
  font-size: 2.2rem;
  text-transform: capitalize;
  margin: 0;
  color: #0f172a;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

const DateInput = styled.input`
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  &:focus {
    border-color: #aa3bff;
  }
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  background: ${(props) => (props.$primary ? "#aa3bff" : "#f1f5f9")};
  color: ${(props) => (props.$primary ? "#fff" : "#333")};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.8;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const KPIStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const KPICard = styled.div`
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border-left: 4px solid #aa3bff;
`;

const KPILabel = styled.div`
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const KPIValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #0f172a;
  margin-bottom: 8px;
`;

const KPIDelta = styled.div<{ $isPositive: boolean }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${(props) => (props.$isPositive ? "#16a34a" : "#dc2626")};
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${(props) => (props.$isPositive ? "#dcfce7" : "#fee2e2")};
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-flex;
`;

const ChartContainer = styled.div`
  background: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  margin-bottom: 30px;
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

  const [startDate, setStartDate] = useState(() =>
    format(subDays(new Date(), 13), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd"),
  );
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (start: string, end: string) => {
    if (!networkId) return;
    setLoading(true);
    setError(null);
    try {
      const days = differenceInDays(new Date(end), new Date(start)) + 1;
      if (days < 7 || days > 30) {
        throw new Error(`Invalid Range (${days} days). Must be 7 to 30 days.`);
      }

      const response = await fetch(
        `https://eulerity-hackathon.appspot.com/v1/metrics-insights?network=${networkId}&startDate=${start}&endDate=${end}`,
      );
      const jsonData = await response.json();

      if (!response.ok) {
        throw new Error(jsonData.message || "Failed to fetch insights");
      }

      setData(jsonData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights(startDate, endDate);
  }, [networkId]);

  const getDailyData = () => {
    if (!data) return [];

    if (networkId === "meta") {
      const fb = data.dailyData?.facebook || [];
      const ig = data.dailyData?.instagram || [];

      // Combine arrays by date
      return fb.map((fbDay: any, index: number) => ({
        date: fbDay.date,
        impressions: fbDay.impressions + (ig[index]?.impressions || 0),
        clicks: fbDay.clicks + (ig[index]?.clicks || 0),
      }));
    }

    return data.metrics || data.daily || data.data || [];
  };

  const dailyData = getDailyData();

  const handleExportCSV = () => {
    if (!dailyData || dailyData.length === 0) {
      alert("No data available to export yet!");
      return;
    }
    const csvString = Papa.unparse(dailyData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${networkId}-performance.csv`;
    link.click();
  };

  const renderDelta = (
    current?: number,
    previous?: number,
    inverseGood = false,
  ) => {
    if (!previous || !current || previous === 0) return null;
    const diff = current - previous;
    const percentChange = (diff / previous) * 100;
    const isPositive = diff >= 0;
    const isFavorable = inverseGood ? !isPositive : isPositive;

    return (
      <KPIDelta $isPositive={isFavorable}>
        {isPositive ? "▲" : "▼"} {Math.abs(percentChange).toFixed(1)}%
      </KPIDelta>
    );
  };

  // --- DEFENSIVE DATA EXTRACTION ---
  const getTotals = () => {
    // If data is null or undefined, return null immediately
    if (!data) return null;

    if (networkId === "meta" && data.totals) {
      return {
        spend:
          (data.totals.facebook?.spend || 0) +
          (data.totals.instagram?.spend || 0),
        impressions:
          (data.totals.facebook?.impressions || 0) +
          (data.totals.instagram?.impressions || 0),
        clicks:
          (data.totals.facebook?.clicks || 0) +
          (data.totals.instagram?.clicks || 0),
        cpc:
          ((data.totals.facebook?.cpc || 0) +
            (data.totals.instagram?.cpc || 0)) /
          2,
      };
    }
    return data.totals;
  };

  const displayTotals = getTotals();

  return (
    <PageContainer>
      <HeaderRow>
        <Title>{networkId} Insights</Title>
        <ControlsContainer>
          <DateInput
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate}
          />
          <span style={{ color: "#64748b", fontWeight: "bold" }}>to</span>
          <DateInput
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
          <Button $primary onClick={() => fetchInsights(startDate, endDate)}>
            Apply Dates
          </Button>
          <Button onClick={handleExportCSV} disabled={!data || loading}>
            Export CSV
          </Button>
        </ControlsContainer>
      </HeaderRow>

      {error && (
        <ErrorBanner>
          <strong>Notice:</strong> {error}
        </ErrorBanner>
      )}

      {loading ? (
        <h2 style={{ textAlign: "center", margin: "40px 0" }}>
          Analyzing Data...
        </h2>
      ) : displayTotals ? (
        <>
          <KPIStrip>
            <KPICard>
              <KPILabel>Total Spend</KPILabel>
              <KPIValue>
                $
                {displayTotals.spend?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </KPIValue>
              {renderDelta(displayTotals.spend, data?.previousTotals?.spend)}
            </KPICard>
            <KPICard>
              <KPILabel>Total Impressions</KPILabel>
              <KPIValue>
                {displayTotals.impressions?.toLocaleString() || "0"}
              </KPIValue>
              {renderDelta(
                displayTotals.impressions,
                data?.previousTotals?.impressions,
              )}
            </KPICard>
            <KPICard>
              <KPILabel>Total Clicks</KPILabel>
              <KPIValue>
                {displayTotals.clicks?.toLocaleString() || "0"}
              </KPIValue>
              {renderDelta(displayTotals.clicks, data?.previousTotals?.clicks)}
            </KPICard>
            <KPICard>
              <KPILabel>Avg. CPC</KPILabel>
              <KPIValue>${displayTotals.cpc?.toFixed(2) || "0.00"}</KPIValue>
              {renderDelta(displayTotals.cpc, data?.previousTotals?.cpc, true)}
            </KPICard>
          </KPIStrip>

          <ChartContainer>
            <h2 style={{ marginTop: 0, color: "#0f172a" }}>
              Performance Trends
            </h2>
            {(() => {
              const dailyData =
                data?.metrics ||
                data?.daily ||
                data?.data ||
                (data && Object.values(data).find(Array.isArray)) ||
                [];
              if (dailyData.length === 0)
                return <p>No chart data available for this period.</p>;
              return (
                <Chart
                  chartType="LineChart"
                  width="100%"
                  height="400px"
                  data={[
                    ["Date", "Impressions", "Clicks"],
                    ...dailyData.map((day: any) => [
                      day.date
                        ? format(new Date(day.date), "MMM dd")
                        : "Unknown",
                      day.impressions || 0,
                      day.clicks || 0,
                    ]),
                  ]}
                  options={{
                    curveType: "function",
                    legend: { position: "bottom" },
                    colors: ["#aa3bff", "#16a34a"],
                    chartArea: { width: "90%", height: "70%" },
                  }}
                />
              );
            })()}
          </ChartContainer>
        </>
      ) : (
        <p>No data found for this selection.</p>
      )}
    </PageContainer>
  );
}
