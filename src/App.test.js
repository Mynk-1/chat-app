import { render, screen } from '@testing-library/react';
import App from './App';

// Tests must not depend on a real network call to the deployed backend —
// mock the session check so it resolves deterministically and instantly.
jest.mock('./api/auth.api', () => ({
  getMe: jest.fn(() => Promise.reject(new Error('not logged in'))),
}));

test('renders the landing page heading once the session check resolves', async () => {
  render(<App />);
  const heading = await screen.findByRole('heading', { name: /ChatConnect/i, level: 1 });
  expect(heading).toBeInTheDocument();
});
