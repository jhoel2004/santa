# **App Name**: NeonShift

## Core Features:

- Secure Role-Based Authentication: Users (Garzón, Chica, Admin) can log in securely based on their roles, with hostesses (chicas) using unique numeric codes for dashboard access.
- Product & Hostess Data Management: Admin/Garzón can define and manage products (name, sale price, commission) and add/manage hostess profiles, including daily attendance toggling.
- Real-time Consumption Logging with Commission Splitting: Garzón/Admin can log drink consumptions for one or multiple hostesses (chicas). The system automatically applies the dynamic commission splitting logic for shared consumptions and records timestamps for each transaction.
- Hostess Personal Performance Dashboard: Hostesses (Chicas) can access a dedicated view showing their personal consumption history and aggregated commission earnings for the day and week, accessible via their unique code.
- Admin Financial Tracking & Reporting: Admin users can monitor pending hostess commissions, process payments with a payment history, and export daily financial summaries to PDF or Excel for record-keeping.
- Admin Business Intelligence Dashboard: Interactive charts provide key insights into business performance, including 'Top Consuming Girls,' 'Top Selling Waiters,' and overall daily/weekly/monthly revenue and commission trends.
- AI Commission Split Optimizer Tool: An AI tool that assists Garzóns or Admins in complex, dynamic consumption scenarios by suggesting optimal commission distribution and identifying potential edge cases when multiple hostesses share a product.

## Style Guidelines:

- A dark color scheme that evokes a sophisticated nightclub ambiance with high contrast. The primary accent color is a vibrant violet (#A746F0), drawing from modern neon aesthetics, while the background is a very dark, subtly tinted purple (#1F1A1F). A deep indigo (#292E8C) serves as a secondary accent to add depth and another layer of contrast.
- The 'Inter' typeface (sans-serif) is recommended for its modern, highly readable, and objective qualities, making it suitable for both headlines and body text across all user interfaces, especially given the data-heavy nature and mobile-first requirement.
- Utilize 'Lucide React' icons for a clean, consistent, and recognizable set of symbols that support the dark, high-contrast design aesthetic.
- The Garzón interface will be explicitly designed with a mobile-first approach, featuring large tappable areas and streamlined workflows. Admin interfaces will provide responsive data-rich layouts with interactive charts and high-contrast elements for clarity in a low-light environment.
- Subtle, fluid transitions and micro-animations will enhance the user experience, providing visual feedback for actions such as consumption logging confirmation, successful payments, and dynamic chart updates without being distracting.