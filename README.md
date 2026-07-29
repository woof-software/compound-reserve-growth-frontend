# Compound Financial Tracking

Compound Financial Tracking is a web application designed to provide transparent and detailed insights into the financial health of the Compound DAO. This dashboard allows anyone to monitor and analyze key financial activities, including:

• Treasury growth over time  
• Runway for vendors and internal programs  
• Fee generation across all Compound markets

The primary goal is to empower DAO members, investors, and the wider community with the data needed to make informed decisions and understand the protocol's performance.

## 📋 Table of Contents

• [✨ Tech Stack](#-tech-stack)  
• [🚀 Getting Started](#-getting-started)  
• [⚙️ Configuration](#️-configuration)  
• [🏗️ Production Build](#️-production-build)  
• [🛠️ Available Scripts](#️-available-scripts)  
• [🤝 Contributing](#-contributing)  
• [📄 License](#-license)

## ✨ Tech Stack

This project is built on a modern stack to ensure high performance and reliability:

• **Framework:** React 19  
• **Language:** TypeScript  
• **Build Tool:** Vite  
• **Styling:** Tailwind CSS  
• **Routing:** React Router  
• **Data Fetching:** TanStack Query (React Query)  
• **UI Components:** Radix UI  
• **Data Visualization:** Highcharts  
• **Code Quality:** ESLint, Husky

## 🚀 Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Then, open the `.env` file and fill in the required values.

3. **Run the project:**

   Using npm:

   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## ⚙️ Configuration

For the application to work correctly, you need to configure environment variables in the `.env` file.

| Variable       | Description                                |
| -------------- | ------------------------------------------ |
| `VITE_API_URL` | The base URL for the backend API requests. |

## 🏗️ Production Build

To create an optimized version of the application for deployment, run the command:

Using npm:

```bash
npm run build
```

This command will type-check the code and then bundle the final project files into the `dist/` directory.

## 🛠️ Available Scripts

You can run these scripts with either `npm run <script-name>`.

• `dev` — Starts the development server with HMR.  
• `build` — Builds the project for production.  
• `lint:ts` — Lints TypeScript/TSX files with ESLint.  
• `lint:ts:fix` — Automatically fixes linting errors in TypeScript/TSX files.  

## 🤝 Contributing

We welcome all contributions! If you find a bug or have a suggestion for improvement, please create an Issue on the project's GitHub page.

When creating an Issue:

• Ensure the issue hasn't been reported already.  
• Use a clear and descriptive title.  
• For bugs: describe the steps to reproduce, the expected behavior, and the actual behavior. Include screenshots if possible.  
• For feature requests: explain the problem your proposal solves and how it should work.

## 📄 License

_This project is distributed under the MIT License. See the LICENSE file for more information._
