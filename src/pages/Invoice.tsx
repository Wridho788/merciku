import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdOpenInNew } from 'react-icons/md';
import { AppbarDefault } from '../components/AppbarDefault';
import { useOrderDetail } from '../api/hooks/cartHooks';
import { useAuthStore } from '../stores/authStore';
import './Invoice.css';

interface InvoiceState {
  invoiceUrl: string;
  orderId: string;
  transId?: number;
  orderPayment?: string;
}

const Invoice: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  // const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get invoice data from navigation state
  const invoiceData = location.state as InvoiceState;
  // Use OrderDetail hook for polling payment status
  const { data: orderDetail, refetch } = useOrderDetail(
    invoiceData?.orderPayment || '',
  );
  useEffect(() => {
    // Redirect to cart if no invoice data is provided
    if (!invoiceData?.invoiceUrl) {
      console.error('❌ No invoice URL provided');
      navigate('/cart');
      return;
    }
    // Auto-open payment page in browser
    const autoOpenTimer = setTimeout(() => {
      setIsLoading(false);
      const fullUrl = getFullUrl(invoiceData.invoiceUrl);
      window.open(fullUrl, '_blank');
    }, 2000); // 2 seconds delay to show the page first

    return () => clearTimeout(autoOpenTimer);
  }, [invoiceData?.invoiceUrl, navigate]);

  // Polling effect untuk mengecek status pembayaran
  useEffect(() => {
    // Hanya lakukan polling jika ada orderPayment dan user sudah authenticated
    if (!invoiceData?.orderPayment || !isAuthenticated) {
      return;
    }
    // Polling setiap 3 detik
    // intervalRef.current = setInterval(() => {
    //   refetch();
    // }, 3000);

    return () => {
      // if (intervalRef.current) {
      //   clearInterval(intervalRef.current);
      //   intervalRef.current = null;
      // }
    };
  }, [invoiceData?.orderPayment, isAuthenticated, refetch]);

  // Effect untuk mengecek status pembayaran dan navigasi
  useEffect(() => {
    if (orderDetail?.content?.status === 'SUCCESSFUL') {
      // Hentikan polling
      // if (intervalRef.current) {
      //   clearInterval(intervalRef.current);
      //   intervalRef.current = null;
      // }
      
      // Navigasi ke halaman order detail
      navigate(`/orders/${invoiceData?.orderPayment}`);
    }
  }, [orderDetail?.content?.status, navigate, invoiceData?.orderPayment]);

  useEffect(() => {
    // Memastikan class dark mode diterapkan dengan benar
    // Jika ada sistem dark mode di aplikasi Anda, pastikan class 'dark-mode'
    // ditambahkan ke body element ketika dark mode aktif

    // Contoh: jika Anda memiliki context atau state untuk dark mode
    // const isDarkMode = /* ambil dari context/state dark mode Anda */;
    // if (isDarkMode) {
    //   document.body.classList.add('dark-mode');
    //   document.body.classList.remove('light-mode');
    // } else {
    //   document.body.classList.add('light-mode');
    //   document.body.classList.remove('dark-mode');
    // }

    // Untuk testing, Anda bisa uncomment baris berikut untuk memaksa dark mode:
    // document.body.classList.add('dark-mode');

    return () => {
      // Cleanup jika diperlukan
      // document.body.classList.remove('dark-mode', 'light-mode');
    };
  }, []);

  const handleBackClick = () => {
    navigate('/cart', { state: { from: '/invoice' } });
  };

  // const handleRefresh = () => {
  //   console.log('🔄 Refresh clicked - Opening payment page');
  //   const fullUrl = getFullUrl(invoiceData.invoiceUrl);
  //   window.open(fullUrl, '_blank');
  // };

  const handleOpenInNewTab = () => {
    if (invoiceData?.invoiceUrl) {
      const fullUrl = getFullUrl(invoiceData.invoiceUrl);
      window.open(fullUrl, '_blank');
    }
  };

  // Helper function to ensure URL has https protocol
  const getFullUrl = (url: string): string => {
    if (!url) return '';

    // If URL already has protocol, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If URL doesn't have protocol, add https://
    return `https://${url}`;
  };

  if (!invoiceData?.invoiceUrl) {
    return (
      <div className="invoice-page">
        <AppbarDefault title="Faktur" onBack={handleBackClick} />
        <div className="invoice-error">
          <h3>Faktur Tidak Ditemukan</h3>
          <p>Tidak dapat memuat faktur. Silakan coba lagi.</p>
          <button
            onClick={() => navigate('/cart', { state: { from: '/invoice' } })}
            className="back-to-cart-btn"
          >
            Kembali ke Keranjang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-page">
      <AppbarDefault title={`Faktur - ${invoiceData.orderId}`} onBack={handleBackClick} />

      <div className="invoice-content">
        {/* Invoice Header */}
        <div className="invoice-header">
          <div className="invoice-info">
            <h3>Tagihan Pembayaran</h3>
            <p>ID Pesanan: {invoiceData.orderId}</p>
            {invoiceData.transId && <p>ID Transaksi: {invoiceData.transId}</p>}
          </div>

          <div className="invoice-actions">
            {/* <button
              onClick={handleRefresh}
              className="invoice-action-btn"
              title="Buka Halaman Pembayaran"
            >
              <MdRefresh />
            </button> */}
            <button
              onClick={handleOpenInNewTab}
              className="invoice-action-btn primary"
              title="Buka di browser"
            >
              <MdOpenInNew />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="invoice-loading">
            <div className="loading-spinner"></div>
            <p>Menyiapkan halaman pembayaran...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="invoice-error">
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={handleOpenInNewTab} className="open-external-btn primary">
                <MdOpenInNew />
                Buka Halaman Pembayaran
              </button>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        <div className="payment-instructions">
          <h4>Panduan Pembayaran:</h4>
          <ol>
            <li>Halaman pembayaran akan terbuka otomatis di tab baru</li>
            <li>Selesaikan pembayaran Anda di halaman pembayaran</li>
            <li>Kembali ke aplikasi ini setelah pembayaran selesai</li>
            <li>Cek status pesanan Anda di "Pesanan Saya"</li>
          </ol>
        </div>

        {/* Footer Instructions */}
        <div className="invoice-footer">
          <p className="invoice-instruction">
            Selesaikan pembayaran melalui faktur ini untuk memproses pesanan Anda.
          </p>
          <button onClick={() => navigate('/orders')} className="view-orders-btn">
            Lihat Pesanan Saya
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
