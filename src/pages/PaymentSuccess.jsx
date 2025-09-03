import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

function useQuery() {
	const params = useMemo(() => new URLSearchParams(window.location.search), []);
	return (key) => params.get(key);
}

export default function PaymentSuccess() {
	const getParam = useQuery();
	const sessionId = getParam('session_id');
	const [status, setStatus] = useState('');
	const [error, setError] = useState('');

	// useEffect(() => {
	// 	(async () => {
	// 		try {
	// 			const stored = JSON.parse(localStorage.getItem('user'));
	// 			const token = stored?.accessToken || stored?.user?.token || '';
	// 			if (!sessionId || !token) return;
	// 			const res = await fetch(`/api/pay/verify?session_id=${encodeURIComponent(sessionId)}`, {
	// 				headers: { Authorization: `Bearer ${token}` },
	// 			});
	// 			if (!res.ok) throw new Error(`Verify failed (${res.status})`);
	// 			const data = await res.json();
	// 			setStatus(data?.status || 'success');
	// 		} catch (e) {
	// 			setError(e?.message || 'Verification error');
	// 		}
	// 	})();
	// }, [sessionId]);

	return (
		<MainLayout>
			<div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
				<div className="mx-auto px-4 lg:px-12">
					<div className="max-w-[640px] mx-auto pt-10 pb-16 text-center">
						<img src="/task-complete-icon.svg" alt="Success" className="w-12 h-12 mx-auto mb-4" />
						<h1 className="text-gray-900" style={{ fontSize: '24px', fontWeight: 900 }}>Payment successful</h1>
						<p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>Your checkout completed successfully.</p>
						<div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4 text-left">
							<div className="text-gray-700" style={{ fontSize: '13px' }}>Session ID: <span className="font-mono break-all">{sessionId || '-'}</span></div>
							{status && <div className="text-gray-700 mt-1" style={{ fontSize: '13px' }}>Status: {status}</div>}
							{error && <div className="text-red-600 mt-1" style={{ fontSize: '13px' }}>{error}</div>}
						</div>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}


