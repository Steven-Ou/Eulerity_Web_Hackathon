import { useParams } from 'react-router-dom';

export default function NetworkDetail() {
  // Extracts the URL parameter (e.g., 'meta', 'google')
  const { networkId } = useParams<{ networkId: string }>();

  return (
    <div>
      <h1>{networkId?.toUpperCase()} Performance</h1>
      <p>Detail page under construction.</p>
    </div>
  );
}