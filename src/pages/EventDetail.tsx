import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppbarDefault } from '../components/AppbarDefault';
// import EventRegistration from '../components/EventRegistration';
// import SEO from '../components/SEO';
// import { generateBreadcrumbs, formatDateForSchema, truncateText, stripHtml, formatPrice } from '../utils/seoUtils';
import { useAuthStore } from '../stores/authStore';
import { useCart } from '../contexts/CartContext';
import { useEventRegister } from '../api/hooks/index';
import { extractIdFromParam } from '../api/codeMapping';
import { toast } from 'react-toastify';
import './EventDetail.css';

const EventDetail: React.FC = () => {
  const { eventId: eventParam } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, token, validateToken, 
    // requireAuth
   } = useAuthStore();
  const { cartCount } = useCart();
  
  // const [isAuthValidated, setIsAuthValidated] = useState(false);
  const [triggerRegistration, setTriggerRegistration] = useState(false);
  
  // Extract actual event ID from URL parameter (handles both old ID format and new SEO format)
  const eventId = eventParam ? extractIdFromParam(eventParam) : null;
  

  const eventRegisterQuery = useEventRegister(triggerRegistration && eventId ? eventId : '');
  
  // const eventContent = undefined;

  // Handle event registration results
  useEffect(() => {
    if (eventRegisterQuery.data && triggerRegistration) {
      const result = eventRegisterQuery.data;
      if (result.status === 200 && result.content) {
        toast.success('🎉 Registration Successful! Your event registration has been completed successfully.', {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
      } else {
        const errorMsg = result.message || result.error || 'Registration failed. Please try again.';
        toast.error(`❌ Registration Failed: ${errorMsg}`, {
          position: 'bottom-right',
          autoClose: 1500,
          theme: 'dark',
        });
      }
      setTriggerRegistration(false);
    }

    if (eventRegisterQuery.error && triggerRegistration) {
      // Safely extract error message from Axios error or fallback to generic message
      let errorMessage = 'An unexpected error occurred during registration.';
      if (eventRegisterQuery.error && typeof eventRegisterQuery.error === 'object' && 'response' in eventRegisterQuery.error) {
        const axiosError = eventRegisterQuery.error as any;
        errorMessage = axiosError.response?.data?.error || axiosError.message || errorMessage;
      } else if (eventRegisterQuery.error.message) {
        errorMessage = eventRegisterQuery.error.message;
      }
      
      toast.error(`❌ Registration Failed: ${errorMessage}`, {
        position: 'bottom-right',
        autoClose: 1500,
        theme: 'dark',
      });
      setTriggerRegistration(false);
    }
  }, [eventRegisterQuery.data, eventRegisterQuery.error, triggerRegistration]);

  // Validate authentication on component mount and when auth state changes
  useEffect(() => {
    const validateAuth = async () => {
      if (isAuthenticated && token) {
        // Validate token format and presence
        const isValidToken = validateToken();
        if (!isValidToken) {
          // Auto logout if token is invalid
          useAuthStore.getState().logout();
          // setIsAuthValidated(false);
        } else {
          // setIsAuthValidated(true);
        }
      } else {
        // setIsAuthValidated(false);
      }
    };

    validateAuth();
  }, [isAuthenticated, token, validateToken]);

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  const handleCartClick = () => {
    navigate('/cart', { state: { from: `/event-detail/${eventParam || ''}` } });
  };

  // const handleEventRegister = async () => {
  //   // Enhanced authentication check
  //   const authSuccess = requireAuth(() => {}, 'register for event');
  //   if (!authSuccess || !isAuthValidated) {
  //     toast.warning('Please login first to register for this event.', {
  //       position: 'bottom-right',
  //       autoClose: 1500,
  //       theme: 'dark',
  //     });
  //     navigate('/login');
  //     return;
  //   }

  //   if (!eventId) {
  //     toast.error('Event not found or invalid event code.', {
  //       position: 'bottom-right',
  //       autoClose: 1500,
  //       theme: 'dark',
  //     });
  //     return;
  //   }

  //   // Validate event ID format
  //   if (!eventId.match(/^\d+$/)) {
  //     toast.error('Event ID format is invalid.', {
  //       position: 'bottom-right',
  //       autoClose: 1500,
  //       theme: 'dark',
  //     });
  //     return;
  //   }
  //   // Trigger the registration query
  //   setTriggerRegistration(true);
  // };

  // const handleMerchantRegistration = () => {
  //   if (eventId) {
  //     navigate(`/merchant-registration/${eventId}`);
  //   } else {
  //     console.error('❌ No event ID available for merchant registration');
  //   }
  // };

  // const handlePublicRegistration = () => {
  //   if (eventId) {
  //     navigate(`/public-registration/${eventId}`);
  //   } else {
  //     console.error('❌ No event ID available for public registration');
  //   }
  // };

  // if (eventByIdQuery.isLoading) {
  //   return (
  //     <div className="event-detail-page">
  //       <AppbarDefault
  //         title="Detail Event"
  //         onBack={handleBackClick}
  //         onCartClick={handleCartClick}
  //         cartCount={cartCount}
  //         defaultBack="/event"
  //       />
  //       <div className="event-detail-loading">
  //         <p>Memuat detail event...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!eventContent) {
  //   return (
  //     <div className="event-detail-page">
  //       <AppbarDefault
  //         title="Detail Event"
  //         onBack={handleBackClick}
  //         onCartClick={handleCartClick}
  //         cartCount={cartCount}
  //         defaultBack="/event"
  //       />
  //       <div className="event-detail-loading">
  //         <p>Data event tidak tersedia</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="event-detail-page">
      {/* <SEO 
        title={`${eventContent.name} • ${eventContent.chapter} / ${eventContent.dates} - ${eventContent.type_desc} | LapakBenz - Platform Komunitas & Event Indonesia`}
        description={truncateText(stripHtml(eventContent.desc), 155) + ` Event ${eventContent.chapter} pada ${eventContent.dates} - ${eventContent.time}. ${eventContent.fee > 0 ? `Biaya kontribusi: ${formatPrice(eventContent.fee)}` : 'Gratis'}. Daftar sekarang di lapakBenz!`}
        keywords={`${eventContent.name.toLowerCase()}, event ${eventContent.chapter.toLowerCase()}, ${eventContent.type_desc.toLowerCase()}, event lapakbenz, event komunitas indonesia, ${eventContent.dates}, ${eventContent.chapter}`}
        image={eventContent.image}
        schemaType="Event"
        publishedTime={formatDateForSchema(eventContent.dates)}
        section="Event"
        tags={[eventContent.chapter, eventContent.type_desc, 'Event', 'Komunitas']}
        breadcrumbs={generateBreadcrumbs('event', eventContent.name)}
      /> */}
      <AppbarDefault
        title="Detail Event"
        onBack={handleBackClick}
        onCartClick={handleCartClick}
        cartCount={cartCount}
        defaultBack="/event"
      />
      
      <div className="event-detail-content">
        {/* <img
          src={eventContent.image}
          alt={eventContent.name}
          className="event-detail-image"
        /> */}
        
        <div className="event-detail-body">
          <h3 className="event-detail-title">
            {/* {eventContent.name} */}
          </h3>
          
          <div className="event-detail-info">
            <div className="event-detail-column">
              <div className="event-info-item">
                <b>Tanggal Event:</b>
                <br />
                {/* {eventContent.dates} - {eventContent.time} */}
              </div>
              <div className="event-info-item">
                <b>Chapter:</b>
                <br />
                {/* {eventContent.chapter} */}
              </div>
              <div className="event-info-item">
                <b>Tipe:</b>
                <br />
                {/* {eventContent.type_desc} */}
              </div>
              <div className="event-info-item">
                <b>Deskripsi:</b>
                <br />
                {/* {eventContent.desc} */}
              </div>
            </div>
            
            <div className="event-detail-column">
              <div className="event-info-item">
                <b>Minimal Peserta:</b>
                <br />
                {/* {eventContent.minimum_participants} */}
              </div>
              <div className="event-info-item">
                <b>Biaya Kontribusi:</b>
                <br />
                {/* {eventContent.fee} */}
              </div>
              <div className="event-info-item">
                <b>Status:</b>
                <br />
                {/* {eventContent.done_desc} */}
              </div>
            </div>
          </div>

          {/* <EventRegistration
            isAuthenticated={isAuthenticated && isAuthValidated}
            isPending={eventRegisterQuery.isFetching && triggerRegistration}
            onRegister={handleEventRegister}
          /> */}

          {/* {(eventContent.allow_merchant === 1 || eventContent.allow_public === 1) && (
            <div className="registration-navigation">
              <div className="registration-buttons">
                {eventContent.allow_merchant === 1 && (
                  <button
                    onClick={handleMerchantRegistration}
                    className="registration-nav-button merchant"
                  >
                    <div className="nav-button-content">
                      <span className="nav-button-icon">🏪</span>
                      <span>Registrasi Merchant</span>
                    </div>
                  </button>
                )}

                {eventContent.allow_public === 1 && (
                  <button
                    onClick={handlePublicRegistration}
                    className="registration-nav-button public"
                  >
                    <div className="nav-button-content">
                      <span className="nav-button-icon">👤</span>
                      <span>Registrasi Umum</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default EventDetail;