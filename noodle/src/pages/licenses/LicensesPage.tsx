import * as React from 'react';
import { Page } from '@layouts/Page/Page';
import { Header } from '@components/Header/Header';
import { Box, Typography, Divider } from '@material-ui/core';
import generatedLicenses from './data/licenses.json';
import { useTranslation } from 'react-i18next';

const hardcodedLicenses = [
  {
    name: 'WebRTC Project Example Code (SoundMeter.js)',
    copyright: 'Copyright (c) 2014, The WebRTC project authors. All rights reserved.',
    licenseText: `Copyright (c) 2014, The WebRTC project authors. All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

Neither the name of Google nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  },
];

/**
 * A page to include all Open Source software licenses, disclaimers, etc.
 */
const LicensesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Page>
      <Header />
      <Box p={4}>
        <Typography variant="h1" gutterBottom>
          {t('pages.licenses.title')}
        </Typography>
        <Typography paragraph>{t('pages.licenses.intro')}</Typography>
        {Object.values(generatedLicenses).map((license) => (
          <LicenseInfo key={license.name} license={license} />
        ))}
        {/* Additional one-offs */}
        {hardcodedLicenses.map((license) => (
          <LicenseInfo key={license.name} license={license} />
        ))}
      </Box>
    </Page>
  );
};

function LicenseInfo({ license }: { license: { name: string; copyright: string; licenseText: string } }) {
  return (
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
  );
}

export default LicensesPage;
