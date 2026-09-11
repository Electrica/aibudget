import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Калькулятор Инвестиций и Роста Капитала',
  description: 'Прогнозирование роста капитала с учетом заработной платы, инвестиций, сложного процента, сравнения сценариев и экспорта отчетов в PDF.',
  openGraph: {
    title: 'Калькулятор Инвестиций и Роста Капитала',
    description: 'Прогнозирование роста капитала с учетом заработной платы, инвестиций, сложного процента, сравнения сценариев и экспорта отчетов в PDF.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Калькулятор Инвестиций и Роста Капитала',
    description: 'Прогнозирование роста капитала с учетом заработной платы, инвестиций, сложного процента, сравнения сценариев и экспорта отчетов в PDF.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
