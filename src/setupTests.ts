import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'isomorphic-fetch';
import '@testing-library/jest-dom';
import './theme/theme.tsx';

import './i18n';

configure({ adapter: new Adapter() });
