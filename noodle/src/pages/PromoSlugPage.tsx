import { Analytics } from '@analytics/Analytics';
import { EventNames } from '@analytics/constants';
import { FullscreenLoading } from '@components/FullscreenLoading/FullscreenLoading';
import * as React from 'react';

export function PromoSlugPage() {
  const slug = window.location.pathname.slice(1);

  React.useEffect(() => {
    Analytics.trackEvent(EventNames.PROMO_SLUG, slug)?.then(() => {
      window.location.href = `/create?ref=${slug}`;
    });
  }, [slug]);

  return <FullscreenLoading />;
}
