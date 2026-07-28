import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Loader2,
  FileJson,
  UserCircle,
  Brain,
  Gamepad2,
  CreditCard,
  Trophy,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import MainLayout from '../components/Layout/MainLayout';
import PageHeader from '../components/notifications/PageHeader';
import TranslatedText from '../components/TranslatedText.jsx';
import { useTranslateText } from '../hooks/useTranslate';
import { exportUserData } from '../services/gdprService';
import { getPlatformName } from '../config/accessControl';
import toast from 'react-hot-toast';

// What the export bundle contains — shown to the user before they download.
const INCLUDED_DATA = [
  { icon: UserCircle, label: 'Account & profile details' },
  { icon: Brain, label: 'Assessment results (IQ, ADHD, Emotional Intelligence)' },
  { icon: Gamepad2, label: 'Game scores & play history' },
  { icon: Trophy, label: 'Badges, achievements & activity' },
  { icon: CreditCard, label: 'Orders, payments & subscriptions' },
  { icon: Bell, label: 'Notifications & leaderboard records' },
];

function triggerJsonDownload(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function DataPrivacy() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [lastExport, setLastExport] = useState(null);

  const preparingText = useTranslateText('Preparing your data...');
  const successText = useTranslateText('Your data has been downloaded.');
  const errorText = useTranslateText('Could not export your data. Please try again.');

  const unreadCount = 3;

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const exportPromise = (async () => {
      const response = await exportUserData();
      const dataExport = response?.data?.export;
      if (!dataExport) {
        throw new Error('Empty data export');
      }

      const brand = (getPlatformName() || 'bazingo').toLowerCase().replace(/\s+/g, '-');
      const datePart = new Date().toISOString().slice(0, 10);
      triggerJsonDownload(dataExport, `${brand}-my-data-${datePart}.json`);

      setLastExport({
        generatedAt: dataExport.generatedAt,
        summary: dataExport.summary || {},
      });
      return dataExport;
    })();

    toast.promise(
      exportPromise,
      {
        loading: preparingText,
        success: successText,
        error: (err) => `${errorText}${err?.message ? ` (${err.message})` : ''}`,
      },
      {
        style: { minWidth: '250px' },
        success: { duration: 3000, icon: '📦' },
        error: { duration: 4000, icon: '❌' },
      }
    );

    try {
      await exportPromise;
    } catch (err) {
      console.error('Data export failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <MainLayout unreadCount={unreadCount}>
      <div
        className="bg-white min-h-screen"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        <main>
          <PageHeader
            title={<TranslatedText text="Data & GDPR" />}
            subtitle={
              <TranslatedText text="Under GDPR you have the right to access a copy of the personal data we hold about you. Download everything we have on your account in one file." />
            }
          />

          <div className="mx-auto px-4 lg:px-12 pb-12">
            <div className="max-w-[600px]">
              {/* What's included */}
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 lg:p-6 mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-50">
                    <ShieldCheck className="w-4 h-4 text-orange-500" />
                  </span>
                  <h3 className="font-semibold text-[15px] text-gray-900">
                    <TranslatedText text="What's included in your export" />
                  </h3>
                </div>

                <ul className="space-y-2.5">
                  {INCLUDED_DATA.map(({ icon: Icon, label }, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-[13px] text-gray-700 p-2.5 rounded-xl border border-gray-100 bg-gray-50/60"
                    >
                      <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span><TranslatedText text={label} /></span>
                    </li>
                  ))}
                </ul>

                <p className="text-[12px] text-gray-500 mt-4 leading-relaxed">
                  <TranslatedText text="Your data is delivered as a machine-readable JSON file. Sensitive fields such as your password are never included." />
                </p>
              </div>

              {/* Download action */}
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50/70 to-amber-50/40 shadow-sm p-5 lg:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-orange-100 flex-shrink-0">
                    <FileJson className="w-5 h-5 text-orange-500" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[15px] text-gray-900">
                      <TranslatedText text="Download my data" />
                    </h3>
                    <p className="text-[12px] text-gray-600 mt-0.5 leading-relaxed">
                      <TranslatedText text="We'll gather everything associated with your account and download it to this device." />
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-orange-500 text-white text-[13px] font-medium px-5 py-3 rounded-xl shadow-sm hover:bg-orange-600 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <TranslatedText text="Preparing your data..." />
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <TranslatedText text="Download my data (JSON)" />
                    </>
                  )}
                </button>

                {lastExport && (
                  <div className="mt-4 flex items-start gap-2 text-[12px] text-green-700 bg-green-50 border border-green-100 rounded-xl p-3">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        <TranslatedText text="Export downloaded" />
                      </p>
                      <p className="text-green-600/90">
                        <TranslatedText text="Included" />:{' '}
                        {lastExport.summary.assessments || 0}{' '}
                        <TranslatedText text="assessments" />,{' '}
                        {lastExport.summary.gameRecords || 0}{' '}
                        <TranslatedText text="game records" />,{' '}
                        {lastExport.summary.billingRecords || 0}{' '}
                        <TranslatedText text="billing records" />.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-gray-400 mt-5 leading-relaxed">
                <TranslatedText text="If you'd like your data corrected or permanently deleted, please contact our support team." />
              </p>
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}

export default DataPrivacy;
