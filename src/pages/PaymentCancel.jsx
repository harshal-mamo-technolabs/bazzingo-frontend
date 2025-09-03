import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';

export default function PaymentCancel() {
	const navigate = useNavigate();
	return (
		<MainLayout>
			<div className="bg-white min-h-screen" style={{ fontFamily: 'Roboto, sans-serif' }}>
				<div className="mx-auto px-4 lg:px-12">
					<div className="max-w-[640px] mx-auto pt-10 pb-16 text-center">
						<img src="/carbon_checkmark-filled.png" alt="Cancel" className="w-10 h-10 mx-auto mb-4 opacity-60" />
						<h1 className="text-gray-900" style={{ fontSize: '24px', fontWeight: 900 }}>Payment canceled</h1>
						<p className="text-gray-500 mt-2" style={{ fontSize: '13px' }}>You can try again anytime.</p>
						<button onClick={() => navigate('/payment/demo')} className="mt-6 px-4 py-2 rounded-xl text-white font-semibold bg-[#FF6B3E] hover:brightness-95">
							Try again
						</button>
					</div>
				</div>
			</div>
		</MainLayout>
	);
}


