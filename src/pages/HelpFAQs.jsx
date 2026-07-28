import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Search, ArrowRight, LifeBuoy, CreditCard } from 'lucide-react';
import Header from '../components/Header';
import TranslatedText from '../components/TranslatedText.jsx';
import { useTranslateText } from '../hooks/useTranslate';
import { getActiveBillingMode, isComponentVisible } from '../config/accessControl';
import { getFaqCategories } from '../data/faqData';

function HelpFAQs() {
    const navigate = useNavigate();

    // Billing mode drives which set of billing FAQs is shown (msisdn vs stripe).
    const billingMode = getActiveBillingMode();
    const categories = useMemo(() => getFaqCategories(billingMode), [billingMode]);

    const [query, setQuery] = useState('');
    const [activeCat, setActiveCat] = useState('all');
    // Open the first question of the first category by default.
    const [openKey, setOpenKey] = useState(`${categories[0]?.id}-0`);

    const searchPlaceholder = useTranslateText('Search help articles...');

    const normalizedQuery = query.trim().toLowerCase();

    const matchesQuery = (faq) => {
        if (!normalizedQuery) return true;
        const answerText = Array.isArray(faq.a) ? faq.a.join(' ') : faq.a;
        return `${faq.q} ${answerText}`.toLowerCase().includes(normalizedQuery);
    };

    const visibleCategories = useMemo(() => {
        return categories
            .filter((cat) => activeCat === 'all' || cat.id === activeCat)
            .map((cat) => ({ ...cat, faqs: cat.faqs.filter(matchesQuery) }))
            .filter((cat) => cat.faqs.length > 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories, activeCat, normalizedQuery]);

    const totalResults = visibleCategories.reduce((sum, cat) => sum + cat.faqs.length, 0);

    const toggle = (key) => setOpenKey((prev) => (prev === key ? null : key));

    const renderAnswer = (faq) => (
        <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '400' }}>
            {Array.isArray(faq.a) ? (
                <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
                    {faq.a.map((line, idx) => (
                        <li key={idx} className="text-[14px] lg:text-[15px] leading-relaxed">
                            <TranslatedText text={line} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-700 text-[14px] lg:text-[15px] leading-relaxed">
                    <TranslatedText text={faq.a} />
                </p>
            )}

            {faq.link && (
                <button
                    onClick={() => navigate(faq.link.to)}
                    className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                    <TranslatedText text={faq.link.label} />
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
            <Header unreadCount={3} />

            <main>
                {/* Page Header */}
                <div className="mx-auto px-4 lg:px-12 py-4 lg:pb-4">
                    <div className="flex items-center" style={{ marginBottom: '8px' }}>
                        <ArrowLeft
                            style={{ height: '14px', width: '14px', marginRight: '8px' }}
                            className="text-gray-600 cursor-pointer"
                            onClick={() => navigate(-1)}
                        />
                        <h2 className="text-gray-900" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: '500' }}>
                            <span className="lg:hidden" style={{ fontSize: '18px', fontWeight: '500' }}><TranslatedText text="Help & FAQs" /></span>
                            <span className="hidden lg:inline" style={{ fontSize: '20px', fontWeight: 'bold' }}><TranslatedText text="Help & FAQs" /></span>
                        </h2>
                    </div>
                    <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', fontSize: '16px', fontWeight: '400' }}>
                        <TranslatedText text="Find answers to the most common questions. Still need help? Raise a ticket." />
                    </p>
                </div>

                {/* Content Container */}
                <div className="px-4 lg:px-12 py-2 lg:py-1 max-w-3xl">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-all"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                        />
                    </div>

                    {/* Category chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1 no-scrollbar">
                        <button
                            onClick={() => setActiveCat('all')}
                            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                                activeCat === 'all'
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300'
                            }`}
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                        >
                            <TranslatedText text="All" />
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCat(cat.id)}
                                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                                    activeCat === cat.id
                                        ? 'bg-orange-500 text-white border-orange-500'
                                        : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300'
                                }`}
                                style={{ fontFamily: 'Roboto, sans-serif' }}
                            >
                                <TranslatedText text={cat.title} />
                            </button>
                        ))}
                    </div>

                    {/* Results */}
                    {totalResults === 0 ? (
                        <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
                            <p className="text-gray-500 text-[14px]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                <TranslatedText text="No results found. Try a different search or raise a ticket." />
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {visibleCategories.map((cat) => (
                                <section key={cat.id}>
                                    {/* Category header */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <h3
                                            className="text-gray-900"
                                            style={{ fontFamily: 'Inter, sans-serif', fontSize: '15px', fontWeight: '600' }}
                                        >
                                            <TranslatedText text={cat.title} />
                                        </h3>
                                        {/* Billing mode indicator (card billing only; the
                                            Billing category is not shown in MSISDN mode). */}
                                        {cat.id === 'billing' && (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                                                <CreditCard className="w-3 h-3" />
                                                <TranslatedText text="Card billing" />
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        {cat.faqs.map((faq, i) => {
                                            const key = `${cat.id}-${i}`;
                                            const isOpen = openKey === key;
                                            return (
                                                <div key={key} className="border border-gray-300 rounded-lg overflow-hidden">
                                                    <button
                                                        onClick={() => toggle(key)}
                                                        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white hover:bg-gray-50 focus:outline-none text-left"
                                                    >
                                                        <span
                                                            className="text-gray-900"
                                                            style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: '400' }}
                                                        >
                                                            <TranslatedText text={faq.q} />
                                                        </span>
                                                        {isOpen ? (
                                                            <Minus className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                                        ) : (
                                                            <Plus className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                                        )}
                                                    </button>

                                                    {isOpen && <hr className="border-t border-black mx-4" />}

                                                    {isOpen && (
                                                        <div className="bg-gray-50 px-4 pb-4 pt-3">
                                                            {renderAnswer(faq)}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}

                    {/* Still need help CTA */}
                    <div className="mt-8 mb-10 rounded-2xl border border-gray-200 bg-gradient-to-br from-orange-50/70 to-amber-50/40 p-5">
                        <div className="flex items-start gap-3">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-orange-100 flex-shrink-0">
                                <LifeBuoy className="w-5 h-5 text-orange-500" />
                            </span>
                            <div className="flex-1">
                                <h4 className="text-gray-900 font-semibold text-[15px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    <TranslatedText text="Still need help?" />
                                </h4>
                                <p className="text-gray-600 text-[13px] mt-0.5 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                    <TranslatedText text="Can't find what you're looking for? Our support team is here to help." />
                                </p>
                                {isComponentVisible('ticketRaisingSystem') && (
                                    <button
                                        onClick={() => navigate('/client-ticket')}
                                        className="mt-3 inline-flex items-center gap-2 bg-orange-500 text-white text-[13px] font-medium px-4 py-2 rounded-xl hover:bg-orange-600 active:scale-[0.99] transition-all"
                                    >
                                        <TranslatedText text="Raise a ticket" />
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}

export default HelpFAQs;
