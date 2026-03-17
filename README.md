# Investa - React Application

This is the React.js version of the Investa investment website.

## Project Structure

```
src/
  components/        # Reusable components (Sidebar, Header, Layout)
  pages/            # Page components (Login, Dashboard, Wallet, etc.)
  App.js            # Main app component with routing
  index.js          # Entry point
  index.css         # Global styles
```

## Features

- **Authentication**: Login and Register pages
- **Dashboard**: Main dashboard with stats and transaction history
- **Wallet Management**: View and manage wallet
- **Funds Management**: Add and withdraw funds
- **Investment Plans**: View available investment plans
- **Profile Management**: User profile settings
- **Referrals**: Referral program
- **Transactions**: Transaction history
- **Support**: Help and support center
- **Security**: Security settings

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Build for production:
```bash
npm run build
```

## Dependencies

- React 18.2.0
- React Router DOM 6.20.0
- Bootstrap 5.3.2
- Chart.js 4.4.0
- Font Awesome Icons

## Notes

- The app uses localStorage for authentication (for demo purposes)
- All pages are protected routes except Login/Register
- Assets (images, CSS libraries) should be placed in the `public` folder
- Original HTML files are preserved in the root directory

## Converting from HTML

This React app has been converted from the original HTML/CSS/JavaScript project. Key changes:

1. **Components**: HTML pages converted to React components
2. **Routing**: React Router for navigation
3. **State Management**: React hooks (useState, useEffect)
4. **Styling**: CSS modules and component-specific stylesheets
5. **Functionality**: JavaScript converted to React hooks and event handlers

## Development

The app runs on `http://localhost:3000` by default.

To add new features:
1. Create components in `src/components/`
2. Create pages in `src/pages/`
3. Add routes in `src/App.js`
4. Add styles in component-specific CSS files
