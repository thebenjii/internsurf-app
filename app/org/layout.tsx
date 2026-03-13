import Footer from '@/components/Footer';

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
