import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { initPostHog } from '../../services/posthog';

export default function AnalyticsProvider() {
  useEffect(() => {
    initPostHog();
  }, []);

  return <Analytics />;
}
