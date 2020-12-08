import * as React from 'react';
import { Page } from '../../Layouts/Page/Page';
import { Header } from '../../components/Header/Header';
import { Box, Typography, Divider } from '@material-ui/core';
import generatedLicenses from './data/licenses.json';

/**
 * A page to include all Open Source software licenses, disclaimers, etc.
 */
const LicensesPage: React.FC = () => {
  return (
    <Page>
      <Header />
      <Box p={4}>
        <Typography variant="h1" gutterBottom>
          Open Source Software Licenses
        </Typography>
        <Typography paragraph>
          With utilizes open source and third party software in various forms throughout the app. The following sets
          forth attribution notices for third party software that may be contained in portions of the product.
        </Typography>
        {Object.values(generatedLicenses).map((license) => (
          // this content-visibility directive is relatively unsupported, but
          // helps decrease rendering load.
          <div style={{ contentVisibility: 'auto' } as any}>
            <Typography variant="overline" gutterBottom>
              {license.name}
            </Typography>
            <Typography variant="caption" paragraph>
              {license.copyright}
            </Typography>
            <Typography paragraph variant="body2" style={{ whiteSpace: 'pre' }}>
              {license.licenseText}
            </Typography>
            <Divider />
          </div>
        ))}
      </Box>
    </Page>
  );
};

export default LicensesPage;
