import * as React from 'react';
import { useFeatureFlag } from 'flagg';
import { FeatureFlagName } from '../../featureFlags';

export interface IFeatureFlagProps {
  flagName: FeatureFlagName;
}

/**
 * Hides content if the user doesn't have the specified feature flag enabled
 */
export const FeatureFlag: React.FC<IFeatureFlagProps> = ({ flagName, children }) => {
  const [isEnabled] = useFeatureFlag(flagName);

  if (isEnabled) {
    return <>{children}</>;
  }

  return null;
};
