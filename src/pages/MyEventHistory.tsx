import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
import { FAB } from '../components/FAB';

import './AccountPages.css';

interface EventItem {
  id: string;
  chapter_id?: string;
  chapter: string;
  code?: string;
  name: string;
  dates?: string;
  date?: string;
  time?: string;
  desc?: string;
  image?: string;
  fee?: number;
  minimum_participants?: string;
  type?: number;
  type_desc?: string;
  done?: number;
  done_desc?: string;
  status?: string;
}

const MyEventHistory: React.FC = () => {
  const navigate = useNavigate();

  // Dummy state, ganti dengan API jika sudah ada
  // const eventsResponse = undefined;
  const eventsLoading = false;
  const eventsError = undefined;
  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  // Uncomment below to test empty state
  //   const events: any[] = [];

  // Use API data if available, otherwise fallback to static data
  const events: EventItem[] = [];

  return (
    <div className="account-page">
      <AppbarDefault
        title="Riwayat Event Saya"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={0}
      />

      <div className="account-content">
        <div className="account-card">
          <h3>Riwayat Partisipasi Event</h3>

          {/* Show loading state */}
          {eventsLoading && (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#161129',
              }}
            >
              Memuat riwayat event...
            </div>
          )}

          {/* Show error state */}
          {eventsError && (
            <div
              style={{
                textAlign: 'center',
                padding: '20px',
                color: '#ff6b6b',
              }}
            >
              Gagal memuat event. Silakan coba lagi.
            </div>
          )}

          {/* Show events data or fallback to static data */}
          {!eventsLoading && !eventsError && events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="event-item" >
                {/* Baris 1: Event Image with Status Overlay */}
                {event.image && (
                  <div className="event-row-1" style={{ 
                    position: 'relative',
                    marginBottom: '16px'
                  }}>
                    <img 
                      src={event.image} 
                      alt={event.name} 
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        display: 'block'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    {/* Status Badge in bottom right corner of image */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '900',
                        textTransform: 'uppercase'
                      }}
                    >
                      {event.done_desc || event.status || 'Available'}
                    </div>
                  </div>
                )}
                
                {/* Baris 2: Two Column Layout */}
                <div className="event-row-2" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '20px',
                  padding: '0'
                }}>
                  {/* Column 1 */}
                  <div className="event-column-1">
                    {/* Name */}
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                        fontSize: '15px', 
                        fontWeight: '900', 
                        color: '#161129',
                        marginBottom: '4px'
                        }}>
                        NAMA EVENT
                        </div>
                      <div style={{ 
                        fontSize: '15px', 
                        fontWeight: '600',
                        lineHeight: '1.3'
                      }}>
                        {event.name}
                      </div>
                    </div>
                    
                    {/* Chapter */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        fontSize: '15px', 
                        fontWeight: '900', 
                        color: '#161129',
                        marginBottom: '4px'
                      }}>
                        CHAPTER
                      </div>
                      <div>{event.chapter}</div>
                    </div>
                    
                    {/* Event Code */}
                    {event.code && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '15px', 
                          fontWeight: '900', 
                          color: '#161129',
                          marginBottom: '4px'
                        }}>
                          KODE EVENT
                        </div>
                        <div>{event.code}</div>
                      </div>
                    )}
                    
                    {/* Min Participants */}
                    {event.minimum_participants && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '15px', 
                          fontWeight: '900', 
                          color: '#161129',
                          marginBottom: '4px'
                        }}>
                          MIN. PESERTA
                        </div>
                        <div>{event.minimum_participants}</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Column 2 */}
                  <div className="event-column-2">
                    {/* Date */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        fontSize: '15px', 
                        fontWeight: '900', 
                        color: '#161129',
                        marginBottom: '4px'
                      }}>
                        TANGGAL
                      </div>
                      <div>{event.dates || event.date}</div>
                    </div>
                    
                    {/* Time */}
                    {event.time && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '15px', 
                          fontWeight: '900', 
                          color: '#161129',
                          marginBottom: '4px'
                        }}>
                          WAKTU
                        </div>
                        <div>{event.time}</div>
                      </div>
                    )}
                    
                    {/* Fee */}
                    {event.fee !== null && event.fee !== undefined && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '15px', 
                          fontWeight: '900', 
                          color: '#161129',
                          marginBottom: '4px'
                        }}>
                          BIAYA
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          lineHeight: '1.4',
                          color: '#161129'
                        }}>
                          Rp {event.fee.toLocaleString()}
                        </div>
                      </div>
                    )}
                    
                    {/* Description */}
                    {event.desc && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ 
                          fontSize: '15px', 
                          fontWeight: '900', 
                          color: '#161129',
                          marginBottom: '4px'
                        }}>
                          DESKRIPSI
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          lineHeight: '1.4',
                          color: '#161129'
                        }}>
                          {event.desc}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
              </div>
            ))
          ) : !eventsLoading && !eventsError ? (
            <div className="empty-state">
              <img src="/nodata.png" alt="No Data" className="empty-icon" />
              <h3>Tidak Ada Riwayat Event</h3>
              <p>
                Anda belum pernah mengikuti event apapun. Mulai jelajahi event untuk membangun riwayat Anda!
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <FAB onClick={handleNotificationClick} ariaLabel="Notifications" />
    </div>
  );
};

export default MyEventHistory;
