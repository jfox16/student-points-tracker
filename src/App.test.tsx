import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the student points tracker', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: /student points tracker/i }),
  ).toBeInTheDocument();
});
