# Sunrise Sunset Frontend

React + Vite frontend for the Sunrise Sunset application with interactive charts and responsive design.

## Setup

### Prerequisites
- Node.js 20+
- npm or yarn

### Environment Configuration

Copy the example environment file and configure it:
```bash
cp .env.example .env
```

Edit the `.env` file with your specific configuration values. See `.env.example` for all required environment variables.

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Development Features

- **Hot Module Replacement (HMR)** for fast development
- **ESLint** for code quality
- **Tailwind CSS** for styling
- **Responsive design** for all screen sizes

## Tech Stack

- **React** 19 with hooks
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for HTTP requests
- **Date-fns** for date manipulation

## Features

- **Interactive Charts**: Sunrise/sunset time visualization
- **Location Search**: Search by city name or coordinates  
- **Date Range Selection**: Custom date ranges for data
- **Responsive Design**: Works on desktop and mobile
- **Data Tables**: Detailed sunrise/sunset information
- **Golden Hour**: Calculate photography golden hours

## Architecture

The frontend follows modern React patterns:
- **Functional components** with hooks
- **Custom hooks** for API calls and state management
- **Component composition** for reusability
- **Responsive design** with Tailwind CSS utilities
- **Client-side routing** (if applicable)

## Configuration

### Vite Configuration
The project uses Vite with the following plugins:
- `@vitejs/plugin-react` for React support
- Hot Module Replacement (HMR) enabled
- Tailwind CSS integration

### API Integration
The frontend communicates with the Rails backend via RESTful API calls using Axios for HTTP requests.
