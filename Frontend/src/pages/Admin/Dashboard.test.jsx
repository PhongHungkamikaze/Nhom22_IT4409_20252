import React from 'react';
import { render } from '@testing-library/react';
import Dashboard from './Dashboard';

test('renders Admin Dashboard', () => {
    const { getByText } = render(<Dashboard />);
    expect(getByText(/Admin Dashboard/i)).toBeInTheDocument();
});
